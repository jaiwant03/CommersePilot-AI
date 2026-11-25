const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/env');
const Order = require('../models/Order.model');
const Customer = require('../models/Customer.model');
const Product = require('../models/Product.model');
const InventoryMovement = require('../models/InventoryMovement.model');
const Store = require('../models/Store.model');
const User = require('../models/User.model');
const AutomationLog = require('../models/AutomationLog.model');
const VerificationToken = require('../models/VerificationToken.model');
const emailService = require('./emailService');
const { generateGroqCompletion } = require('./groq.service');

const HTTP_TIMEOUT_MS = 8000;

/**
 * Deterministic Explainable COD Risk Scoring Algorithm
 */
const calculateDeterministicCodRisk = (order, customerDoc) => {
  let score = 15;
  const factors = [];

  // Factor 1: Payment method
  if (order.paymentMethod !== 'COD') {
    return {
      score: 5,
      level: 'LOW',
      factors: ['Prepaid transaction: Verified zero RTO payment guarantee'],
      decision: 'PROCEED'
    };
  }

  // Factor 2: High cart order value on COD
  if (order.totalAmount > 4000) {
    score += 30;
    factors.push('High value cash order (> ₹4,000 threshold)');
  } else if (order.totalAmount > 2500) {
    score += 15;
    factors.push('Moderate order value on COD (> ₹2,500)');
  }

  // Factor 3: Address quality & landmark completeness (missing door/house number or landmark)
  const street = order.customer?.address?.street || '';
  const hasDoorOrHouseNumber = /\d/.test(street);
  if (!street || street.length < 12 || !hasDoorOrHouseNumber) {
    score += 25;
    factors.push('Incomplete delivery address; house number or landmark missing');
  }

  // Factor 4: Customer track record in DB
  if (customerDoc) {
    if (customerDoc.rtoHistoryCount > 0) {
      score += 25; // Base 15 + address 25 + RTO 25 = 65 High Risk
      factors.push('Previous failed delivery found in available order history');
    } else if (customerDoc.ordersCount >= 2) {
      score -= 20; // Loyal repeat customer discount
      factors.push('Repeat customer with successful delivery history');
    }
  }

  // Factor 5: Phone number validity heuristic (supports +91 Indian mobile prefix)
  const phone = order.customer?.phone || '';
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.slice(1);
  }
  if (cleanPhone.length !== 10) {
    score += 20;
    factors.push('Non-standard 10-digit mobile number format');
  }

  score = Math.max(5, Math.min(score, 98));

  let level = 'LOW';
  let decision = 'PROCEED';

  if (score >= 65) {
    level = 'HIGH';
    decision = 'REQUEST_CONFIRMATION';
  } else if (score >= 40) {
    level = 'MEDIUM';
    decision = 'REQUEST_CONFIRMATION';
  } else {
    level = 'LOW';
    decision = 'PROCEED';
  }

  let recommendation = 'Proceed with automatic fulfillment';
  if (score >= 40) {
    recommendation = 'Request customer confirmation and review before dispatch';
  }

  return { score, level, factors, decision, recommendation };
};

/**
 * Generate AI explanation for risk assessment
 */
const getAiRiskExplanation = async (order, riskCalculation) => {
  const prompt = `Analyze this ecommerce COD order for potential RTO/delivery risk:
Order Number: ${order.orderNumber}
Total Amount: ₹${order.totalAmount}
Payment Method: ${order.paymentMethod}
Customer: ${order.customer?.fullName} (${order.customer?.address?.city || 'India'})
Address Street: "${order.customer?.address?.street || 'N/A'}"
Deterministic Risk Score: ${riskCalculation.score}/100 (${riskCalculation.level})
Identified Factors: ${riskCalculation.factors.join(', ')}

Provide a concise, 2-sentence professional explanation of why this risk score was assigned and recommendation. Do not recommend rejecting the order outright; recommend verification if risky.`;

  try {
    const explanation = await generateGroqCompletion({
      prompt,
      systemPrompt: 'You are an Indian ecommerce logistics risk analyst for CommercePilot AI. Return concise, fact-based risk explanations without filler.'
    });
    return explanation.trim();
  } catch (err) {
    return `Score ${riskCalculation.score}/100 (${riskCalculation.level}) assigned based on: ${riskCalculation.factors.join(', ')}. Verification recommended prior to packaging.`;
  }
};

/**
 * Order Automation Service Module
 * Handles COD order verification workflow with n8n webhook communication or graceful demo mode
 */
