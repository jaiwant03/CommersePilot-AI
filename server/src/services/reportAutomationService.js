const axios = require('axios');
const config = require('../config/env');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Delivery = require('../models/Delivery.model');
const Store = require('../models/Store.model');
const AutomationLog = require('../models/AutomationLog.model');
const emailService = require('./emailService');
const { generateGroqCompletion } = require('./groq.service');

const HTTP_TIMEOUT_MS = 10000;

/**
 * Daily AI Business Report Automation Service Module
 * Synthesizes daily operational metrics, generates Groq AI executive summaries, and emails store owners
 */
const reportAutomationService = {
  /**
   * Run Daily AI Business Summary Workflow
   */
  generateDailyReport: async (storeId, force = false) => {
    const startTime = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    const idempotencyKey = force 
      ? `daily-report-${storeId}-${todayStr}-${Date.now()}`
      : `daily-report-${storeId}-${todayStr}`;

    // 0. Idempotency Check: return existing execution if already run today
    if (!force) {
      const existingLog = await AutomationLog.findOne({ idempotencyKey });
      if (existingLog) {
        return {
          success: true,
          report: existingLog.requestPayload,
          metrics: existingLog.requestPayload,
          aiSummary: existingLog.responsePayload?.aiSummary || 'Daily briefing previously generated for today.',
          executiveSummary: existingLog.responsePayload?.aiSummary || 'Daily briefing previously generated for today.',
          emailSent: existingLog.emailSent,
          log: existingLog,
          executionMode: existingLog.executionMode,
          isCached: true
        };
      }
    }

    // 1. Fetch Store Profile
    const store = await Store.findById(storeId);
    if (!store) {
      throw new Error(`Store ${storeId} not found`);
    }

    const sellerEmail = store.settings?.alertEmail || store.details?.supportEmail || 'owner@chiccouture.in';

    // 2. Aggregate Today's / Recent Store Data
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [recentOrders, allProducts, recentDeliveries] = await Promise.all([
      Order.find({ store: store._id, createdAt: { $gte: oneDayAgo } }),
      Product.find({ store: store._id }),
      Delivery.find({ store: store._id, status: { $in: ['FAILED', 'OUT_FOR_DELIVERY', 'RTO'] } })
    ]);

    // Compute Metrics
    const totalOrders = recentOrders.length;
    const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const codOrders = recentOrders.filter(o => o.paymentMethod === 'COD').length;
    const prepaidOrders = totalOrders - codOrders;
    const needsVerificationCount = recentOrders.filter(o => o.needsVerification).length;

    const lowStockProducts = allProducts.filter(p => (p.stockQuantity || 0) <= (p.reorderThreshold || 10));
    const failedDeliveries = recentDeliveries.filter(d => d.status === 'FAILED');

    const reportTelemetry = {
      date: todayStr,
      storeName: store.name,
      channel: store.channel,
      totalOrders,
      totalRevenue,
      codOrders,
      prepaidOrders,
      needsVerificationCount,
      lowStockCount: lowStockProducts.length,
      lowStockSkus: lowStockProducts.map(p => `${p.title} (${p.stockQuantity} left)`),
      failedDeliveriesCount: failedDeliveries.length
    };

    let aiSummary = '';
    let executionMode = 'DEMO_SIMULATION';
    const webhookUrl = config.n8n.reportWebhookUrl;

    // 3. Query n8n Daily Report Webhook if configured, else invoke Groq AI directly
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const response = await axios.post(webhookUrl, reportTelemetry, {
          timeout: HTTP_TIMEOUT_MS,
          headers: {
            'Content-Type': 'application/json',
            'X-CommercePilot-Secret': config.n8n.webhookSecret,
            'X-Idempotency-Key': idempotencyKey
          }
        });

        if (response.data && response.data.aiSummary) {
          aiSummary = response.data.aiSummary;
          executionMode = 'LIVE_N8N';
        }
      } catch (webhookErr) {
        console.warn(`[Report Automation] n8n webhook error (${webhookErr.message}). Switching to Groq fallback.`);
        executionMode = 'DEMO_SIMULATION';
      }
    }

    if (!aiSummary) {
      // Use Groq AI integration
      const prompt = `Generate a concise 3-bullet executive operational summary for ecommerce store "${store.name}":
Date: ${todayStr}
Total Orders Logged: ${totalOrders} (Revenue: ₹${totalRevenue.toLocaleString('en-IN')})
Payment Mix: ${codOrders} COD (${needsVerificationCount} high-risk requiring email confirmation), ${prepaidOrders} Prepaid
Inventory: ${lowStockProducts.length} low-stock SKUs (${lowStockProducts.map(p => p.title).slice(0, 3).join(', ') || 'None'})
Logistics: ${failedDeliveries.length} failed delivery attempts pending customer rescheduling

Structure response as:
1. Sales & Revenue Highlight
2. Risk & Cashflow Alert
3. Immediate Operational Priority`;

      try {
        aiSummary = await generateGroqCompletion({
          prompt,
          systemPrompt: 'You are an autonomous operations director for Indian D2C and Shopify brands. Provide sharp, executive-level summaries.'
        });
      } catch (err) {
        aiSummary = `• Revenue Velocity: Generated ₹${totalRevenue.toLocaleString('en-IN')} across ${totalOrders} orders.\n• Margin Protection: ${needsVerificationCount} high-risk COD orders flagged for automated email verification.\n• Stock Alert: ${lowStockProducts.length} SKUs currently below reorder thresholds; replenish immediately to avoid stockouts.`;
      }
    }

    // 4. Dispatch Email Report to Store Owner
    const emailResult = await emailService.sendDailyBusinessReportEmail({
      store,
      sellerEmail,
      reportData: reportTelemetry,
      aiSummary
    });

    const durationMs = Date.now() - startTime;

    // 5. Log to AutomationLog
    const logDoc = await AutomationLog.create({
      store: store._id,
      workflowName: 'DAILY_BUSINESS_REPORT',
      triggerEvent: `DAILY_REPORT_${todayStr}`,
      status: 'SUCCESS',
      executionMode,
      idempotencyKey,
      requestPayload: reportTelemetry,
      responsePayload: {
        aiSummary,
        emailSent: emailResult.success
      },
      durationMs,
      emailSent: emailResult.success,
      emailType: 'DAILY_EXECUTIVE_DIGEST',
      emailRecipient: sellerEmail
    });

    return {
      success: true,
      report: reportTelemetry,
      metrics: reportTelemetry,
      aiSummary,
      executiveSummary: aiSummary,
      emailSent: emailResult.success,
      log: logDoc,
      executionMode
    };
  }
};

module.exports = reportAutomationService;
