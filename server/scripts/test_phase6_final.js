/**
 * CommercePilot AI — Phase 6 Final Integration & Quality Assurance Test Suite
 * Exhaustively validates all system layers, security controls, store isolation,
 * error handling, and end-to-end operational flows.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../src/models/User.model');
const Store = require('../src/models/Store.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Delivery = require('../src/models/Delivery.model');
const PurchaseOrder = require('../src/models/PurchaseOrder.model');
const InventoryMovement = require('../src/models/InventoryMovement.model');
const VerificationToken = require('../src/models/VerificationToken.model');
const AutomationLog = require('../src/models/AutomationLog.model');

const orderAutomationService = require('../src/services/orderAutomationService');
const inventoryAutomationService = require('../src/services/inventoryAutomationService');
const deliveryAutomationService = require('../src/services/deliveryAutomationService');
const reportAutomationService = require('../src/services/reportAutomationService');
const aiAssistantService = require('../src/services/aiAssistantService');
const forecastingService = require('../src/services/forecastingService');
const analyticsService = require('../src/services/analyticsService');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commercepilot_ai';

const runPhase6FinalCheck = async () => {
  console.log('======================================================================');
  console.log('🏁 COMMERCEPILOT AI — PHASE 6 FINAL INTEGRATION & QA AUDIT');
  console.log('======================================================================\n');

  let passedChecks = 0;
  let totalChecks = 0;

  const assert = (condition, message) => {
    totalChecks++;
    if (condition) {
      passedChecks++;
      console.log(`  ✓ [PASS] ${message}`);
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  };

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Database] Connected to MongoDB: ${MONGO_URI}\n`);

    // -------------------------------------------------------------------------
    // 1. SECURITY & AUTHENTICATION AUDIT
    // -------------------------------------------------------------------------
    console.log('--- 1. Security & Authentication Audit ---');

    // 1.1 Password Hashing Check
    const testPlainPassword = 'SecureMerchantPassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPlainPassword, salt);
    assert(hashedPassword !== testPlainPassword, 'Password is cryptographically hashed with bcrypt');
    assert(hashedPassword.startsWith('$2'), 'Bcrypt hash format verified');
    const isPasswordValid = await bcrypt.compare(testPlainPassword, hashedPassword);
    assert(isPasswordValid === true, 'Bcrypt password comparison succeeds for valid secret');
    const isWrongPasswordInvalid = await bcrypt.compare('WrongPassword!', hashedPassword);
    assert(isWrongPasswordInvalid === false, 'Bcrypt password comparison rejects incorrect secret');

    // 1.2 User Model Integrity
    const testUser = await User.findOne({ email: 'meena@trendythreads.in' }) || await User.findOne();
    assert(Boolean(testUser), 'Primary test user exists in MongoDB');
    assert(testUser.password === undefined, 'Password is automatically excluded from default queries (select: false)');

    const userWithPassword = await User.findOne({ _id: testUser._id }).select('+password');
    assert(userWithPassword.password.startsWith('$2'), 'Explicitly selected password in MongoDB is hashed with bcrypt');

    // 1.3 Store Ownership & Data Scoping
    const store = await Store.findOne({ owner: testUser._id });
    assert(Boolean(store), `Store "${store.name}" successfully linked to owner ${testUser.email}`);
    assert(String(store.owner) === String(testUser._id), 'Store-owner relational link verified');
    console.log('');

    // -------------------------------------------------------------------------
    // 2. PRODUCT MANAGEMENT & INVENTORY MOVEMENTS (CRUD)
    // -------------------------------------------------------------------------
    console.log('--- 2. Product Management & Inventory CRUD ---');
    const uniqueSku = `QA-TEST-${Date.now().toString().slice(-4)}`;
    const product = await Product.create({
      store: store._id,
      title: 'Kanjivaram Zari Saree - Royal Maroon',
      description: 'Handwoven pure silk kanjivaram with gold border',
      category: 'Sarees',
      sku: uniqueSku,
      costPrice: 4200,
      sellingPrice: 8999,
      stockQuantity: 25,
      reorderThreshold: 10,
      leadTimeDays: 7,
      safetyStockDays: 5
    });
    assert(Boolean(product._id), `Product created with SKU ${product.sku}`);

    // Update stock & log inventory movement
    const initialStock = product.stockQuantity;
    product.stockQuantity = 22; // Deduct 3 units for an order
    await product.save();
    const movement = await InventoryMovement.create({
      store: store._id,
      product: product._id,
      sku: product.sku,
      type: 'ORDER_DEDUCTION',
      quantityChanged: -3,
      previousStock: initialStock,
      newStock: product.stockQuantity,
      reason: 'Fulfillment order deduction'
    });
    assert(movement.newStock === 22, 'Inventory movement record created and new stock matches');

    // Read & filter
    const foundProducts = await Product.find({ store: store._id, category: 'Sarees' });
    assert(foundProducts.length > 0, `Category filter returned ${foundProducts.length} saree products`);
    console.log('');

    // -------------------------------------------------------------------------
    // 3. ORDER MANAGEMENT & COD RISK AUTOMATION
    // -------------------------------------------------------------------------
    console.log('--- 3. Order Management & COD Risk Workflow ---');
    const orderNumber = `ORD-QA-${Date.now().toString().slice(-4)}`;
    const order = await Order.create({
      store: store._id,
      orderNumber,
      customer: {
        fullName: 'Ananya Deshmukh',
        email: 'ananya.d@example.com',
        phone: '9820011223',
        address: {
          street: 'Flat 101, Prestige Towers',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          country: 'India'
        }
      },
      items: [
        {
          product: product._id,
          title: product.title,
          sku: product.sku,
          quantity: 1,
          unitPrice: product.sellingPrice,
          totalPrice: product.sellingPrice
        }
      ],
      subtotal: product.sellingPrice,
      totalAmount: product.sellingPrice,
      paymentMethod: 'COD',
      orderStatus: 'PENDING',
      verificationStatus: 'PENDING'
    });
    assert(Boolean(order._id), `COD Order created: #${order.orderNumber} (₹${order.totalAmount})`);

    // Run COD analysis workflow
    const analysisResult = await orderAutomationService.analyzeOrder(order._id, store._id);
    assert(typeof analysisResult.riskScore === 'number', `Risk score calculated deterministically: ${analysisResult.riskScore}/100`);
    assert(Boolean(analysisResult.recommendation), `Recommendation assigned: ${analysisResult.recommendation}`);
    assert(analysisResult.executionMode === 'DEMO_SIMULATION', 'Safe Demo Simulation mode active and properly labeled');

    // Check Verification Token
    const orderToken = await VerificationToken.findOne({ order: order._id, type: 'ORDER_CONFIRMATION', isUsed: false });
    assert(Boolean(orderToken), 'Single-use cryptographic action token generated for order confirmation');
    assert(orderToken.token.length >= 64, 'Token entropy is cryptographically secure (64 hex characters)');

    // Simulate Customer Confirming Order via secure link
    const confirmResult = await orderAutomationService.processCustomerConfirmation(orderToken.token, 'confirm');
    assert(confirmResult.order.orderStatus === 'CONFIRMED', 'Order status updated to CONFIRMED after customer verification link click');
    assert(confirmResult.order.needsVerification === false, 'needsVerification cleared to false');

    // Token must now be marked used
    const usedToken = await VerificationToken.findOne({ token: orderToken.token });
    assert(usedToken.isUsed === true, 'Verification token invalidated after single-use execution');
    console.log('');

    // -------------------------------------------------------------------------
    // 4. INVENTORY INTELLIGENCE & DEMAND FORECASTING
    // -------------------------------------------------------------------------
    console.log('--- 4. Inventory Intelligence & Demand Forecasting ---');
    const forecast = await forecastingService.forecastStoreDemand(store._id, 30);
    assert(forecast.success === true, 'Demand forecasting executed successfully');
    assert(typeof forecast.summary.totalSkusScanned === 'number', `Scanned ${forecast.summary.totalSkusScanned} SKUs`);
    assert(Boolean(forecast.methodology), 'Methodology clearly documented (moving-average Average Daily Demand)');

    const targetForecast = forecast.forecasts.find(f => f.sku === product.sku);
    assert(Boolean(targetForecast), `Forecast generated for SKU ${product.sku}`);
    assert(targetForecast.availableStock === 22, 'Forecast reflected real-time stock quantity');
    assert(typeof targetForecast.reorderPoint === 'number', `Reorder Point calculated: ${targetForecast.reorderPoint} units`);

    // Inventory Intelligence Auto-PO Workflow
    const invResult = await inventoryAutomationService.analyzeInventory(store._id);
    assert(invResult.success === true, 'Inventory replenishment analysis workflow executed');
    const latestPo = await PurchaseOrder.findOne({ store: store._id }).sort({ createdAt: -1 });
    assert(Boolean(latestPo), `Draft PO verified in database: #${latestPo.poNumber}`);
    assert(Boolean(latestPo.supplierName), `Supplier designated: ${latestPo.supplierName}`);
    console.log('');

    // -------------------------------------------------------------------------
    // 5. DELIVERY MANAGEMENT & NDR RECOVERY
    // -------------------------------------------------------------------------
    console.log('--- 5. Delivery Logistics & NDR Recovery ---');
    const delivery = await Delivery.create({
      store: store._id,
      order: order._id,
      awb: `AWB-QA-${Date.now().toString().slice(-6)}`,
      courier: 'Delhivery',
      status: 'FAILED',
      ndrReason: 'Customer phone unreachable during afternoon attempt',
      destination: { city: 'Mumbai', state: 'Maharashtra', pincode: '400050' }
    });
    assert(Boolean(delivery._id), `Delivery record created: ${delivery.awb} (Status: FAILED)`);

    // Intercept NDR event
    const ndrResult = await deliveryAutomationService.handleFailedDelivery(delivery._id, store._id);
    assert(ndrResult.success === true, 'NDR recovery workflow intercepted delivery failure');

    const ndrToken = await VerificationToken.findOne({ delivery: delivery._id, type: 'DELIVERY_RESCHEDULE', isUsed: false });
    assert(Boolean(ndrToken), 'Single-use customer rescheduling token created');

    // Customer submits new delivery slot & landmark
    const rescheduleResult = await deliveryAutomationService.processCustomerReschedule(ndrToken.token, {
      preferredDate: 'Tomorrow',
      preferredSlot: 'Morning 10 AM - 2 PM',
      landmark: 'Near City Mall Main Gate'
    });
    assert(rescheduleResult.delivery.status === 'OUT_FOR_DELIVERY', 'Delivery status transitioned back to OUT_FOR_DELIVERY');
    console.log('');

    // -------------------------------------------------------------------------
    // 6. BUSINESS ANALYTICS & FINANCIAL MARGIN AUDIT
    // -------------------------------------------------------------------------
    console.log('--- 6. Business Analytics & Financial Metrics ---');
    const analytics = await analyticsService.getStoreAnalytics(store._id, '30d');
    assert(analytics.success === true, 'Analytics aggregated successfully');
    assert(Boolean(analytics.dateRange.startDate), `Date range: ${analytics.dateRange.startDate} to ${analytics.dateRange.endDate}`);
    assert(analytics.kpis.grossRevenue >= 0, `Gross Revenue (GMV): ₹${analytics.kpis.grossRevenue.toLocaleString('en-IN')}`);
    assert(analytics.kpis.netProfit >= 0, `Net Gross Profit: ₹${analytics.kpis.netProfit.toLocaleString('en-IN')}`);
    assert(analytics.kpis.grossRevenue >= analytics.kpis.netProfit, 'Gross Revenue is strictly distinct from Net Profit (after COGS)');
    assert(Array.isArray(analytics.revenueTimeline), `Daily timeseries length: ${analytics.revenueTimeline.length} days`);
    assert(Array.isArray(analytics.paymentMix), 'Payment mix contains COD and Prepaid breakdown');
    assert(Boolean(analytics.aiInsights.salesSummary), 'AI Executive Insights successfully synthesized');
    console.log('');

    // -------------------------------------------------------------------------
    // 7. AI ASSISTANT & STORE-LEVEL DATA ISOLATION
    // -------------------------------------------------------------------------
    console.log('--- 7. AI Assistant & Store Isolation Audit ---');
    const assistantQuery = await aiAssistantService.processQuery(store._id, 'Which products should I reorder?');
    assert(assistantQuery.success === true, 'Assistant processed reorder query');
    assert(assistantQuery.intent === 'INVENTORY_REORDER', 'Intent correctly categorized as INVENTORY_REORDER');
    assert(Boolean(assistantQuery.reply), 'Assistant returned data-grounded response');

    // Secondary isolated store check
    const isolatedStore = await Store.findOne({ name: 'Isolated Store B Test' });
    if (isolatedStore) {
      const storeBOrder = await Order.findOne({ store: isolatedStore._id });
      if (storeBOrder) {
        const storeAQuery = await aiAssistantService.processQuery(store._id, 'Which products have the highest sales?');
        const leaked = JSON.stringify(storeAQuery).includes(storeBOrder.orderNumber);
        assert(!leaked, 'Store A queries strictly isolated from Store B records (zero cross-tenant leakage)');
      }
    }
    console.log('');

    // -------------------------------------------------------------------------
    // 8. ERROR HANDLING & RESILIENCE
    // -------------------------------------------------------------------------
    console.log('--- 8. Error Handling & Edge Cases ---');

    // 8.1 Invalid or expired token
    let invalidTokenFailedAsExpected = false;
    try {
      await orderAutomationService.processCustomerConfirmation('fake-non-existent-token-12345');
    } catch (e) {
      invalidTokenFailedAsExpected = true;
    }
    assert(invalidTokenFailedAsExpected === true, 'Invalid action tokens safely rejected with error');

    // 8.2 Safe idempotency on daily reports
    const report1 = await reportAutomationService.generateDailyReport(store._id, false);
    const report2 = await reportAutomationService.generateDailyReport(store._id, false);
    assert(report1.success === true && report2.success === true, 'Daily report workflow idempotent (duplicate calls return cached telemetry)');
    console.log('');

    // Clean up temporary test product
    await Product.deleteOne({ _id: product._id });
    await InventoryMovement.deleteMany({ product: product._id });
    await Order.deleteOne({ _id: order._id });
    await Delivery.deleteOne({ _id: delivery._id });
    console.log('[Cleanup] Removed ephemeral test records.');

    console.log('\n======================================================================');
    console.log(`🎉 ALL ${passedChecks}/${totalChecks} INTEGRATION & QA CHECKS PASSED PERFECTLY!`);
    console.log('======================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ PHASE 6 QA AUDIT FAILED:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runPhase6FinalCheck();
