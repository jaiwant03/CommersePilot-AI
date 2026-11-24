const Delivery = require('../models/Delivery.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const InventoryMovement = require('../models/InventoryMovement.model');

/**
 * Get paginated deliveries with search and status filtering
 */
const getDeliveries = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { search, status, courier, page = 1, limit = 20, sort = '-updatedAt' } = req.query;

    const query = { store: storeId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (courier && courier !== 'ALL') {
      query.courier = courier;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { awb: searchRegex },
        { 'destination.city': searchRegex },
        { 'destination.pincode': searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [deliveries, totalCount] = await Promise.all([
      Delivery.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('order', 'orderNumber customer totalAmount paymentMethod orderStatus'),
      Delivery.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      deliveries,
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
 * Get single delivery by ID
 */
const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      store: req.store._id
    }).populate('order');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    return res.status(200).json({ success: true, delivery });
  } catch (error) {
    next(error);
  }
};

/**
 * Record / simulate live courier delivery events
 * Supports: PENDING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, FAILED (NDR), RTO
 */
const simulateDeliveryEvent = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { eventType, reason, location = 'City Sorting Hub' } = req.body;

    const delivery = await Delivery.findOne({ _id: req.params.id, store: storeId });
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    const validEvents = ['PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RTO'];
    if (!validEvents.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid event type. Must be one of: ${validEvents.join(', ')}`
      });
    }

    delivery.status = eventType;

    let eventMessage = `Status updated to ${eventType}`;
    if (eventType === 'OUT_FOR_DELIVERY') {
      delivery.attemptsCount += 1;
      eventMessage = `Courier executive out for delivery (Attempt #${delivery.attemptsCount})`;
    } else if (eventType === 'FAILED') {
      delivery.ndrReason = reason || 'Customer unavailable at delivery address; contact phone unanswered';
      eventMessage = `Delivery Attempt Failed (NDR): ${delivery.ndrReason}`;
    } else if (eventType === 'DELIVERED') {
      eventMessage = 'Shipment successfully delivered to recipient at doorstep';
    } else if (eventType === 'RTO') {
      delivery.ndrReason = reason || 'Return to Origin initiated: Multiple failed delivery attempts';
      eventMessage = `RTO in transit back to merchant warehouse: ${delivery.ndrReason}`;
    }

    delivery.trackingEvents.push({
      status: eventType,
      location,
      message: eventMessage,
      timestamp: new Date()
    });

    await delivery.save();

    // Synchronize parent Order status
    const order = await Order.findOne({ _id: delivery.order, store: storeId });
    if (order) {
      if (eventType === 'DELIVERED') {
        order.orderStatus = 'DELIVERED';
        if (order.paymentMethod === 'COD') {
          order.paymentStatus = 'PAID';
        }
        order.history.push({ status: 'DELIVERED', note: 'Marked delivered via courier telemetry' });
      } else if (eventType === 'FAILED') {
        order.orderStatus = 'ON_HOLD';
        order.history.push({ status: 'ON_HOLD', note: `NDR event: ${delivery.ndrReason}` });

        // Trigger Automated NDR Delivery Recovery Workflow
        try {
          const deliveryAutomationService = require('../services/deliveryAutomationService');
          deliveryAutomationService.handleFailedDelivery(delivery._id, storeId, { reason: delivery.ndrReason })
            .catch(e => console.warn('[Delivery Controller] NDR auto recovery error:', e.message));
        } catch (ndrErr) {
          console.warn('[Delivery Controller] Failed to trigger NDR automation service:', ndrErr.message);
        }
      } else if (eventType === 'RTO') {
        order.orderStatus = 'CANCELLED';
        order.history.push({ status: 'CANCELLED', note: 'Returned to origin (RTO)' });

        // Restock inventory on RTO
        for (const item of order.items) {
          if (item.product) {
            const prod = await Product.findOne({ _id: item.product, store: storeId });
            if (prod) {
              const previousStock = prod.stockQuantity;
              prod.stockQuantity += item.quantity;
              await prod.save();

              await InventoryMovement.create({
                store: storeId,
                product: prod._id,
                sku: prod.sku,
                type: 'RETURN_RESTOCK',
                quantityChanged: item.quantity,
                previousStock,
                newStock: prod.stockQuantity,
                reason: `Restocked after RTO for Order #${order.orderNumber}`,
                referenceOrder: order._id
              });
            }
          }
        }
      } else if (eventType === 'OUT_FOR_DELIVERY' || eventType === 'SHIPPED') {
        order.orderStatus = 'DISPATCHED';
        order.history.push({ status: 'DISPATCHED', note: `Shipment marked ${eventType}` });
      }
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: `Simulated event "${eventType}" recorded successfully.`,
      delivery
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get formatted WhatsApp recovery message preview for a failed delivery
 */
const getWhatsAppPreview = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const delivery = await Delivery.findOne({ _id: req.params.id, store: storeId })
      .populate('order', 'orderNumber customer totalAmount items');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    const orderNumber = delivery.order?.orderNumber || 'TT10245';
    const storeName = req.store.name || 'Trendy Threads';
    const customerName = delivery.order?.customer?.fullName || delivery.order?.customer?.name || 'Valued Customer';
    const recipientPhone = delivery.order?.customer?.phone || '+91 98765 43210';

    const message = `Hello! Your ${storeName} order ${orderNumber} could not be delivered because you were unavailable. Would you like us to arrange another delivery attempt? Reply YES to request redelivery or contact our support team.`;

    return res.status(200).json({
      success: true,
      preview: {
        deliveryId: delivery._id,
        orderId: delivery.order?._id,
        orderNumber,
        storeName,
        customerName,
        recipientPhone,
        message,
        templateName: 'ndr_recovery_v1',
        recoveryStatus: delivery.recoveryStatus || 'PENDING',
        customerResponse: delivery.customerResponse || 'PENDING',
        currentStatus: delivery.status,
        ndrReason: delivery.ndrReason || 'Customer unavailable at delivery premises',
        isDemoSimulation: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Simulate customer WhatsApp reply (e.g. YES or DECLINED / NO)
 */
const simulateWhatsAppReply = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { reply = 'YES' } = req.body;

    const delivery = await Delivery.findOne({ _id: req.params.id, store: storeId });
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    const normalizedReply = reply.trim().toUpperCase();
    const isYes = normalizedReply === 'YES' || normalizedReply === 'CONFIRM' || normalizedReply === 'Y';

    if (isYes) {
      delivery.customerResponse = 'CONFIRMED';
      delivery.recoveryStatus = 'RECOVERED';
      delivery.status = 'OUT_FOR_DELIVERY';
      delivery.attemptsCount = (delivery.attemptsCount || 1) + 1;
      delivery.whatsappStatus = 'REPLIED';

      delivery.trackingEvents.push({
        status: 'OUT_FOR_DELIVERY',
        location: 'Local Delivery Hub',
        message: 'Customer replied YES via WhatsApp. Next delivery re-attempt scheduled automatically.',
        timestamp: new Date()
      });

      const order = await Order.findOne({ _id: delivery.order, store: storeId });
      if (order) {
        order.orderStatus = 'DISPATCHED';
        order.history.push({
          status: 'DISPATCHED',
          note: 'Customer confirmed redelivery via WhatsApp reply (NDR Recovered)'
        });
        await order.save();
      }

      await delivery.save();

      return res.status(200).json({
        success: true,
        message: 'Customer reply "YES" processed. Delivery re-attempt scheduled and order resumed.',
        delivery,
        recoveryStatus: 'RECOVERED'
      });
    } else {
      delivery.customerResponse = 'DECLINED';
      delivery.recoveryStatus = 'CUSTOMER_DECLINED';
      delivery.whatsappStatus = 'REPLIED';

      delivery.trackingEvents.push({
        status: 'FAILED',
        location: 'Local Delivery Hub',
        message: 'Customer declined redelivery via WhatsApp. Retained at hub for merchant review.',
        timestamp: new Date()
      });

      const order = await Order.findOne({ _id: delivery.order, store: storeId });
      if (order) {
        order.orderStatus = 'ON_HOLD';
        order.history.push({
          status: 'ON_HOLD',
          note: 'Customer declined redelivery via WhatsApp. Order on hold for review.'
        });
        await order.save();
      }

      await delivery.save();

      return res.status(200).json({
        success: true,
        message: 'Customer reply "DECLINED" recorded. Order placed on hold for merchant review.',
        delivery,
        recoveryStatus: 'CUSTOMER_DECLINED'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeliveries,
  getDeliveryById,
  simulateDeliveryEvent,
  getWhatsAppPreview,
  simulateWhatsAppReply
};
