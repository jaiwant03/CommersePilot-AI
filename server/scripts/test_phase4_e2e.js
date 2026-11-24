/**
 * CommercePilot AI — Phase 4 End-to-End Integration Test Script
 * Verifies all 4 n8n automation workflows, verification tokens, and email loops.
 */

const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Store = require('../src/models/Store.model');
const Order = require('../src/models/Order.model');
const Product = require('../src/models/Product.model');
const Delivery = require('../src/models/Delivery.model');
const PurchaseOrder = require('../src/models/PurchaseOrder.model');
const VerificationToken = require('../src/models/VerificationToken.model');
const AutomationLog = require('../src/models/AutomationLog.model');

const orderAutomationService = require('../src/services/orderAutomationService');
const inventoryAutomationService = require('../src/services/inventoryAutomationService');
const deliveryAutomationService = require('../src/services/deliveryAutomationService');
const reportAutomationService = require('../src/services/reportAutomationService');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commercepilot_ai';

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 COMMERCEPILOT AI — PHASE 4 E2E AUTOMATION TEST');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB:', MONGO_URI);

    // 1. Find or verify test store
    const user = await User.findOne({ email: 'priya@chiccouture.in' });
    if (!user) {
      throw new Error('Test merchant priya@chiccouture.in not found. Run previous phase seed/register first.');
    }
    const store = await Store.findOne({ owner: user._id });
    if (!store) {
      throw new Error(`Store for user ${user.email} not found.`);
    }
    console.log(`✓ Active Merchant Store: "${store.name}" (${store._id})\n`);

    // =========================================================================
    // WORKFLOW 1: COD ORDER RISK INTELLIGENCE & EMAIL VERIFICATION
    // =========================================================================
    console.log('--- [1/4] Testing COD Order Risk Intelligence ---');
    const testOrder = await Order.create({
      store: store._id,
      orderNumber: `ORD-TEST-${Date.now().toString().slice(-4)}`,
      customer: {
        fullName: 'Siddharth Varma',
        email: 'siddharth.varma@example.com',
        phone: '9845012345',
        address: {
          street: 'B-12, Green Glen',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          country: 'India'
        }
      },
      items: [
        {
          title: 'Royal Banarasi Silk Saree',
          sku: 'CC-SAR-ROYAL',
          quantity: 1,
          unitPrice: 5499,
          totalPrice: 5499
        }
      ],
      subtotal: 5499,
      totalAmount: 5499,
      paymentMethod: 'COD',
      status: 'PENDING',
      verificationStatus: 'PENDING'
    });
    console.log(`Created test COD order: ${testOrder.orderNumber} (₹${testOrder.totalAmount})`);

    const orderAnalysisResult = await orderAutomationService.analyzeOrder(testOrder._id, store._id);
    console.log(`Risk Score: ${orderAnalysisResult.riskScore}/100, Recommendation: ${orderAnalysisResult.recommendation}`);
    console.log(`Execution Mode: ${orderAnalysisResult.executionMode}`);
    if (orderAnalysisResult.aiAnalysis?.summary) {
      console.log(`Groq AI Summary: "${orderAnalysisResult.aiAnalysis.summary}"`);
    }

    // Verify token creation
    const orderToken = await VerificationToken.findOne({
      order: testOrder._id,
      type: 'ORDER_CONFIRMATION',
      isUsed: false
    });
    if (!orderToken) {
      throw new Error('Order verification token was not created!');
    }
    console.log(`✓ Verification Token generated: ${orderToken.token.slice(0, 16)}... (Expires in 7 days)`);

    // Simulate customer confirming order via email link
    const confirmResult = await orderAutomationService.processCustomerConfirmation(orderToken.token, 'CONFIRM');
    console.log(`✓ Customer confirmed order: ${confirmResult.order.orderStatus}, Needs Verification: ${confirmResult.order.needsVerification}`);

    const orderLog = await AutomationLog.findOne({ referenceOrder: testOrder._id });
    if (!orderLog) throw new Error('AutomationLog was not saved for order analysis!');
    console.log(`✓ AutomationLog recorded: [${orderLog.workflowName}] Mode: ${orderLog.executionMode}, Duration: ${orderLog.durationMs}ms\n`);

    // =========================================================================
    // WORKFLOW 2: INVENTORY INTELLIGENCE & AUTO-PURCHASE ORDER
    // =========================================================================
    console.log('--- [2/4] Testing Inventory Intelligence & PO Approval ---');
    let lowProduct = await Product.findOne({ store: store._id, stockQuantity: { $lte: 10 } });
    if (!lowProduct) {
      lowProduct = await Product.create({
        store: store._id,
        title: 'Chanderi Zari Dupatta',
        sku: 'CC-DUP-01',
        category: 'Dupattas',
        price: 1899,
        costPrice: 750,
        stockQuantity: 4,
        reorderThreshold: 15,
        salesVelocity30Days: 24,
        status: 'ACTIVE'
      });
    }
    console.log(`Identified test low-stock product: "${lowProduct.title}" (Stock: ${lowProduct.stockQuantity}, Threshold: ${lowProduct.reorderThreshold})`);

    const inventoryResult = await inventoryAutomationService.analyzeInventory(store._id);
    console.log(`Inventory scanned. Alerts triggered: ${inventoryResult.alertsCount}`);
    console.log(`Execution Mode: ${inventoryResult.executionMode}`);

    const draftPo = await PurchaseOrder.findOne({ store: store._id }).sort({ createdAt: -1 });
    if (!draftPo) throw new Error('PurchaseOrder draft was not created!');
    console.log(`✓ Draft PO Generated: ${draftPo.poNumber} for ${draftPo.supplierName} (₹${draftPo.totalEstimatedCost})`);

    const poToken = await VerificationToken.findOne({
      purchaseOrder: draftPo._id,
      type: 'PO_APPROVAL',
      isUsed: false
    });
    if (!poToken) throw new Error('PO Approval token was not created!');
    console.log(`✓ PO Approval Token generated: ${poToken.token.slice(0, 16)}...`);

    // Simulate merchant approving the PO
    const poApprovalResult = await inventoryAutomationService.processPoApproval(poToken.token, 'APPROVE');
    console.log(`✓ Merchant approved PO: Status is now "${poApprovalResult.purchaseOrder.status}"`);
    console.log(`✓ Supplier email dispatch simulated to: ${poApprovalResult.purchaseOrder.supplierEmail}\n`);

    // =========================================================================
    // WORKFLOW 3: FAILED DELIVERY (NDR) RECOVERY
    // =========================================================================
    console.log('--- [3/4] Testing Failed Delivery (NDR) Recovery ---');
    const testDelivery = await Delivery.create({
      store: store._id,
      order: testOrder._id,
      awb: `AWB-TEST-${Date.now().toString().slice(-6)}`,
      courier: 'Delhivery',
      status: 'FAILED',
      ndrReason: 'Customer phone unreachable during afternoon attempt',
      destination: {
        city: testOrder.customer.address.city,
        state: testOrder.customer.address.state,
        pincode: testOrder.customer.address.pincode
      }
    });
    console.log(`Created delivery record: ${testDelivery.awb} (Status: FAILED, Reason: "${testDelivery.ndrReason}")`);

    const ndrResult = await deliveryAutomationService.handleFailedDelivery(testDelivery._id, store._id);
    console.log(`NDR Recovery initiated. Execution Mode: ${ndrResult.executionMode}`);

    const ndrToken = await VerificationToken.findOne({
      delivery: testDelivery._id,
      type: 'DELIVERY_RESCHEDULE',
      isUsed: false
    });
    if (!ndrToken) throw new Error('Delivery reschedule token was not created!');
    console.log(`✓ NDR Reschedule Token generated: ${ndrToken.token.slice(0, 16)}...`);

    // Simulate customer selecting a new delivery slot and landmark
    const rescheduleResult = await deliveryAutomationService.processCustomerReschedule(ndrToken.token, {
      preferredDate: '2026-11-25',
      preferredSlot: 'Afternoon (2 PM - 6 PM)',
      landmark: 'Opposite Indiranagar Metro Pillar 42',
      alternatePhone: '9845099999',
      notes: 'Please leave with security if unavailable'
    });
    console.log(`✓ Customer rescheduled delivery: Delivery status updated to "${rescheduleResult.delivery.status}"\n`);

    // =========================================================================
    // WORKFLOW 4: DAILY AI BUSINESS REPORT
    // =========================================================================
    console.log('--- [4/4] Testing Daily AI Business Report ---');
    const reportResult = await reportAutomationService.generateDailyReport(store._id, true);
    console.log(`Daily report generated. Execution Mode: ${reportResult.executionMode}`);
    console.log(`Total Orders Aggregated: ${reportResult.metrics.totalOrders ?? reportResult.metrics.orderCount ?? 0}, Total Revenue: ₹${reportResult.metrics.totalRevenue || 0}`);
    if (reportResult.executiveSummary) {
      console.log(`\n--- Groq AI Daily Operational Briefing ---`);
      console.log(reportResult.executiveSummary);
      console.log('-------------------------------------------\n');
    }

    // =========================================================================
    // FINAL AUDIT VERIFICATION
    // =========================================================================
    console.log('--- Final Database Audit Trail Verification ---');
    const totalLogs = await AutomationLog.countDocuments({ store: store._id });
    console.log(`✓ Total AutomationLog entries recorded: ${totalLogs}`);

    const distinctWorkflows = await AutomationLog.distinct('workflowName', { store: store._id });
    console.log(`✓ Distinct Workflows Verified in DB: ${distinctWorkflows.join(', ')}`);

    console.log('\n====================================================');
    console.log('🎉 ALL PHASE 4 WORKFLOW AUTOMATION TESTS PASSED!');
    console.log('====================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runTests();
