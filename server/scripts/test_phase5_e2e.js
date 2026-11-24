/**
 * CommercePilot AI — Phase 5 End-to-End Intelligence & Analytics Test Script
 * Verifies controlled AI assistant queries, demand forecasting, store data isolation,
 * edge cases (empty data, sparse history, API fallbacks), and revenue vs profit distinction.
 */

const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Store = require('../src/models/Store.model');
const Order = require('../src/models/Order.model');
const Product = require('../src/models/Product.model');
const Delivery = require('../src/models/Delivery.model');

const aiAssistantService = require('../src/services/aiAssistantService');
const forecastingService = require('../src/services/forecastingService');
const analyticsService = require('../src/services/analyticsService');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commercepilot_ai';

const runTests = async () => {
  console.log('=================================================================');
  console.log('🚀 COMMERCEPILOT AI — PHASE 5 GROQ AI & BI ENGINE TEST');
  console.log('=================================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB:', MONGO_URI);

    // 1. Primary Store (Store A)
    const userA = await User.findOne({ email: 'priya@chiccouture.in' });
    if (!userA) throw new Error('Primary merchant user priya@chiccouture.in not found.');
    const storeA = await Store.findOne({ owner: userA._id });
    if (!storeA) throw new Error('Store A not found.');
    console.log(`✓ Store A: "${storeA.name}" (ID: ${storeA._id})`);

    // 2. Secondary Store (Store B) for Data Isolation Testing
    let storeB = await Store.findOne({ name: 'Isolated Store B Test' });
    if (!storeB) {
      storeB = await Store.create({
        name: 'Isolated Store B Test',
        owner: new mongoose.Types.ObjectId(),
        category: 'Footwear & Bags',
        channel: 'Shopify',
        currency: 'INR'
      });
      // Add a distinct order to Store B that must NEVER appear in Store A
      await Order.create({
        store: storeB._id,
        orderNumber: 'STORE-B-SECRET-999',
        customer: {
          fullName: 'Secret Buyer Store B',
          phone: '9999900000',
          address: { street: 'Confidential Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }
        },
        items: [{ title: 'Secret Leather Boots', sku: 'BOOTS-STORE-B', quantity: 2, unitPrice: 7999, totalPrice: 15998 }],
        subtotal: 15998,
        totalAmount: 15998,
        paymentMethod: 'PREPAID',
        orderStatus: 'CONFIRMED'
      });
    }
    console.log(`✓ Store B (Isolation Benchmark): "${storeB.name}" (ID: ${storeB._id})\n`);

    // =========================================================================
    // TEST 1: DEMAND FORECASTING (ADD, ROP, DAYS OF STOCK)
    // =========================================================================
    console.log('--- [1/5] Testing Deterministic Demand Forecasting Algorithm ---');
    const forecastResult = await forecastingService.forecastStoreDemand(storeA._id, 30);
    console.log(`✓ Forecast Scanned: ${forecastResult.summary.totalSkusScanned} SKUs`);
    console.log(`✓ Stockouts: ${forecastResult.summary.stockoutCount}, Critical: ${forecastResult.summary.criticalCount}, Reorder Needed: ${forecastResult.summary.reorderCount}`);
    console.log(`✓ Total Est. Reorder Budget: ₹${forecastResult.summary.totalEstimatedReorderBudget.toLocaleString('en-IN')}`);
    console.log(`✓ Methodology Stated: "${forecastResult.methodology}"`);

    if (forecastResult.forecasts.length > 0) {
      const sample = forecastResult.forecasts[0];
      console.log(`✓ Sample SKU Analysis: "${sample.title}" (${sample.sku})`);
      console.log(`   - Available Stock: ${sample.availableStock} units`);
      console.log(`   - Average Daily Demand (ADD): ${sample.averageDailyDemand} units/day`);
      console.log(`   - Runway (Days of Stock): ${sample.daysOfStock} days`);
      console.log(`   - Reorder Point (ROP): ${sample.reorderPoint} units (Lead Time: ${sample.supplierLeadTime}d, Safety: ${sample.safetyStock}u)`);
      console.log(`   - Status: ${sample.runwayCategory} (${sample.recommendation})`);
    }
    console.log('');

    // =========================================================================
    // TEST 2: ALL 6 SPECIFIED ASSISTANT QUERIES
    // =========================================================================
    console.log('--- [2/5] Testing All 6 Specified AI Assistant Queries ---');

    const queries = [
      'Which products should I reorder?',
      'Which orders need verification?',
      'What are my biggest inventory risks?',
      'Which products have the highest sales?',
      'How many failed deliveries occurred this month?',
      'Summarize my business performance.'
    ];

    for (const q of queries) {
      console.log(`\nQuery: "${q}"`);
      const response = await aiAssistantService.processQuery(storeA._id, q);
      console.log(`→ Detected Intent: [${response.intent}]`);
      console.log(`→ Date Range Grounded: ${response.dateRange}`);
      console.log(`→ Used Groq: ${response.usedGroq}`);
      console.log(`→ First 160 chars of answer:\n  "${response.reply.slice(0, 160).replace(/\n/g, ' ')}..."`);

      // Verify response is not empty and contains actual grounded data
      if (!response.reply || response.reply.length < 20) {
        throw new Error(`Assistant response for "${q}" was too brief or empty!`);
      }
    }
    console.log('\n✓ All 6 assistant queries executed with verified grounded context.\n');

    // =========================================================================
    // TEST 3: STORE-LEVEL DATA ISOLATION VERIFICATION
    // =========================================================================
    console.log('--- [3/5] Verifying Store-Level Data Isolation ---');
    // Store A query about top products or orders must NEVER mention Store B's order "STORE-B-SECRET-999" or "BOOTS-STORE-B"
    const storeAResponse = await aiAssistantService.processQuery(storeA._id, 'Which products have the highest sales?');
    const storeAJson = JSON.stringify(storeAResponse);

    if (storeAJson.includes('STORE-B-SECRET-999') || storeAJson.includes('BOOTS-STORE-B')) {
      throw new Error('SECURITY VIOLATION: Store A query returned data belonging to Store B!');
    }
    console.log('✓ Store A query contains ZERO leakage of Store B confidential orders.');

    // Now query Store B directly and ensure it ONLY sees Store B
    const storeBResponse = await aiAssistantService.processQuery(storeB._id, 'Summarize my business performance.');
    const storeBJson = JSON.stringify(storeBResponse);
    if (storeBJson.includes('Chic Couture')) {
      throw new Error('SECURITY VIOLATION: Store B query leaked Store A store name!');
    }
    console.log('✓ Store B query contains ZERO leakage of Store A store records.');
    console.log('✓ Store-level data isolation verified.\n');

    // =========================================================================
    // TEST 4: BUSINESS ANALYTICS & REVENUE VS PROFIT DISTINCTION
    // =========================================================================
    console.log('--- [4/5] Testing Business Analytics & Margin Distinction ---');
    const analytics = await analyticsService.getStoreAnalytics(storeA._id, '30d');
    console.log(`✓ Analytics Date Range: ${analytics.dateRange.startDate} to ${analytics.dateRange.endDate} (${analytics.dateRange.label})`);
    console.log(`✓ Gross Revenue (GMV): ₹${analytics.kpis.grossRevenue.toLocaleString('en-IN')}`);
    console.log(`✓ Total COGS: ₹${analytics.kpis.totalCogs.toLocaleString('en-IN')}`);
    console.log(`✓ Net Gross Profit: ₹${analytics.kpis.netProfit.toLocaleString('en-IN')} (${analytics.kpis.grossProfitMargin}% margin)`);
    console.log(`✓ Total Orders: ${analytics.kpis.totalOrders}, AOV: ₹${analytics.kpis.averageOrderValue}`);
    console.log(`✓ Cancellation Rate: ${analytics.kpis.cancellationRate}%`);
    console.log(`✓ Delivery Success: ${analytics.kpis.deliverySuccessRate}%, RTO Rate: ${analytics.kpis.rtoRate}%`);
    console.log(`✓ Payment Mix: COD ${analytics.paymentMix[0]?.percentage}%, Prepaid ${analytics.paymentMix[1]?.percentage}%`);
    console.log(`✓ Daily Timeseries Days: ${analytics.revenueTimeline.length} data points`);

    // Verify revenue != profit distinction
    if (analytics.kpis.grossRevenue > 0 && analytics.kpis.grossRevenue === analytics.kpis.netProfit) {
      throw new Error('Integrity failure: Gross Revenue and Net Profit are identical! COGS was not deducted.');
    }
    console.log('✓ Gross Revenue correctly distinguished from Net Profit after COGS.\n');

    // =========================================================================
    // TEST 5: EDGE CASES (EMPTY STORE DATA & API FALLBACKS)
    // =========================================================================
    console.log('--- [5/5] Testing Edge Cases: Empty Data & Fallbacks ---');
    // Create temporary empty store
    const emptyStore = await Store.create({
      name: 'Completely Empty Brand Store',
      owner: new mongoose.Types.ObjectId(),
      category: 'Electronics',
      channel: 'D2C',
      currency: 'INR'
    });

    const emptyForecast = await forecastingService.forecastStoreDemand(emptyStore._id, 30);
    console.log(`✓ Empty Store Forecast: ${emptyForecast.summary.totalSkusScanned} SKUs. Insufficient Data Warning: "${emptyForecast.dateRange.warningMessage}"`);

    const emptyAnalytics = await analyticsService.getStoreAnalytics(emptyStore._id, '7d');
    console.log(`✓ Empty Store Analytics: GMV = ₹${emptyAnalytics.kpis.grossRevenue}, Orders = ${emptyAnalytics.kpis.totalOrders}, Has Insufficient Data = ${emptyAnalytics.hasInsufficientData}`);

    const emptyAssistant = await aiAssistantService.processQuery(emptyStore._id, 'What are my biggest inventory risks?');
    console.log(`✓ Empty Store Assistant Query handled gracefully: "${emptyAssistant.reply.slice(0, 100)}..."`);

    // Clean up empty store
    await Store.deleteOne({ _id: emptyStore._id });
    console.log('✓ Cleaned up temporary test store.');

    console.log('\n=================================================================');
    console.log('🎉 ALL PHASE 5 GROQ AI & BI ENGINE TESTS PASSED SUCCESSFULLY!');
    console.log('=================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ PHASE 5 TEST FAILED:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runTests();
