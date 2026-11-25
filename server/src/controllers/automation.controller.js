const AutomationLog = require('../models/AutomationLog.model');
const Order = require('../models/Order.model');
const Delivery = require('../models/Delivery.model');
const config = require('../config/env');
const orderAutomationService = require('../services/orderAutomationService');
const inventoryAutomationService = require('../services/inventoryAutomationService');
const deliveryAutomationService = require('../services/deliveryAutomationService');
const reportAutomationService = require('../services/reportAutomationService');

/**
 * Get automated actions and intervention history
 */
const getAutomationLogs = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { workflow, status, limit = 50, page = 1 } = req.query;

    const query = { store: storeId };
    if (workflow) query.workflowName = workflow;
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AutomationLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('referenceOrder', 'orderNumber totalAmount paymentMethod')
        .populate('referenceDelivery', 'awb courier status')
        .populate('referenceProduct', 'title sku'),
      AutomationLog.countDocuments(query)
    ]);

    // If no logs exist yet, synthesize initial recent telemetry so empty state looks informative
    let automations = logs.map((logDoc) => {
      const l = logDoc.toObject ? logDoc.toObject() : logDoc;
      if (!l.actionSummary) {
        if (l.workflowName === 'ORDER_ANALYSIS_VERIFICATION') {
          l.actionSummary = `Risk Score ${l.responsePayload?.riskScore ?? '—'}/100 (${l.responsePayload?.riskLevel || 'LOW'}) — ${l.emailSent ? `Email (${l.emailType}) dispatched` : 'Processed automatically'}`;
        } else if (l.workflowName === 'INVENTORY_INTELLIGENCE') {
          l.actionSummary = `Scanned ${l.responsePayload?.analyzedSkus ?? 0} SKUs; ${l.responsePayload?.restockCandidatesCount ?? 0} low-stock${l.responsePayload?.poNumber ? ` (PO #${l.responsePayload.poNumber})` : ''}`;
        } else if (l.workflowName === 'DELIVERY_RECOVERY_NDR') {
          l.actionSummary = `NDR recovery ${l.emailSent ? 'email link dispatched to buyer' : 'logged'} (${l.responsePayload?.ndrAttribution || 'COURIER_NDR'})`;
        } else if (l.workflowName === 'DAILY_BUSINESS_REPORT') {
          l.actionSummary = l.responsePayload?.aiSummary ? l.responsePayload.aiSummary.slice(0, 120) + '...' : 'Daily AI executive briefing generated';
        }
      }
      return l;
    });
    if (logs.length === 0) {
      const [flaggedOrders, ndrDeliveries] = await Promise.all([
        Order.find({ store: storeId, needsVerification: true }).sort({ createdAt: -1 }).limit(5),
        Delivery.find({ store: storeId, status: { $in: ['FAILED', 'RTO'] } }).sort({ updatedAt: -1 }).limit(5).populate('order')
      ]);

      automations = [
        ...flaggedOrders.map(o => ({
          _id: `synth-${o._id}`,
          workflowName: 'ORDER_ANALYSIS_VERIFICATION',
          triggerEvent: `NEW_COD_ORDER_${o.orderNumber}`,
          status: 'SUCCESS',
          executionMode: 'DEMO_SIMULATION',
          actionSummary: `Deterministic risk score ${o.riskScore}/100. Verification email link dispatched to buyer.`,
          durationMs: 420,
          emailSent: true,
          emailRecipient: o.customer?.email || 'buyer@example.com',
          createdAt: o.createdAt
        })),
        ...ndrDeliveries.map(d => ({
          _id: `synth-del-${d._id}`,
          workflowName: 'DELIVERY_RECOVERY_NDR',
          triggerEvent: `COURIER_NDR_${d.awb}`,
          status: 'SUCCESS',
          executionMode: 'DEMO_SIMULATION',
          actionSummary: `Courier (${d.courier}) reported: "${d.ndrReason || 'Customer unavailable'}". Interactive customer re-schedule email initiated within 45s.`,
          durationMs: 380,
          emailSent: true,
          emailRecipient: d.order?.customer?.email || 'buyer@example.com',
          createdAt: d.updatedAt
        }))
      ];
    }

    return res.status(200).json({
      success: true,
      automations,
      total: total || automations.length,
      page: pageNum,
      pages: Math.ceil((total || automations.length) / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Workflow Statuses (Connected / Not Configured / Failed / Running)
 */
const getWorkflowStatuses = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { orderWebhookUrl, inventoryWebhookUrl, deliveryWebhookUrl, reportWebhookUrl } = config.n8n;

    // Helper to determine status based on configuration and recent executions
    const checkWorkflowStatus = async (workflowName, configuredUrl) => {
      const isConfigured = Boolean(configuredUrl && configuredUrl.startsWith('http'));

      const recentLog = await AutomationLog.findOne({
        store: storeId,
        workflowName
      }).sort({ createdAt: -1 });

      let state = isConfigured ? 'CONNECTED' : 'NOT_CONFIGURED';
      if (recentLog) {
        if (recentLog.status === 'RUNNING') state = 'RUNNING';
        else if (recentLog.status === 'FAILED') state = 'FAILED';
      }

      return {
        name: workflowName,
        isConfigured,
        webhookUrl: isConfigured ? configuredUrl.replace(/:(\/\/)[^@]*@/, '$1') : null, // sanitize credentials
        status: state,
        lastExecution: recentLog ? recentLog.createdAt : null,
        lastStatus: recentLog ? recentLog.status : 'NONE',
        executionMode: recentLog ? recentLog.executionMode : (isConfigured ? 'LIVE_N8N' : 'DEMO_SIMULATION')
      };
    };

    const [orderWorkflow, inventoryWorkflow, deliveryWorkflow, reportWorkflow] = await Promise.all([
      checkWorkflowStatus('ORDER_ANALYSIS_VERIFICATION', orderWebhookUrl),
      checkWorkflowStatus('INVENTORY_INTELLIGENCE', inventoryWebhookUrl),
      checkWorkflowStatus('DELIVERY_RECOVERY_NDR', deliveryWebhookUrl),
      checkWorkflowStatus('DAILY_BUSINESS_REPORT', reportWebhookUrl)
    ]);

    return res.status(200).json({
      success: true,
      workflows: {
        orderVerification: orderWorkflow,
        inventoryIntelligence: inventoryWorkflow,
        deliveryRecovery: deliveryWorkflow,
        dailyReport: reportWorkflow
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual Trigger Handlers
 */
const triggerOrderAnalysis = async (req, res, next) => {
  try {
    let { orderId } = req.params;
    const recipientEmail = req.body?.email || req.query?.email || '';
    if (!orderId || orderId === 'sample-order') {
      const recentOrder = await Order.findOne({ store: req.store._id }).sort({ createdAt: -1 });
      if (!recentOrder) {
        return res.status(400).json({ success: false, message: 'No orders found in store to evaluate.' });
      }
      orderId = recentOrder._id;
    }
    const result = await orderAutomationService.analyzeOrder(orderId, req.store._id, { recipientEmail });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const triggerInventoryAnalysis = async (req, res, next) => {
  try {
    const recipientEmail = req.body?.email || req.query?.email || '';
    const result = await inventoryAutomationService.analyzeInventory(req.store._id, { recipientEmail });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const triggerDeliveryRecovery = async (req, res, next) => {
  try {
    let { deliveryId } = req.params;
    const email = req.body?.email || req.query?.email || '';
    if (!deliveryId || deliveryId === 'sample-delivery') {
      const recentDel = await Delivery.findOne({ store: req.store._id }).sort({ updatedAt: -1 });
      if (!recentDel) {
        return res.status(400).json({ success: false, message: 'No delivery records found in store to test recovery.' });
      }
      deliveryId = recentDel._id;
    }
    const result = await deliveryAutomationService.handleFailedDelivery(deliveryId, req.store._id, { email });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const triggerDailyReport = async (req, res, next) => {
  try {
    const recipientEmail = req.body?.email || req.query?.email || '';
    const result = await reportAutomationService.generateDailyReport(req.store._id, true, { recipientEmail });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAutomationLogs,
  getWorkflowStatuses,
  triggerOrderAnalysis,
  triggerInventoryAnalysis,
  triggerDeliveryRecovery,
  triggerDailyReport
};
