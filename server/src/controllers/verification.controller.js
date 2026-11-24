const VerificationToken = require('../models/VerificationToken.model');
const Order = require('../models/Order.model');
const Delivery = require('../models/Delivery.model');
const PurchaseOrder = require('../models/PurchaseOrder.model');
const Store = require('../models/Store.model');
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

    if (action === 'cancel') {
      order.orderStatus = 'CANCELLED';
      order.history.push({
        status: 'CANCELLED',
        note: 'Customer opted to cancel order via email verification link.'
      });
      await order.save();

      tokenDoc.isUsed = true;
      tokenDoc.respondedAt = new Date();
      tokenDoc.responseValue = 'CANCELLED_BY_CUSTOMER';
      await tokenDoc.save();

      // Notify seller
      const sellerEmail = store?.settings?.alertEmail || store?.details?.supportEmail;
      if (sellerEmail) {
        await emailService.dispatchEmail({
          to: sellerEmail,
          subject: `Order #${order.orderNumber} Cancelled by Customer via Verification Link`,
          html: `<p>Customer <strong>${order.customer?.fullName}</strong> cancelled COD Order #${order.orderNumber}. Inventory hold released.</p>`,
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
    order.history.push({
      status: 'CONFIRMED',
      note: 'Buyer confirmed commitment via secure email verification link.'
    });
    await order.save();

    tokenDoc.isUsed = true;
    tokenDoc.respondedAt = new Date();
    tokenDoc.responseValue = 'CONFIRMED_BY_CUSTOMER';
    await tokenDoc.save();

    // Notify seller
    const sellerEmail = store?.settings?.alertEmail || store?.details?.supportEmail;
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
