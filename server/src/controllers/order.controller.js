const Order = require('../models/Order.model');
const Customer = require('../models/Customer.model');
const Product = require('../models/Product.model');
const Delivery = require('../models/Delivery.model');
const InventoryMovement = require('../models/InventoryMovement.model');

/**
 * Get paginated orders with status & payment filters
 */
const getOrders = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { 
      search, 
      status, 
      paymentMethod, 
      riskLevel,
      page = 1, 
      limit = 20, 
      sort = '-createdAt' 
    } = req.query;

    const query = { store: storeId };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.fullName': searchRegex },
        { 'customer.phone': searchRegex },
        { 'customer.address.city': searchRegex }
      ];
    }

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      query.paymentMethod = paymentMethod;
    }

    if (riskLevel && riskLevel !== 'ALL') {
      query.riskLevel = riskLevel;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(query).sort(sort).skip(skip).limit(limitNum).populate('delivery'),
      Order.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order details with linked delivery and history
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      store: req.store._id
    }).populate('delivery');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new order with automated COD risk scoring and inventory deduction
 */
const createOrder = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const {
      customer,
      items,
      shippingFee = 0,
      discount = 0,
      paymentMethod = 'COD',
      notes = ''
    } = req.body;

    const custName = customer.fullName || customer.name || '';
    const custPhone = customer.phone || '';

    if (!customer || !custName || !custPhone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    // Normalize address
    const normalizedAddress = typeof customer.address === 'object' && customer.address !== null
      ? {
          street: customer.address.street || customer.address.address || 'Standard Address',
          city: customer.address.city || customer.city || 'Mumbai',
          state: customer.address.state || customer.state || 'Maharashtra',
          pincode: customer.address.pincode || customer.address.postalCode || customer.postalCode || '400001',
          country: customer.address.country || 'India'
        }
      : {
          street: customer.address || 'Standard Address',
          city: customer.city || 'Mumbai',
          state: customer.state || 'Maharashtra',
          pincode: customer.postalCode || '400001',
          country: 'India'
        };

    // 1. Calculate items subtotal and prepare items payload
    let subtotal = 0;
    const formattedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice !== undefined ? item.unitPrice : item.price) || 0;
      const totalPrice = quantity * unitPrice;
      subtotal += totalPrice;

      formattedItems.push({
        product: item.productId || item.product || null,
        title: item.title || item.productTitle || 'Catalog Product',
        sku: item.sku || 'SKU-ITEM',
        quantity,
        unitPrice,
        totalPrice
      });
    }

    const totalAmount = subtotal + Number(shippingFee) - Number(discount);

    // 2. Generate sequential order number
    const orderCount = await Order.countDocuments({ store: storeId });
    const orderNumber = `CP-${1000 + orderCount + 1}`;

    // 3. Upsert Customer record
    let customerDoc = await Customer.findOne({ store: storeId, phone: custPhone.trim() });
    if (!customerDoc) {
      customerDoc = new Customer({
        store: storeId,
        fullName: custName.trim(),
        email: customer.email ? customer.email.trim() : '',
        phone: custPhone.trim(),
        address: normalizedAddress
      });
    }
    customerDoc.ordersCount += 1;
    customerDoc.totalSpent += totalAmount;
    await customerDoc.save();

    // 4. Calculate COD risk score based on order value, customer history, and missing address components
    let riskScore = 15;
    if (paymentMethod === 'COD') {
      if (totalAmount > 3000) riskScore += 25;
      if (customerDoc.rtoHistoryCount > 0) riskScore += 40;
      if (!normalizedAddress.street || normalizedAddress.street.length < 10) riskScore += 20;
    } else {
      riskScore = 5; // Prepaid has negligible RTO risk
    }
    riskScore = Math.min(riskScore, 98);

    const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
    const needsVerification = riskLevel === 'HIGH' || (riskLevel === 'MEDIUM' && paymentMethod === 'COD');

    // 5. Create Order
    const order = new Order({
      store: storeId,
      orderNumber,
      customer: {
        id: customerDoc._id,
        fullName: custName.trim(),
        email: customer.email ? customer.email.trim() : '',
        phone: custPhone.trim(),
        address: normalizedAddress
      },
      items: formattedItems,
      subtotal,
      shippingFee: Number(shippingFee),
      discount: Number(discount),
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'PREPAID' ? 'PAID' : 'PENDING',
      orderStatus: needsVerification ? 'ON_HOLD' : 'CONFIRMED',
      riskScore,
      riskLevel,
      needsVerification,
      notes,
      history: [
        {
          status: needsVerification ? 'ON_HOLD' : 'CONFIRMED',
          note: needsVerification ? 'Order placed; placed on hold for COD verification' : 'Order placed and confirmed'
        }
      ]
    });

    await order.save();

    // 6. Automatically generate initial Delivery record
    const randomAwb = `DEL${Math.floor(10000000 + Math.random() * 90000000)}`;
    const delivery = new Delivery({
      store: storeId,
      order: order._id,
      awb: randomAwb,
      courier: 'Delhivery',
      status: 'PENDING',
      destination: {
        city: order.customer.address.city,
        state: order.customer.address.state,
        pincode: order.customer.address.pincode
      },
      trackingEvents: [
        { status: 'PENDING', location: order.customer.address.city, message: 'Order created, awaiting courier manifestation' }
      ]
    });

    await delivery.save();
    order.delivery = delivery._id;
    await order.save();

    // 7. Deduct stock and log InventoryMovements
    for (const it of formattedItems) {
      if (it.product) {
        const prod = await Product.findOne({ _id: it.product, store: storeId });
        if (prod) {
          const previousStock = prod.stockQuantity;
          const newStock = Math.max(0, previousStock - it.quantity);
          prod.stockQuantity = newStock;
          await prod.save();

          await InventoryMovement.create({
            store: storeId,
            product: prod._id,
            sku: prod.sku,
            type: 'ORDER_DEDUCTION',
            quantityChanged: -it.quantity,
            previousStock,
            newStock,
            reason: `Deducted for Order #${order.orderNumber}`,
            referenceOrder: order._id
          });
        }
      }
    }

    // 8. Trigger Automated Order Risk Evaluation Workflow
    try {
      const orderAutomationService = require('../services/orderAutomationService');
      await orderAutomationService.analyzeOrder(order._id, storeId);
    } catch (autoErr) {
      console.warn(`[Order Controller] Automated order analysis warning:`, autoErr.message);
    }

    // Re-fetch updated order document
    const updatedOrder = await Order.findById(order._id);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: updatedOrder || order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit allowed order fields (status, shipping address, notes, needsVerification)
 */
