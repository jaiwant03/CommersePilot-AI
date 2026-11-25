const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/env');
const Delivery = require('../models/Delivery.model');
const Order = require('../models/Order.model');
const Customer = require('../models/Customer.model');
const Store = require('../models/Store.model');
const User = require('../models/User.model');
const AutomationLog = require('../models/AutomationLog.model');
const VerificationToken = require('../models/VerificationToken.model');
const emailService = require('./emailService');

const HTTP_TIMEOUT_MS = 8000;

/**
 * Failed Delivery Recovery (NDR) Automation Service Module
 * Dispatches customer recovery emails, processes customer reschedule responses, and notifies sellers
 */
const deliveryAutomationService = {
  /**
   * Handle Failed Delivery / NDR Event
   */
  handleFailedDelivery: async (deliveryId, storeId, failureDetails = {}) => {
    const startTime = Date.now();
    const idempotencyKey = `ndr-recovery-${deliveryId}-${Date.now()}`;

    // 1. Fetch Delivery and linked Order
    const delivery = await Delivery.findOne({ _id: deliveryId, store: storeId }).populate('order');
    if (!delivery) {
      throw new Error(`Delivery record ${deliveryId} not found`);
    }

    const order = delivery.order;
    const store = await Store.findById(storeId);

    const ndrReason = failureDetails.reason || delivery.ndrReason || 'Customer unavailable at delivery premises';
    const attempts = delivery.attemptsCount || 1;

    const payload = {
      deliveryId: delivery._id,
      awb: delivery.awb,
      courier: delivery.courier,
      status: delivery.status,
      ndrReason,
      attemptsCount: attempts,
      order: {
        orderId: order?._id,
        orderNumber: order?.orderNumber,
        totalAmount: order?.totalAmount,
        paymentMethod: order?.paymentMethod
      },
      customer: {
        fullName: order?.customer?.fullName,
        email: order?.customer?.email,
        phone: order?.customer?.phone,
        address: order?.customer?.address
      },
      timestamp: new Date().toISOString()
    };

    let result = null;
    let executionMode = 'DEMO_SIMULATION';
    const webhookUrl = config.n8n.deliveryWebhookUrl;

    // 2. Transmit to n8n Webhook if configured, else execute structured demo logic
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const response = await axios.post(webhookUrl, payload, {
          timeout: HTTP_TIMEOUT_MS,
          headers: {
            'Content-Type': 'application/json',
            'X-CommercePilot-Secret': config.n8n.webhookSecret,
            'X-Idempotency-Key': idempotencyKey
          }
        });

        if (response.data && response.data.recoveryAction) {
          result = response.data;
          executionMode = 'LIVE_N8N';
        }
      } catch (webhookErr) {
        console.warn(`[Delivery Automation] n8n webhook error (${webhookErr.message}). Switching to Demo Mode.`);
        executionMode = 'DEMO_SIMULATION';
      }
    }

    if (!result) {
      result = {
        recoveryAction: 'EMAIL_RESCHEDULE_LINK',
        recommendedSlot: 'Next Business Day (2 PM - 6 PM)',
        ndrAttribution: ndrReason.includes('address') ? 'ADDRESS_INCOMPLETE' : 'CUSTOMER_PREMISES_LOCKED',
        isDemoSimulation: executionMode === 'DEMO_SIMULATION'
      };
    }

    // Resolve customer email (explicit override -> order.customer.email -> Customer collection lookup)
    let buyerEmail = (failureDetails.email || order?.customer?.email || '').trim();
    if (!buyerEmail && order?.customer?.id) {
      const custDoc = await Customer.findById(order.customer.id).select('email').lean();
      buyerEmail = (custDoc?.email || '').trim();
    }

    // 3. Generate secure, expiring reschedule token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenDoc = await VerificationToken.create({
      token: rawToken,
      type: 'DELIVERY_RESCHEDULE',
      store: storeId,
      delivery: delivery._id,
      order: order?._id,
      metadata: {
        awb: delivery.awb,
        courier: delivery.courier,
        orderNumber: order?.orderNumber,
        customerEmail: buyerEmail
      },
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    });

    const rescheduleUrl = `${config.clientUrl}/reschedule-delivery?token=${rawToken}`;

    // 4. Dispatch Email to Customer requesting reschedule / landmark
    const emailRes = buyerEmail
      ? await emailService.sendDeliveryRecoveryEmail({
          delivery,
          order,
          customer: { ...(order?.customer?.toObject?.() || order?.customer), email: buyerEmail },
          store,
          rescheduleUrl
        })
      : { success: false, reason: 'No customer email provided' };

    // 5. Update Delivery Tracking Event (without falsely claiming courier has been contacted)
    delivery.trackingEvents.push({
      status: 'NDR_EMAIL_SENT',
      location: delivery.destination?.city || 'Local Hub',
      message: emailRes.success
        ? `Automated recovery email dispatched to buyer (${buyerEmail}). Awaiting buyer slot confirmation.`
        : `NDR logged (${buyerEmail ? `email delivery warning: ${emailRes.error || emailRes.reason}` : 'no customer email available'}).`,
      timestamp: new Date()
    });
    await delivery.save();

    const durationMs = Date.now() - startTime;

    // 6. Log to AutomationLog
    const logDoc = await AutomationLog.create({
      store: storeId,
      workflowName: 'DELIVERY_RECOVERY_NDR',
      triggerEvent: `COURIER_NDR_${delivery.awb}`,
      status: 'SUCCESS',
      executionMode,
      idempotencyKey,
      referenceDelivery: delivery._id,
      referenceOrder: order?._id,
      requestPayload: payload,
      responsePayload: result,
      durationMs,
      emailSent: Boolean(emailRes.success),
      emailType: emailRes.success ? 'DELIVERY_RECOVERY_LINK' : 'NONE',
      emailRecipient: buyerEmail || null,
      errorMessage: emailRes.error || null
    });

    return {
      success: true,
      delivery,
      action: result.recoveryAction,
      log: logDoc,
      rescheduleToken: tokenDoc.token,
      emailSent: Boolean(emailRes.success),
      emailRecipient: buyerEmail || null,
      emailError: emailRes.error || emailRes.reason || null,
      executionMode
    };
  },

  /**
   * Process Customer Reschedule Response
   */
  processCustomerReschedule: async (tokenString, responseData = {}) => {
    const tokenDoc = await VerificationToken.findOne({
      token: tokenString,
      type: 'DELIVERY_RESCHEDULE',
      isUsed: false
    });

    if (!tokenDoc) {
      throw new Error('Invalid, expired or already used rescheduling token.');
    }

    if (new Date() > tokenDoc.expiresAt) {
      throw new Error('This delivery rescheduling link has expired.');
    }

    const delivery = await Delivery.findById(tokenDoc.delivery).populate('order');
    if (!delivery) {
      throw new Error('Associated delivery document not found.');
    }

    const preferredDate = responseData.preferredDate || 'Tomorrow';
    const preferredSlot = responseData.preferredSlot || '2 PM - 6 PM';
    const updatedAddress = responseData.updatedAddress || '';
    const landmark = responseData.landmark || '';

    // Record response on delivery document
    delivery.trackingEvents.push({
      status: 'RESCHEDULE_CONFIRMED_BY_BUYER',
      location: delivery.destination?.city || 'Customer Local Area',
      message: `Buyer confirmed re-attempt for: ${preferredDate} (${preferredSlot}). Landmark: ${landmark || 'None provided'}.`,
      timestamp: new Date()
    });

    // Mark delivery status back to out for delivery with confirmed response
    delivery.customerResponse = 'CONFIRMED';
    delivery.recoveryStatus = 'RECOVERED';
    delivery.status = 'OUT_FOR_DELIVERY';
    delivery.ndrReason = `Buyer confirmed slot: ${preferredDate} (${preferredSlot})`;
    await delivery.save();

    // Update parent order status and history
    if (delivery.order) {
      const orderDoc = await Order.findById(delivery.order._id || delivery.order);
      if (orderDoc) {
        orderDoc.orderStatus = 'DISPATCHED';
        orderDoc.history.push({
          status: 'DISPATCHED',
          note: `Buyer confirmed redelivery slot (${preferredDate}, ${preferredSlot}) via NDR recovery link`
        });
        await orderDoc.save();
      }
    }

    tokenDoc.isUsed = true;
    tokenDoc.respondedAt = new Date();
    tokenDoc.responseValue = `RESCHEDULED_${preferredDate}`;
    tokenDoc.metadata = { ...tokenDoc.metadata, preferredDate, preferredSlot, updatedAddress, landmark };
    await tokenDoc.save();

    // Notify seller & buyer of resolution
    const store = await Store.findById(delivery.store);
    const ownerUser = store?.owner ? await User.findById(store.owner).select('email').lean() : null;
    const sellerEmail = store?.settings?.alertEmail || store?.details?.supportEmail || ownerUser?.email || config.smtp.user;
    if (sellerEmail) {
      await emailService.dispatchEmail({
        to: sellerEmail,
        subject: `NDR Resolved by Buyer: Order #${delivery.order?.orderNumber} (AWB: ${delivery.awb})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0F172A; color: #E2E8F0; border-radius: 8px;">
            <h3 style="color: #10B981;">NDR Recovery Resolved by Buyer</h3>
            <p>Customer <strong>${delivery.order?.customer?.fullName}</strong> has responded to the automated NDR recovery email:</p>
            <ul>
              <li><strong>AWB:</strong> ${delivery.awb} (${delivery.courier})</li>
              <li><strong>Order:</strong> #${delivery.order?.orderNumber}</li>
              <li><strong>Preferred Slot:</strong> ${preferredDate} (${preferredSlot})</li>
              ${landmark ? `<li><strong>Landmark Note:</strong> ${landmark}</li>` : ''}
              ${updatedAddress ? `<li><strong>Updated Address:</strong> ${updatedAddress}</li>` : ''}
            </ul>
            <p style="font-size: 12px; color: #94A3B8;">Status updated in CommercePilot AI operational workspace.</p>
          </div>
        `,
        senderName: store?.name || 'CommercePilot AI',
        eventId: `seller-ndr-update-${delivery._id}`
      });
    }

    if (delivery.order?.customer?.email) {
      await emailService.sendOrderStatusEmail({
        order: delivery.order,
        customer: delivery.order.customer,
        store,
        status: 'OUT_FOR_DELIVERY',
        note: `Your delivery re-attempt is scheduled for ${preferredDate} (${preferredSlot}).`
      });
    }

    return {
      success: true,
      message: 'Delivery re-attempt preferences recorded successfully. Your parcel will be re-attempted accordingly.',
      delivery
    };
  }
};

module.exports = deliveryAutomationService;
