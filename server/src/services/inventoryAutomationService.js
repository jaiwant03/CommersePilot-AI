const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/env');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Store = require('../models/Store.model');
const User = require('../models/User.model');
const PurchaseOrder = require('../models/PurchaseOrder.model');
const AutomationLog = require('../models/AutomationLog.model');
const VerificationToken = require('../models/VerificationToken.model');
const emailService = require('./emailService');

const HTTP_TIMEOUT_MS = 8000;

/**
 * Inventory Intelligence Automation Service Module
 * Analyzes SKU sales velocity, calculates runways, generates PO drafts, and requests seller approval
 */
const inventoryAutomationService = {
  /**
   * Run Inventory Intelligence & Restock Analysis
   */
  analyzeInventory: async (storeId, options = {}) => {
    const startTime = Date.now();
    const idempotencyKey = `inv-analysis-${storeId}-${Date.now()}`;

    // 1. Fetch Store profile and owner
    const store = await Store.findById(storeId);
    if (!store) {
      throw new Error(`Store ${storeId} not found`);
    }
    const ownerUser = store.owner ? await User.findById(store.owner).select('email').lean() : null;
    const recipientEmail = (
      options.recipientEmail ||
      store.settings?.alertEmail ||
      store.details?.supportEmail ||
      ownerUser?.email ||
      config.smtp.user ||
      ''
    ).trim();

    // 2. Fetch all products for the store
    const products = await Product.find({ store: storeId });
    if (!products || products.length === 0) {
      return {
        success: true,
        message: 'No products in catalog to analyze.',
        restockNeededCount: 0
      };
    }

    // 3. Compute 30-day sales velocity per product
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesHistory = await Order.aggregate([
      { $match: { store: store._id, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalUnitsSold: { $sum: '$items.quantity' },
          orderOccurrences: { $sum: 1 }
        }
      }
    ]);

    const salesMap = new Map();
    salesHistory.forEach((sh) => {
      if (sh._id) salesMap.set(sh._id.toString(), sh.totalUnitsSold);
    });

    // 4. Calculate Demand, Safety Runway Days & Detect Low Stock SKUs
    const analysisItems = [];
    const restockCandidates = [];

    for (const prod of products) {
      const unitsSold30d = salesMap.get(prod._id.toString()) || 2; // baseline velocity
      const dailyBurnRate = Math.max(0.1, Number((unitsSold30d / 30).toFixed(2)));
      const totalStock = prod.stockQuantity || 0;
      const runwayDays = Math.round(totalStock / dailyBurnRate);
      const threshold = prod.reorderThreshold || 10;
      const isBelowThreshold = totalStock <= threshold;

      const itemTelemetry = {
        productId: prod._id,
        title: prod.title,
        sku: prod.sku,
        currentStock: totalStock,
        reorderThreshold: threshold,
        unitsSold30d,
        dailyBurnRate,
        runwayDays,
        isBelowThreshold,
        costPrice: prod.costPrice || 500,
        sellingPrice: prod.sellingPrice || prod.price || 1200
      };

      analysisItems.push(itemTelemetry);

      if (isBelowThreshold) {
        // Recommend restocking 30 days of sales + safety buffer
        const recommendedReorderQty = Math.max(15, Math.ceil(dailyBurnRate * 30));
        const estimatedItemCost = recommendedReorderQty * (prod.costPrice || 500);

        restockCandidates.push({
          product: prod._id,
          sku: prod.sku,
          title: prod.title,
          currentStock: totalStock,
          reorderQuantity: recommendedReorderQty,
          unitCost: prod.costPrice || 500,
          estimatedCost: estimatedItemCost
        });
      }
    }

    const payload = {
      storeId: store._id,
      storeName: store.name,
      analyzedSkusCount: products.length,
      lowStockCandidatesCount: restockCandidates.length,
      items: analysisItems,
      restockCandidates,
      timestamp: new Date().toISOString()
    };

    let result = null;
    let executionMode = 'DEMO_SIMULATION';
    const webhookUrl = config.n8n.inventoryWebhookUrl;

    // 5. Query n8n Webhook if configured, else execute structured demo logic
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

        if (response.data && response.data.recommendations) {
          result = response.data;
          executionMode = 'LIVE_N8N';
        }
      } catch (webhookErr) {
        console.warn(`[Inventory Automation] n8n webhook error (${webhookErr.message}). Switching to Demo Mode.`);
        executionMode = 'DEMO_SIMULATION';
      }
    }

    if (!result) {
      result = {
        recommendations: restockCandidates,
        totalSkusChecked: products.length,
        criticalLowStockCount: restockCandidates.length,
        isDemoSimulation: executionMode === 'DEMO_SIMULATION'
      };
    }

    let poDraftDoc = null;
    let emailSent = false;
    let emailError = null;
    let tokenDoc = null;

    // 6. Generate Supplier Purchase Order Draft if restocking is needed
    if (restockCandidates.length > 0) {
      const poCount = await PurchaseOrder.countDocuments({ store: store._id });
      const poNumber = `PO-${store.name.substring(0, 3).toUpperCase()}-${2000 + poCount + 1}`;
      const totalEstimatedCost = restockCandidates.reduce((sum, it) => sum + it.estimatedCost, 0);

      poDraftDoc = await PurchaseOrder.create({
        store: store._id,
        poNumber,
        supplierName: 'Surat Handloom & Apparel Mills',
        supplierEmail: store.details?.supportEmail || recipientEmail || 'orders@surattextiles.example.com',
        items: restockCandidates,
        totalEstimatedCost,
        status: 'DRAFT_PENDING_APPROVAL',
        notes: `Auto-generated by Inventory Intelligence for ${restockCandidates.length} depleted SKUs.`
      });

      // Generate secure action token for merchant approval
      const rawToken = crypto.randomBytes(32).toString('hex');
      tokenDoc = await VerificationToken.create({
        token: rawToken,
        type: 'PO_APPROVAL',
        store: store._id,
        purchaseOrder: poDraftDoc._id,
        metadata: {
          poNumber: poDraftDoc.poNumber,
          totalEstimatedCost: poDraftDoc.totalEstimatedCost,
          supplierEmail: poDraftDoc.supplierEmail
        },
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      });

      const approvalUrl = `${config.clientUrl}/approve-po?token=${rawToken}&action=approve`;
      const rejectUrl = `${config.clientUrl}/approve-po?token=${rawToken}&action=reject`;

      // 7. Email seller for approval (supplier is NOT contacted yet!)
      if (recipientEmail) {
        const emailRes = await emailService.sendSupplierPurchaseOrderApprovalEmail({
          store,
          sellerEmail: recipientEmail,
          poDraft: poDraftDoc,
          approvalUrl,
          rejectUrl
        });

        emailSent = Boolean(emailRes.success);
        emailError = emailRes.error || emailRes.reason || null;
      }
    }

    const durationMs = Date.now() - startTime;

    // 8. Log Execution
    const logDoc = await AutomationLog.create({
      store: store._id,
      workflowName: 'INVENTORY_INTELLIGENCE',
      triggerEvent: `INVENTORY_SCAN_${new Date().toISOString().split('T')[0]}`,
      status: 'SUCCESS',
      executionMode,
      idempotencyKey,
      requestPayload: payload,
      responsePayload: {
        analyzedSkus: products.length,
        restockCandidatesCount: restockCandidates.length,
        poDraftCreated: Boolean(poDraftDoc),
        poNumber: poDraftDoc?.poNumber
      },
      durationMs,
      emailSent,
      emailType: emailSent ? 'SUPPLIER_PO_APPROVAL_REQUEST' : 'NONE',
      emailRecipient: recipientEmail || null,
      errorMessage: emailError
    });

    return {
      success: true,
      analysis: result,
      alertsCount: restockCandidates.length,
      restockCandidatesCount: restockCandidates.length,
      poDraft: poDraftDoc,
      log: logDoc,
      emailSent,
      emailRecipient: recipientEmail || null,
      emailError,
      executionMode
    };
  },

  /**
   * Explicit Merchant Approval Handler
   * Sends email to supplier ONLY after explicit approval
   */
  processPoApproval: async (tokenString, action, approvedByUserId = null) => {
    const tokenDoc = await VerificationToken.findOne({
      token: tokenString,
      type: 'PO_APPROVAL',
      isUsed: false
    });

    if (!tokenDoc) {
      throw new Error('Invalid, expired or already used approval token.');
    }

    if (new Date() > tokenDoc.expiresAt) {
      throw new Error('This purchase order approval link has expired.');
    }

    const po = await PurchaseOrder.findById(tokenDoc.purchaseOrder);
    if (!po) {
      throw new Error('Purchase order document not found.');
    }

    const store = await Store.findById(po.store);

    if (action && action.toLowerCase() === 'approve') {
      po.status = 'APPROVED';
      po.approvedAt = new Date();
      if (approvedByUserId) po.approvedBy = approvedByUserId;
      await po.save();

      // Dispatch official PO email to supplier
      const supplierEmailResult = await emailService.sendSupplierPurchaseOrderEmail({
        store,
        supplierEmail: po.supplierEmail,
        po
      });

      po.status = 'SENT_TO_SUPPLIER';
      po.sentAt = new Date();
      await po.save();

      tokenDoc.isUsed = true;
      tokenDoc.respondedAt = new Date();
      tokenDoc.responseValue = 'APPROVED_AND_SENT';
      await tokenDoc.save();

      return {
        success: true,
        action: 'APPROVED',
        message: `Purchase Order #${po.poNumber} approved and dispatched to supplier (${po.supplierEmail}).`,
        po,
        purchaseOrder: po,
        emailSent: supplierEmailResult.success
      };
    } else {
      po.status = 'REJECTED';
      await po.save();

      tokenDoc.isUsed = true;
      tokenDoc.respondedAt = new Date();
      tokenDoc.responseValue = 'REJECTED';
      await tokenDoc.save();

      return {
        success: true,
        action: 'REJECTED',
        message: `Purchase Order #${po.poNumber} has been rejected and cancelled.`,
        po,
        purchaseOrder: po
      };
    }
  }
};

module.exports = inventoryAutomationService;
