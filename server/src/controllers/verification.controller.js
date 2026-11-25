const VerificationToken = require('../models/VerificationToken.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const InventoryMovement = require('../models/InventoryMovement.model');
const Delivery = require('../models/Delivery.model');
const PurchaseOrder = require('../models/PurchaseOrder.model');
const Store = require('../models/Store.model');
const User = require('../models/User.model');
const config = require('../config/env');
const inventoryAutomationService = require('../services/inventoryAutomationService');
const deliveryAutomationService = require('../services/deliveryAutomationService');
const emailService = require('../services/emailService');

/**
 * Get Token Details for Public Verification Screens
 */
const getTokenInfo = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token required.' });
    }

    const tokenDoc = await VerificationToken.findOne({ token })
      .populate('order')
      .populate('delivery')
      .populate('purchaseOrder');

    if (!tokenDoc) {
      return res.status(404).json({ success: false, message: 'Invalid or non-existent verification token.' });
    }

    const isExpired = new Date() > tokenDoc.expiresAt;
    const store = await Store.findById(tokenDoc.store);

    return res.status(200).json({
      success: true,
      token: tokenDoc.token,
      type: tokenDoc.type,
      isUsed: tokenDoc.isUsed,
      isExpired,
      order: tokenDoc.order,
      delivery: tokenDoc.delivery,
      purchaseOrder: tokenDoc.purchaseOrder,
      storeName: store?.name || 'CommercePilot Store',
      metadata: tokenDoc.metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Order Confirmation Action
 */
const confirmOrder = async (req, res, next) => {
  try {
    const { token, action } = req.body; // action: 'confirm' or 'cancel'

    const tokenDoc = await VerificationToken.findOne({
      token,
      type: 'ORDER_CONFIRMATION',
      isUsed: false
    });

    if (!tokenDoc) {
      return res.status(400).json({ success: false, message: 'Invalid, used, or expired confirmation token.' });
    }

    if (new Date() > tokenDoc.expiresAt) {
      return res.status(400).json({ success: false, message: 'Confirmation link has expired. Please contact support.' });
    }

    const order = await Order.findById(tokenDoc.order);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order document not found.' });
    }

    const store = await Store.findById(tokenDoc.store);
    const ownerUser = store?.owner ? await User.findById(store.owner).select('email').lean() : null;
    const sellerEmail = store?.settings?.alertEmail || store?.details?.supportEmail || ownerUser?.email || config.smtp.user;

    if (action === 'cancel') {
      order.orderStatus = 'CANCELLED';
      order.history.push({
        status: 'CANCELLED',
        note: 'Customer opted to cancel order via email verification link.'
      });

      // Replenish product stock if not already restocked
      if (!order.isRestocked) {
        for (const item of order.items) {
          if (item.product) {
            const prod = await Product.findOne({ _id: item.product, store: tokenDoc.store });
            if (prod) {
              const previousStock = prod.stockQuantity;
              prod.stockQuantity = previousStock + item.quantity;
              await prod.save();

              await InventoryMovement.create({
                store: tokenDoc.store,
                product: prod._id,
                sku: prod.sku,
                type: 'RETURN_RESTOCK',
                quantityChanged: item.quantity,
                previousStock,
                newStock: prod.stockQuantity,
                reason: `Customer cancelled Order #${order.orderNumber} via verification link`,
                referenceOrder: order._id
              });
            }
          }
        }
        order.isRestocked = true;
      }

      if (order.delivery) {
        await Delivery.findByIdAndUpdate(order.delivery, {
          status: 'RTO',
          $push: { trackingEvents: { status: 'RTO', message: 'Cancelled by customer via verification link' } }
        });
      }

      await order.save();

      tokenDoc.isUsed = true;
      tokenDoc.respondedAt = new Date();
      tokenDoc.responseValue = 'CANCELLED_BY_CUSTOMER';
      await tokenDoc.save();

      // Notify seller
      if (sellerEmail) {
        await emailService.dispatchEmail({
          to: sellerEmail,
          subject: `Order #${order.orderNumber} Cancelled by Customer via Verification Link`,
          html: `<p>Customer <strong>${order.customer?.fullName}</strong> cancelled COD Order #${order.orderNumber}. Inventory hold released.</p>`,
          senderName: store?.name || 'CommercePilot AI',
          eventId: `order-cancel-${order._id}`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Order #${order.orderNumber} has been successfully cancelled as per your request.`,
        orderStatus: 'CANCELLED'
      });
    }

    // Default: Customer Confirmed Order
    order.orderStatus = 'CONFIRMED';
    order.needsVerification = false;
    order.reviewStatus = 'APPROVED';
    order.history.push({
      status: 'CONFIRMED',
      note: 'Buyer confirmed commitment via secure email verification link.'
    });
    await order.save();

    tokenDoc.isUsed = true;
    tokenDoc.respondedAt = new Date();
    tokenDoc.responseValue = 'CONFIRMED_BY_CUSTOMER';
    await tokenDoc.save();

    // Send confirmation receipt to buyer if email exists
    if (order.customer?.email) {
      await emailService.sendOrderConfirmationEmail({
        order,
        customer: order.customer,
        store: store || { name: 'CommercePilot Store' }
      });
    }

    // Notify seller
    if (sellerEmail) {
      await emailService.dispatchEmail({
        to: sellerEmail,
        subject: `✓ Order #${order.orderNumber} Confirmed by Customer (Ready to Pack)`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0F172A; color: #E2E8F0; border-radius: 8px;">
            <h3 style="color: #10B981;">Order Confirmed by Buyer</h3>
            <p>Customer <strong>${order.customer?.fullName}</strong> has confirmed COD Order <strong>#${order.orderNumber}</strong> (Amount: ₹${order.totalAmount}).</p>
            <p>Verification status cleared. The parcel is now ready for packaging and courier pickup.</p>
          </div>
        `,
        senderName: store?.name || 'CommercePilot AI',
        eventId: `order-confirm-seller-${order._id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Thank you! Order #${order.orderNumber} has been verified and confirmed. Your order is now being packed.`,
      orderStatus: 'CONFIRMED'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Delivery Rescheduling Action
 */
const rescheduleDelivery = async (req, res, next) => {
  try {
    const { token, preferredDate, preferredSlot, updatedAddress, landmark } = req.body;

    const result = await deliveryAutomationService.processCustomerReschedule(token, {
      preferredDate,
      preferredSlot,
      updatedAddress,
      landmark
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Merchant Purchase Order Approval Action
 */
const approvePo = async (req, res, next) => {
  try {
    const { token, action } = req.body; // action: 'approve' or 'reject'
    const userId = req.user?._id || null;

    const result = await inventoryAutomationService.processPoApproval(token, action, userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTokenInfo,
  confirmOrder,
  rescheduleDelivery,
  approvePo
};
