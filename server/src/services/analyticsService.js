const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Delivery = require('../models/Delivery.model');
const InventoryMovement = require('../models/InventoryMovement.model');
const forecastingService = require('./forecastingService');
const { generateGroqCompletion } = require('./groq.service');

/**
 * Business Analytics & AI Insights Service
 * Computes deterministic financial metrics, timeseries breakdowns, and grounded Groq AI insights.
 */
const analyticsService = {
  /**
   * Get complete analytical metrics and charts
   * @param {string|ObjectId} storeId
   * @param {string} range - '7d', '30d', '90d', 'all'
   */
  getStoreAnalytics: async (storeId, range = '30d') => {
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;
    else if (range === 'all') days = 365;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days,
      label: range === '7d' ? 'Last 7 Days' : range === '90d' ? 'Last 90 Days' : range === 'all' ? 'All Time (Past 365d)' : 'Last 30 Days'
    };

    // 1. Fetch Orders in Period
    const orders = await Order.find({
      store: storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: 1 }).lean();

    // 2. Fetch Active Products to get true Cost of Goods Sold (COGS)
    const products = await Product.find({ store: storeId, status: { $ne: 'archived' } }).lean();
    const productCostMap = {};
    const productPriceMap = {};
    products.forEach(p => {
      productCostMap[p.sku] = p.costPrice || Math.round((p.sellingPrice || 1000) * 0.45);
      productPriceMap[p.sku] = p.sellingPrice || 1000;
    });

    // 3. Fetch Deliveries in Period
    const deliveries = await Delivery.find({
      store: storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    // 4. Fetch Recent Inventory Movements
    const movements = await InventoryMovement.find({
      store: storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 }).limit(20).lean();

    // 5. Data sufficiency check
    const hasInsufficientData = orders.length < 5;

    // -------------------------------------------------------------------------
    // DETERMINISTIC KPI METRICS (Distinguishing Revenue from Profit)
    // -------------------------------------------------------------------------
    const validOrders = orders.filter(o => o.orderStatus !== 'CANCELLED');
    const cancelledOrders = orders.filter(o => o.orderStatus === 'CANCELLED');

    const totalOrdersCount = validOrders.length;
    const cancelledOrdersCount = cancelledOrders.length;
    const cancellationRate = (totalOrdersCount + cancelledOrdersCount) > 0
      ? Number(((cancelledOrdersCount / (totalOrdersCount + cancelledOrdersCount)) * 100).toFixed(1))
      : 0;

    // Gross Revenue (GMV)
    const grossRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Compute exact Cost of Goods Sold (COGS) by summing item unit costs
    let totalCogs = 0;
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const sku = (item.sku || '').toUpperCase();
        const unitCost = productCostMap[sku] || Math.round((item.unitPrice || 1000) * 0.45);
        totalCogs += unitCost * (item.quantity || 1);
      });
    });

    // Net Gross Profit = Gross Revenue - COGS
    const netProfit = grossRevenue - totalCogs;
    const grossProfitMargin = grossRevenue > 0
      ? Number(((netProfit / grossRevenue) * 100).toFixed(1))
      : 0;
    const averageOrderValue = totalOrdersCount > 0
      ? Math.round(grossRevenue / totalOrdersCount)
      : 0;

    // -------------------------------------------------------------------------
    // PAYMENT METHOD BREAKDOWN: COD vs PREPAID
    // -------------------------------------------------------------------------
    const codOrders = validOrders.filter(o => o.paymentMethod === 'COD');
    const prepaidOrders = validOrders.filter(o => o.paymentMethod === 'PREPAID');
    const codRevenue = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const prepaidRevenue = prepaidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const paymentMix = [
      {
        name: 'Cash on Delivery (COD)',
        orders: codOrders.length,
        revenue: codRevenue,
        percentage: totalOrdersCount > 0 ? Number(((codOrders.length / totalOrdersCount) * 100).toFixed(1)) : 0
      },
      {
        name: 'Prepaid (UPI / Cards)',
        orders: prepaidOrders.length,
        revenue: prepaidRevenue,
        percentage: totalOrdersCount > 0 ? Number(((prepaidOrders.length / totalOrdersCount) * 100).toFixed(1)) : 0
      }
    ];

    // -------------------------------------------------------------------------
    // DAILY TIMESERIES (Revenue, Net Profit, Orders, Cancellations)
    // -------------------------------------------------------------------------
    const dateMap = {};
    // Pre-populate all days in range to ensure smooth charts with no gaps
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = {
        date: key,
        formattedDate: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: 0,
        profit: 0,
        cogs: 0,
        orders: 0,
        cancellations: 0
      };
    }

    orders.forEach(o => {
      const key = o.createdAt.toISOString().split('T')[0];
      if (dateMap[key]) {
        if (o.orderStatus === 'CANCELLED') {
          dateMap[key].cancellations += 1;
        } else {
          const rev = o.totalAmount || 0;
          let orderCost = 0;
          (o.items || []).forEach(item => {
            const sku = (item.sku || '').toUpperCase();
            const unitCost = productCostMap[sku] || Math.round((item.unitPrice || 1000) * 0.45);
            orderCost += unitCost * (item.quantity || 1);
          });

          dateMap[key].revenue += rev;
          dateMap[key].cogs += orderCost;
          dateMap[key].profit += (rev - orderCost);
          dateMap[key].orders += 1;
        }
      }
    });

    const revenueTimeline = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    // -------------------------------------------------------------------------
    // DELIVERY PERFORMANCE & NDR METRICS
    // -------------------------------------------------------------------------
    const totalDeliveries = deliveries.length;
    const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;
    const failedCount = deliveries.filter(d => d.status === 'FAILED').length;
    const rtoCount = deliveries.filter(d => d.status === 'RTO').length;
    const inTransitCount = deliveries.filter(d => d.status === 'SHIPPED' || d.status === 'OUT_FOR_DELIVERY').length;

    const deliverySuccessRate = totalDeliveries > 0
      ? Number(((deliveredCount / totalDeliveries) * 100).toFixed(1))
      : 0;
    const rtoRate = totalDeliveries > 0
      ? Number(((rtoCount / totalDeliveries) * 100).toFixed(1))
      : 0;

    const deliveryBreakdown = [
      { status: 'DELIVERED', label: 'Delivered Successfully', count: deliveredCount, color: '#10B981' },
      { status: 'IN_TRANSIT', label: 'Out for Delivery / In Transit', count: inTransitCount, color: '#38BDF8' },
      { status: 'FAILED', label: 'Failed Delivery (NDR)', count: failedCount, color: '#F59E0B' },
      { status: 'RTO', label: 'Return to Origin (RTO)', count: rtoCount, color: '#EF4444' }
    ];

    // -------------------------------------------------------------------------
    // PRODUCT PERFORMANCE & MARGINS
    // -------------------------------------------------------------------------
    const productSales = {};
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const sku = (item.sku || 'UNKNOWN').toUpperCase();
        if (!productSales[sku]) {
          productSales[sku] = {
            sku,
            title: item.title,
            unitsSold: 0,
            revenue: 0,
            cogs: 0
          };
        }
        const unitCost = productCostMap[sku] || Math.round((item.unitPrice || 1000) * 0.45);
        productSales[sku].unitsSold += (item.quantity || 1);
        productSales[sku].revenue += (item.totalPrice || item.unitPrice * (item.quantity || 1) || 0);
        productSales[sku].cogs += unitCost * (item.quantity || 1);
      });
    });

    const productPerformanceList = Object.values(productSales).map(p => {
      const grossProfit = p.revenue - p.cogs;
      const margin = p.revenue > 0 ? Number(((grossProfit / p.revenue) * 100).toFixed(1)) : 0;
      return {
        sku: p.sku,
        title: p.title,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
        cogs: p.cogs,
        grossProfit,
        profitMargin: margin
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // -------------------------------------------------------------------------
    // INVENTORY VALUATION & REORDER DEMAND FORECAST
    // -------------------------------------------------------------------------
    const forecastData = await forecastingService.forecastStoreDemand(storeId, days);
    let totalStockUnits = 0;
    let totalValuationCost = 0;
    let totalValuationRetail = 0;

    products.forEach(p => {
      const stock = Number(p.stockQuantity) || 0;
      const cost = Number(p.costPrice) || Math.round((p.sellingPrice || 1000) * 0.45);
      const retail = Number(p.sellingPrice) || cost * 2;
      totalStockUnits += stock;
      totalValuationCost += stock * cost;
      totalValuationRetail += stock * retail;
    });

    // -------------------------------------------------------------------------
    // AI INSIGHTS GENERATION (Grounded & Controlled)
    // -------------------------------------------------------------------------
    const aiInsights = await generateAiInsights({
      storeName: 'Your Store',
      dateRange,
      kpis: {
        grossRevenue,
        netProfit,
        grossProfitMargin,
        totalOrdersCount,
        aov: averageOrderValue,
        averageOrderValue,
        cancellationRate,
        codPercentage: paymentMix[0]?.percentage || 0,
        deliverySuccessRate,
        rtoRate
      },
      topProducts: productPerformanceList.slice(0, 3),
      inventory: {
        totalStockUnits,
        criticalCount: forecastData.summary?.criticalCount || 0,
        reorderCount: forecastData.summary?.reorderCount || 0,
        stockoutCount: forecastData.summary?.stockoutCount || 0
      },
      hasInsufficientData
    });

    return {
      success: true,
      dateRange,
      kpis: {
        grossRevenue,
        netProfit,
        totalCogs,
        grossProfitMargin,
        totalOrders: totalOrdersCount,
        cancelledOrders: cancelledOrdersCount,
        cancellationRate,
        averageOrderValue,
        aov: averageOrderValue,
        deliverySuccessRate,
        rtoRate
      },
      paymentMix,
      revenueTimeline,
      deliveryBreakdown,
      productPerformance: productPerformanceList,
      inventorySummary: {
        totalStockUnits,
        totalCatalogSkus: products.length,
        valuationAtCost: totalValuationCost,
        valuationAtRetail: totalValuationRetail,
        criticalSkusCount: forecastData.summary?.criticalCount || 0,
        reorderNeededCount: forecastData.summary?.reorderCount || 0,
        stockoutCount: forecastData.summary?.stockoutCount || 0,
        forecasts: forecastData.forecasts
      },
      recentMovements: movements,
      aiInsights,
      hasInsufficientData
    };
  }
};

/**
 * Generate 5 Grounded AI Insights using Groq or Fallback
 */
const generateAiInsights = async (context) => {
  const { dateRange, kpis, topProducts, inventory, hasInsufficientData } = context;

  // Rule-based deterministic insight templates
  const grossRevStr = (kpis.grossRevenue || 0).toLocaleString('en-IN');
  const aovStr = (kpis.averageOrderValue || kpis.aov || 0).toLocaleString('en-IN');
  const profitStr = (kpis.netProfit || 0).toLocaleString('en-IN');
  const salesSummaryText = `Generated gross revenue of ₹${grossRevStr} across ${kpis.totalOrdersCount || 0} completed orders with an Average Order Value (AOV) of ₹${aovStr}. Estimated net gross profit realized is ₹${profitStr} (${kpis.grossProfitMargin || 0}% margin).`;

  const inventoryWarningText = inventory.criticalCount > 0 || inventory.stockoutCount > 0
    ? `Identified ${inventory.stockoutCount} stockout(s) and ${inventory.criticalCount} SKU(s) where days of stock have breached supplier lead times. Immediate purchase orders required.`
    : `All active product stock levels are healthy for the current sales velocity. ${inventory.reorderCount} SKU(s) are approaching replenishment thresholds.`;

  const productPerformanceText = topProducts.length > 0
    ? `Top revenue driver is "${topProducts[0].title}" generating ₹${topProducts[0].revenue.toLocaleString('en-IN')} with ${topProducts[0].unitsSold} units sold at a ${topProducts[0].profitMargin}% gross margin.`
    : `Product ranking will populate as customer orders accumulate.`;

  const customerPatternText = `${kpis.codPercentage}% of order volume was transacted via Cash on Delivery (COD). Courier delivery success rate stands at ${kpis.deliverySuccessRate}%, with an RTO loss rate of ${kpis.rtoRate}%.`;

  const operationalRecommendationText = kpis.codPercentage > 50
    ? `Maintain automated email verification on all COD orders exceeding ₹3,000 to suppress courier return penalties. Prioritize replenishing ${inventory.criticalCount} low-stock SKU(s).`
    : `Healthy prepaid order ratio observed. Focus marketing on high-margin collections.`;

  let groqSummary = '';
  try {
    const prompt = `Synthesize 5 brief, data-grounded ecommerce operational insights for ${dateRange.label}:
- Gross Revenue: ₹${kpis.grossRevenue} | Net Profit: ₹${kpis.netProfit} (${kpis.grossProfitMargin}% margin)
- Total Orders: ${kpis.totalOrdersCount} | AOV: ₹${kpis.averageOrderValue}
- COD Share: ${kpis.codPercentage}% | Delivery Success: ${kpis.deliverySuccessRate}% | RTO Rate: ${kpis.rtoRate}%
- Low/Critical Stock SKUs: ${inventory.criticalCount} | Stockouts: ${inventory.stockoutCount}
- Top Product: ${topProducts[0]?.title || 'N/A'} (₹${topProducts[0]?.revenue || 0})

Format strictly as JSON with keys:
"salesSummary", "inventoryWarnings", "productPerformance", "customerPatterns", "operationalRecommendations".
Distinguish revenue from profit. Do not invent facts.`;

    const raw = await generateGroqCompletion({
      prompt,
      systemPrompt: 'You are CommercePilot AI Analytics Engine. Output strictly JSON without markdown wrappers.'
    });

    const parsed = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
    return {
      salesSummary: parsed.salesSummary || salesSummaryText,
      inventoryWarnings: parsed.inventoryWarnings || inventoryWarningText,
      productPerformance: parsed.productPerformance || productPerformanceText,
      customerPatterns: parsed.customerPatterns || customerPatternText,
      operationalRecommendations: parsed.operationalRecommendations || operationalRecommendationText,
      dateRangeLabel: dateRange.label,
      generatedBy: 'Groq Llama 3.3',
      disclaimer: 'Calculated via deterministic store telemetry. Treat LLM insights as operational recommendations.'
    };
  } catch (err) {
    // Graceful fallback to deterministic rule-based insights
    return {
      salesSummary: salesSummaryText,
      inventoryWarnings: inventoryWarningText,
      productPerformance: productPerformanceText,
      customerPatterns: customerPatternText,
      operationalRecommendations: operationalRecommendationText,
      dateRangeLabel: dateRange.label,
      generatedBy: 'Deterministic Rule Engine',
      disclaimer: 'Calculated via deterministic store telemetry. Treat LLM insights as operational recommendations.'
    };
  }
};

module.exports = analyticsService;