const orderAutomationService = {
  calculateDeterministicCodRisk,
  evaluateCodRisk: (order, customerDoc) => calculateDeterministicCodRisk(order, customerDoc),

  /**
   * Execute Order Risk Analysis & Verification Workflow
   */
  analyzeOrder: async (orderId, storeId, options = {}) => {
    const startTime = Date.now();
    const idempotencyKey = `ord-analysis-${orderId}-${Date.now()}`;

    // 1. Fetch Order and Store data
    const [order, store] = await Promise.all([
      Order.findOne({ _id: orderId, store: storeId }),
      Store.findById(storeId).lean()
    ]);

    if (!order) {
      throw new Error(`Order ${orderId} not found for store ${storeId}`);
    }

    // 2. Fetch Customer History & resolve effective recipient email
    const customerDoc = await Customer.findOne({
      store: storeId,
      phone: order.customer?.phone?.trim()
    });

    const recipientEmail = (options.recipientEmail || order.customer?.email || customerDoc?.email || '').trim();
    if (recipientEmail && !order.customer?.email) {
      order.customer.email = recipientEmail;
    }

    // 3. Compute Deterministic Risk
    const deterministic = calculateDeterministicCodRisk(order, customerDoc);
    const aiExplanation = await getAiRiskExplanation(order, deterministic);

    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      customer: {
        fullName: order.customer?.fullName,
        email: order.customer?.email,
        phone: order.customer?.phone,
        address: order.customer?.address,
        ordersCount: customerDoc?.ordersCount || 1,
        rtoHistoryCount: customerDoc?.rtoHistoryCount || 0
      },
      items: order.items,
      deterministicRisk: deterministic,
      timestamp: new Date().toISOString()
    };

    let result = null;
    let executionMode = 'DEMO_SIMULATION';
    const webhookUrl = config.n8n.orderWebhookUrl;

    // 4. Send to n8n Webhook if configured, else use robust Demo Simulation
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

        if (response.data && response.data.decision) {
          result = response.data;
          executionMode = 'LIVE_N8N';
        } else {
          throw new Error('Invalid JSON response schema from n8n order webhook');
        }
      } catch (webhookErr) {
        console.warn(`[Order Automation] n8n webhook error (${webhookErr.message}). Switching to Demo Simulation.`);
        executionMode = 'DEMO_SIMULATION';
      }
    }

    // Fallback structured simulation if n8n is offline or unconfigured
    if (!result) {
      result = {
        decision: deterministic.decision,
        riskScore: deterministic.score,
        riskLevel: deterministic.level,
        riskFactors: deterministic.factors,
        aiExplanation,
        requiresEmailConfirmation: deterministic.decision === 'REQUEST_CONFIRMATION',
        isDemoSimulation: executionMode === 'DEMO_SIMULATION'
      };
    }

    // 5. Update Order Document in MongoDB
    order.riskScore = result.riskScore;
    order.riskLevel = result.riskLevel;
    order.riskReasons = result.riskFactors || result.reasons || [];
    order.recommendation = result.recommendation || (result.decision === 'REQUEST_CONFIRMATION' ? 'Request customer confirmation and review before dispatch' : 'Proceed with fulfillment');
    order.notes = result.aiExplanation || order.notes;

    let emailSent = false;
    let emailType = 'NONE';
    let emailError = null;
    let verificationTokenDoc = null;

    const autoVerifyEnabled = store?.settings?.autoEmailVerification !== false;
    const storeContext = store || { name: 'CommercePilot Store' };

    // 6. If Confirmation Needed: Dispatch Secure Email Link (otherwise send Order Confirmation Email)
    if ((result.decision === 'REQUEST_CONFIRMATION' || result.requiresEmailConfirmation) && autoVerifyEnabled) {
      order.orderStatus = 'ON_HOLD';
      order.needsVerification = true;

      const rawToken = crypto.randomBytes(32).toString('hex');
      verificationTokenDoc = await VerificationToken.create({
        token: rawToken,
        type: 'ORDER_CONFIRMATION',
        store: storeId,
        order: order._id,
        metadata: {
          orderNumber: order.orderNumber,
          customerEmail: recipientEmail,
          riskScore: result.riskScore
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      const verificationUrl = `${config.clientUrl}/verify-order?token=${rawToken}`;

      if (recipientEmail) {
        const emailResult = await emailService.sendCodVerificationEmail({
          order,
          customer: { ...(order.customer?.toObject?.() || order.customer), email: recipientEmail },
          store: storeContext,
          verificationUrl,
          token: rawToken
        });
        emailSent = Boolean(emailResult?.success);
        emailType = 'COD_VERIFICATION_LINK';
        emailError = emailResult?.error || emailResult?.reason || null;
      }

      order.history.push({
        status: 'ON_HOLD',
        note: recipientEmail
          ? `High COD risk (${result.riskScore}/100). Verification email link ${emailSent ? 'dispatched' : 'queued'} to ${recipientEmail}.`
          : `High COD risk (${result.riskScore}/100). Held for manual verification (no customer email).`
      });
    } else {
      order.orderStatus = 'CONFIRMED';
      order.needsVerification = false;

      if (recipientEmail) {
        const emailResult = await emailService.sendOrderConfirmationEmail({
          order,
          customer: { ...(order.customer?.toObject?.() || order.customer), email: recipientEmail },
          store: storeContext
        });
        emailSent = Boolean(emailResult?.success);
        emailType = 'ORDER_CONFIRMATION';
        emailError = emailResult?.error || emailResult?.reason || null;
      }

      order.history.push({
        status: 'CONFIRMED',
        note: recipientEmail && emailSent
          ? `Order confirmed (${result.riskLevel} risk). Confirmation email dispatched to ${recipientEmail}.`
          : `COD risk assessed as ${result.riskLevel} (${result.riskScore}/100). Order approved to pack.`
      });
    }

    await order.save();

    const durationMs = Date.now() - startTime;

    // 7. Log Workflow Execution to AutomationLog
    const logDoc = await AutomationLog.create({
      store: storeId,
      workflowName: 'ORDER_ANALYSIS_VERIFICATION',
      triggerEvent: `NEW_ORDER_${order.orderNumber}`,
      status: 'SUCCESS',
      executionMode,
      idempotencyKey,
      referenceOrder: order._id,
      requestPayload: payload,
      responsePayload: result,
      durationMs,
      emailSent,
      emailType,
      emailRecipient: recipientEmail || null,
      errorMessage: emailError
    });

    return {
      success: true,
      order,
      analysis: result,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      recommendation: result.decision,
      aiAnalysis: { summary: result.aiExplanation },
      log: logDoc,
      verificationToken: verificationTokenDoc ? verificationTokenDoc.token : null,
      emailSent,
      emailType,
      emailRecipient: recipientEmail || null,
      emailError,
      executionMode
    };
  },

  /**
   * Process Customer Order Confirmation or Cancellation Response
   */
  processCustomerConfirmation: async (tokenString, action = 'confirm') => {
    const tokenDoc = await VerificationToken.findOne({
      token: tokenString,
      type: 'ORDER_CONFIRMATION',
      isUsed: false
    });

    if (!tokenDoc) {
      throw new Error('Invalid, expired or already used confirmation token.');
    }

    if (new Date() > tokenDoc.expiresAt) {
      throw new Error('Confirmation link has expired. Please contact support.');
    }

    const order = await Order.findById(tokenDoc.order);
    if (!order) {
      throw new Error('Order document not found.');
    }

    const store = await Store.findById(tokenDoc.store);
    const ownerUser = store?.owner ? await User.findById(store.owner).select('email').lean() : null;
    const resolvedSellerEmail = store?.settings?.alertEmail || store?.details?.supportEmail || ownerUser?.email || config.smtp.user;

    if (action.toLowerCase() === 'cancel') {
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
                reason: `Customer cancelled Order #${order.orderNumber} via email confirmation link`,
                referenceOrder: order._id
              });
            }
          }
        }
        order.isRestocked = true;
      }

      await order.save();

      tokenDoc.isUsed = true;
      tokenDoc.respondedAt = new Date();
      tokenDoc.responseValue = 'CANCELLED_BY_CUSTOMER';
      await tokenDoc.save();

      if (resolvedSellerEmail) {
        await emailService.dispatchEmail({
          to: resolvedSellerEmail,
          subject: `Order #${order.orderNumber} Cancelled by Customer via Verification Link`,
          html: `<p>Customer <strong>${order.customer?.fullName}</strong> cancelled COD Order #${order.orderNumber}. Inventory hold released.</p>`,
          senderName: store?.name || 'CommercePilot AI',
          eventId: `order-cancel-${order._id}`
        });
      }

      return {
        success: true,
        message: `Order #${order.orderNumber} has been successfully cancelled as per your request.`,
        order
      };
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

    // Send confirmed order receipt to buyer if email exists
    if (order.customer?.email) {
      await emailService.sendOrderConfirmationEmail({
        order,
        customer: order.customer,
        store: store || { name: 'CommercePilot Store' }
      });
    }

    if (resolvedSellerEmail) {
      await emailService.dispatchEmail({
        to: resolvedSellerEmail,
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

    return {
      success: true,
      message: `Thank you! Order #${order.orderNumber} has been verified and confirmed for fulfillment.`,
      order
    };
  }
};

module.exports = orderAutomationService;