const updateOrder = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const order = await Order.findOne({ _id: req.params.id, store: storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const { orderStatus, notes, address, needsVerification, paymentStatus } = req.body;

    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.history.push({
        status: orderStatus,
        note: `Status updated to ${orderStatus} by merchant`
      });

      // Synchronize with delivery if dispatched
      if (orderStatus === 'DISPATCHED' && order.delivery) {
        await Delivery.findByIdAndUpdate(order.delivery, {
          status: 'SHIPPED',
          $push: { trackingEvents: { status: 'SHIPPED', message: 'Package handed over to courier' } }
        });
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    if (needsVerification !== undefined) {
      order.needsVerification = Boolean(needsVerification);
    }

    if (address) {
      order.customer.address = {
        street: address.street || order.customer.address.street,
        city: address.city || order.customer.address.city,
        state: address.state || order.customer.address.state,
        pincode: address.pincode || order.customer.address.pincode,
        country: address.country || order.customer.address.country || 'India'
      };
      order.history.push({
        status: order.orderStatus,
        note: 'Customer shipping address updated'
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel or delete order
 */
const deleteOrder = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const order = await Order.findOne({ _id: req.params.id, store: storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = 'CANCELLED';
    order.history.push({ status: 'CANCELLED', note: 'Order cancelled by merchant' });
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Action 1: Approve Order (Sets status to CONFIRMED, clears needsVerification)
 */
const approveOrder = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const order = await Order.findOne({ _id: req.params.id, store: storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = 'CONFIRMED';
    order.needsVerification = false;
    order.reviewStatus = 'APPROVED';
    order.history.push({
      status: 'CONFIRMED',
      note: 'Order manually approved by merchant; cleared for warehouse fulfillment'
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} approved successfully.`,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Action 2: Request Customer Confirmation (Dispatches verification email with token)
 */
const requestConfirmation = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const order = await Order.findOne({ _id: req.params.id, store: storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const crypto = require('crypto');
    const VerificationToken = require('../models/VerificationToken.model');
    const emailService = require('../services/emailService');
    const config = require('../config/env');

    const rawToken = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      token: rawToken,
      type: 'ORDER_CONFIRMATION',
      store: storeId,
      order: order._id,
      metadata: {
        orderNumber: order.orderNumber,
        customerEmail: order.customer?.email,
        riskScore: order.riskScore || 65
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const verificationUrl = `${config.clientUrl}/verify-order?token=${rawToken}`;
    await emailService.sendCodVerificationEmail({
      order,
      customer: order.customer,
      store: { name: req.store.name || 'CommercePilot Store' },
      verificationUrl,
      token: rawToken
    });

    order.orderStatus = 'ON_HOLD';
    order.needsVerification = true;
    order.reviewStatus = 'CONFIRMATION_REQUESTED';
    order.history.push({
      status: 'ON_HOLD',
      note: `1-Click verification dispatched to buyer (${order.customer?.email || 'customer'}) by merchant`
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Customer confirmation link dispatched for Order #${order.orderNumber}.`,
      order,
      verificationUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Action 3: Flag Order for Manual Review
 */
const flagForReview = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const order = await Order.findOne({ _id: req.params.id, store: storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const reason = req.body.reason || 'Flagged for manual review by merchant';
    order.orderStatus = 'ON_HOLD';
    order.needsVerification = true;
    order.reviewStatus = 'FLAGGED_MANUAL_REVIEW';
    order.notes = `${order.notes ? order.notes + ' | ' : ''}Manual Review: ${reason}`;
    order.history.push({
      status: 'ON_HOLD',
      note: `Flagged for manual review: ${reason}`
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} flagged for manual review.`,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Action 4: Mark Order as Reviewed
 */
const markReviewed = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const order = await Order.findOne({ _id: req.params.id, store: storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.reviewStatus = 'REVIEWED';
    order.history.push({
      status: order.orderStatus,
      note: 'Marked as reviewed by merchant'
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} marked as reviewed.`,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Action 5: Re-run / Trigger COD Risk Analysis
 */
const analyzeOrderRisk = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const orderAutomationService = require('../services/orderAutomationService');
    const result = await orderAutomationService.analyzeOrder(req.params.id, storeId);

    return res.status(200).json({
      success: true,
      message: 'Order risk analysis completed.',
      result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  approveOrder,
  requestConfirmation,
  flagForReview,
  markReviewed,
  analyzeOrderRisk
};
