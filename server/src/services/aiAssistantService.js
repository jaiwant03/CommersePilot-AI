const { generateGroqCompletion } = require('./groq.service');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Delivery = require('../models/Delivery.model');
const Store = require('../models/Store.model');
const forecastingService = require('./forecastingService');

/**
 * Classify user intent deterministically and securely
 */
const detectIntent = (query = '') => {
  const q = query.toLowerCase();

  // 1. Inventory Risks (check before generic risk or verification)
  if (q.includes('inventory risk') || q.includes('stockout') || q.includes('runway') || q.includes('dead stock') || q.includes('overstock') || (q.includes('stock') && q.includes('risk'))) {
    return 'INVENTORY_RISKS';
  }
  // 2. Delivery Failures and NDRs
  if (q.includes('failed deliver') || q.includes('delivery failure') || q.includes('ndr') || q.includes('rto') || q.includes('courier') || q.includes('deliveries') || q.includes('delivery')) {
    return 'DELIVERY_FAILURES';
  }
  // 3. Inventory Reorder & Replenishment
  if (q.includes('reorder') || q.includes('restock') || q.includes('purchase order') || (q.includes('which product') && q.includes('order'))) {
    return 'INVENTORY_REORDER';
  }
  // 4. Order Verification & Fraud
  if (q.includes('verification') || q.includes('verify') || q.includes('order risk') || q.includes('fraud') || q.includes('hold') || (q.includes('order') && q.includes('risk'))) {
    return 'ORDER_VERIFICATION';
  }
  // 4a. Highest Profit & Margin
  if (q.includes('highest profit') || q.includes('most profitable') || q.includes('profit margin') || q.includes('highest margin') || q.includes('best margin') || q.includes('margin')) {
    return 'HIGHEST_PROFIT';
  }
  // 4b. Returning / Repeat Customers
  if (q.includes('returning customer') || q.includes('repeat customer') || q.includes('repeat buyer') || q.includes('retention') || q.includes('loyal customer')) {
    return 'RETURNING_CUSTOMERS';
  }
  // 4c. Product Promotion & Campaigns
  if (q.includes('promote') || q.includes('promotion') || q.includes('campaign') || q.includes('ad recommendation') || q.includes('what to promote') || q.includes('marketing')) {
    return 'PRODUCT_PROMOTION';
  }
  // 5. Top Products & Best Sellers
  if (q.includes('highest sale') || q.includes('best seller') || q.includes('top product') || q.includes('top selling') || q.includes('popular') || q.includes('most sold')) {
    return 'TOP_PRODUCTS';
  }
  // 6. Business Summary & Overview
  if (q.includes('summarize') || q.includes('summary') || q.includes('performance') || q.includes('how is my business') || q.includes('revenue') || q.includes('profit') || q.includes('health') || q.includes('overview')) {
    return 'BUSINESS_SUMMARY';
  }

  return 'GENERAL_OPERATIONS';
};

/**
 * AI Business Assistant Service
 * Controlled, grounded AI assistant answering ecommerce queries strictly using authorized store data.
 */
const aiAssistantService = {
  /**
   * Process seller query with data grounding
   * @param {string|ObjectId} storeId
   * @param {string} prompt
   */
  processQuery: async (storeId, prompt) => {
    const store = await Store.findById(storeId).lean();
    if (!store) {
      throw new Error('Authorized store record not found.');
    }

    const intent = detectIntent(prompt);
    const currentDateStr = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateRangeStr = `Last 30 Days (${thirtyDaysAgo.toISOString().split('T')[0]} to ${currentDateStr})`;

    let groundedData = {};
    let fallbackText = '';

    // =========================================================================
    // CATEGORY 1: INVENTORY REORDER
    // =========================================================================
    if (intent === 'INVENTORY_REORDER') {
      const forecastResult = await forecastingService.forecastStoreDemand(storeId, 30);
      const reorderItems = (forecastResult.forecasts || []).filter(f =>
        f.runwayCategory === 'OUT_OF_STOCK' ||
        f.runwayCategory === 'CRITICAL_RUNWAY' ||
        f.runwayCategory === 'REORDER_RECOMMENDED'
      );

      groundedData = {
        category: 'INVENTORY_REORDER',
        dateRange: dateRangeStr,
        totalSkusEvaluated: forecastResult.summary?.totalSkusScanned || 0,
        skusNeedingReorderCount: reorderItems.length,
        totalEstimatedBudget: forecastResult.summary?.totalEstimatedReorderBudget || 0,
        itemsToReorder: reorderItems.map(item => ({
          sku: item.sku,
          title: item.title,
          currentStock: item.availableStock,
          averageDailyDemand: `${item.averageDailyDemand} units/day`,
          daysOfStockLeft: item.daysOfStock === 0 ? 'Out of stock' : `${item.daysOfStock} days`,
          reorderPoint: item.reorderPoint,
          suggestedQuantity: item.suggestedReorderQuantity,
          unitCost: `₹${item.costPrice}`,
          estimatedCost: `₹${item.estimatedReorderCost}`,
          urgency: item.runwayCategory === 'OUT_OF_STOCK' ? 'IMMEDIATE (0 stock)' : item.runwayCategory === 'CRITICAL_RUNWAY' ? 'CRITICAL' : 'RECOMMENDED'
        })),
        insufficientDataWarning: forecastResult.dateRange?.warningMessage || null
      };

      if (reorderItems.length === 0) {
        fallbackText = `Based on verified 30-day sales demand for **${store.name}**, all active products are currently above their reorder points. No purchase orders are needed today.`;
      } else {
        fallbackText = `Here are the products requiring reorder for **${store.name}** (based on 30-day Average Daily Demand):\n\n` +
          reorderItems.map(i => `• **${i.title}** (${i.sku}): ${i.availableStock} in stock (${i.daysOfStock}d runway left). Reorder Point: ${i.reorderPoint}. **Suggested Restock: ${i.suggestedReorderQuantity} units** (Est. Cost: ₹${i.estimatedReorderCost}).`).join('\n') +
          `\n\nTotal estimated replenishment capital needed: **₹${forecastResult.summary?.totalEstimatedReorderBudget?.toLocaleString('en-IN')}**.`;
      }
    }

    // =========================================================================
    // CATEGORY 2: ORDER VERIFICATION
    // =========================================================================
    else if (intent === 'ORDER_VERIFICATION') {
      const flaggedOrders = await Order.find({
        store: storeId,
        $or: [{ needsVerification: true }, { riskScore: { $gte: 40 } }, { orderStatus: 'ON_HOLD' }]
      }).sort({ createdAt: -1 }).limit(10).lean();

      groundedData = {
        category: 'ORDER_VERIFICATION',
        dateRange: dateRangeStr,
        flaggedOrdersCount: flaggedOrders.length,
        orders: flaggedOrders.map(o => ({
          orderNumber: o.orderNumber,
          buyerName: o.customer?.fullName,
          city: o.customer?.address?.city,
          amount: `₹${o.totalAmount}`,
          paymentMethod: o.paymentMethod,
          riskScore: o.riskScore ? `${o.riskScore}/100 (${o.riskLevel || 'MEDIUM'})` : 'Awaiting score',
          status: o.orderStatus,
          verificationStatus: o.needsVerification ? 'Action Required (Email confirmation sent)' : 'Cleared/Pending',
          notes: o.notes || 'Flagged for high COD basket value or address verification'
        }))
      };

      if (flaggedOrders.length === 0) {
        fallbackText = `Great news! There are currently **0 high-risk COD orders** requiring verification in **${store.name}**. All recent orders have either completed verification or passed deterministic risk thresholds.`;
      } else {
        fallbackText = `You currently have **${flaggedOrders.length} order(s)** needing verification before dispatch:\n\n` +
          flaggedOrders.map(o => `• **#${o.orderNumber}** (${o.customer?.fullName}, ₹${o.totalAmount} ${o.paymentMethod}): Risk score **${o.riskScore}/100**. ${o.needsVerification ? 'Verification email dispatched to buyer.' : 'Marked on hold.'}`).join('\n') +
          `\n\n*Recommendation:* Do not pack or hand over high-risk COD shipments until the buyer confirms via their secure email link.`;
      }
    }

    // =========================================================================
    // CATEGORY 3: INVENTORY RISKS
    // =========================================================================
    else if (intent === 'INVENTORY_RISKS') {
      const forecastResult = await forecastingService.forecastStoreDemand(storeId, 30);
      const stockouts = (forecastResult.forecasts || []).filter(f => f.runwayCategory === 'OUT_OF_STOCK');
      const criticalRunways = (forecastResult.forecasts || []).filter(f => f.runwayCategory === 'CRITICAL_RUNWAY');
      const overstocks = (forecastResult.forecasts || []).filter(f => f.runwayCategory === 'OVERSTOCK_RISK');
      const slowMoving = (forecastResult.forecasts || []).filter(f => f.runwayCategory === 'SLOW_MOVING');

      groundedData = {
        category: 'INVENTORY_RISKS',
        dateRange: dateRangeStr,
        stockoutCount: stockouts.length,
        stockoutSkus: stockouts.map(s => `${s.title} (${s.sku})`),
        criticalRunwayCount: criticalRunways.length,
        criticalSkus: criticalRunways.map(s => `${s.title} (${s.daysOfStock} days left, lead time: ${s.supplierLeadTime}d)`),
        overstockCount: overstocks.length,
        slowMovingCount: slowMoving.length,
        totalInventoryValueCost: (forecastResult.forecasts || []).reduce((sum, f) => sum + (f.availableStock * f.costPrice), 0)
      };

      fallbackText = `Here is your inventory risk assessment for **${store.name}**:\n` +
        `• **Immediate Stockouts (0 units):** ${stockouts.length} SKU(s) ${stockouts.length > 0 ? `(${stockouts.map(s => s.title).join(', ')})` : '— None'}\n` +
        `• **Critical Runways (< Supplier Lead Time):** ${criticalRunways.length} SKU(s) at immediate risk of stocking out before delivery arrives\n` +
        `• **Dead / Slow-Moving Capital:** ${slowMoving.length} SKU(s) had 0 sales in the last 30 days\n\n` +
        `*Action Plan:* Prioritize replenishing ${criticalRunways.map(s => s.title).join(', ') || 'critical SKUs'} to prevent revenue loss.`;
    }

    // =========================================================================
    // CATEGORY 4: TOP PRODUCTS & PERFORMANCE
    // =========================================================================
    else if (intent === 'TOP_PRODUCTS') {
      const salesAgg = await Order.aggregate([
        { $match: { store: storeId, orderStatus: { $ne: 'CANCELLED' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.sku',
            title: { $first: '$items.title' },
            unitsSold: { $sum: '$items.quantity' },
            grossRevenue: { $sum: '$items.totalPrice' },
            unitPrice: { $first: '$items.unitPrice' }
          }
        },
        { $sort: { grossRevenue: -1 } },
        { $limit: 5 }
      ]);

      // Fetch cost prices to compute actual gross profit
      const skus = salesAgg.map(s => s._id);
      const productDocs = await Product.find({ store: storeId, sku: { $in: skus } }).select('sku costPrice sellingPrice').lean();
      const costMap = {};
      productDocs.forEach(p => { costMap[p.sku] = p.costPrice || Math.round(p.sellingPrice * 0.45); });

      const topProductsWithProfit = salesAgg.map(item => {
        const cost = costMap[item._id] || Math.round((item.unitPrice || 1000) * 0.45);
        const totalCost = cost * item.unitsSold;
        const grossProfit = item.grossRevenue - totalCost;
        const profitMargin = item.grossRevenue > 0 ? Number(((grossProfit / item.grossRevenue) * 100).toFixed(1)) : 0;

        return {
          sku: item._id,
          title: item.title,
          unitsSold: item.unitsSold,
          grossRevenue: `₹${item.grossRevenue.toLocaleString('en-IN')}`,
          costOfGoodsSold: `₹${totalCost.toLocaleString('en-IN')}`,
          grossProfit: `₹${grossProfit.toLocaleString('en-IN')}`,
          profitMarginPercentage: `${profitMargin}%`
        };
      });

      groundedData = {
        category: 'TOP_PRODUCTS',
        dateRange: 'All Recorded Completed Orders',
        topProductsCount: topProductsWithProfit.length,
        topProducts: topProductsWithProfit,
        distinctionNote: 'Gross Revenue is total customer billed amount; Gross Profit is Revenue minus Cost of Goods Sold.'
      };

      if (topProductsWithProfit.length === 0) {
        fallbackText = `No recorded sales yet for **${store.name}**. Top product rankings will automatically appear once customer orders are placed.`;
      } else {
        fallbackText = `Top selling products for **${store.name}** (distinguishing Gross Revenue from Net Profit):\n\n` +
          topProductsWithProfit.map((p, idx) => `${idx + 1}. **${p.title}** (${p.sku})\n   • Units Sold: ${p.unitsSold} | Gross Revenue: ${p.grossRevenue}\n   • Est. COGS: ${p.costOfGoodsSold} | **Gross Profit: ${p.grossProfit} (${p.profitMarginPercentage} margin)**`).join('\n\n');
      }
    }

    // =========================================================================
    // CATEGORY 4a: HIGHEST PROFIT MARGIN PRODUCTS
    // =========================================================================
    else if (intent === 'HIGHEST_PROFIT') {
      const products = await Product.find({ store: storeId, status: { $ne: 'archived' } }).lean();
      const marginCalculations = products.map(p => {
        const sellingPrice = p.sellingPrice || 0;
        const costPrice = p.costPrice || Math.round(sellingPrice * 0.45);
        const unitProfit = sellingPrice - costPrice;
        const marginPct = sellingPrice > 0 ? Number(((unitProfit / sellingPrice) * 100).toFixed(1)) : 0;
        return {
          sku: p.sku,
          title: p.title,
          category: p.category,
          stock: p.stockQuantity,
          sellingPrice: `₹${sellingPrice.toLocaleString('en-IN')}`,
          costPrice: `₹${costPrice.toLocaleString('en-IN')}`,
          unitGrossProfit: `₹${unitProfit.toLocaleString('en-IN')}`,
          profitMarginPercentage: marginPct,
          rawMargin: marginPct
        };
      }).sort((a, b) => b.rawMargin - a.rawMargin);

      const topMarginProducts = marginCalculations.slice(0, 5);

      groundedData = {
        category: 'HIGHEST_PROFIT',
        catalogSize: products.length,
        topMarginProducts: topMarginProducts.map(p => ({
          sku: p.sku,
          title: p.title,
          sellingPrice: p.sellingPrice,
          costPrice: p.costPrice,
          unitGrossProfit: p.unitGrossProfit,
          profitMargin: `${p.profitMarginPercentage}%`,
          availableStock: p.stock
        }))
      };

      fallbackText = `Highest profit margin products for **${store.name}**:\n\n` +
        topMarginProducts.map((p, idx) => `${idx + 1}. **${p.title}** (${p.sku})\n   • Selling Price: ${p.sellingPrice} | Unit Cost: ${p.costPrice}\n   • **Unit Gross Profit: ${p.unitGrossProfit} (${p.profitMarginPercentage}% margin)** | Stock: ${p.stock} units`).join('\n\n') +
        `\n\n*Strategic Takeaway:* Items with >60% gross profit margin provide the highest buffer for ad spend (ROAS) and promotional discounts.`;
    }

    // =========================================================================
    // CATEGORY 4b: RETURNING & REPEAT CUSTOMERS
    // =========================================================================
    else if (intent === 'RETURNING_CUSTOMERS') {
      const orders = await Order.find({ store: storeId, orderStatus: { $ne: 'CANCELLED' } }).lean();
      const customerMap = {};

      orders.forEach(o => {
        const key = (o.customer?.email || o.customer?.phone || o.customer?.fullName || 'unknown').toLowerCase().trim();
        if (!customerMap[key]) {
          customerMap[key] = {
            name: o.customer?.fullName || o.customer?.name || 'Customer',
            email: o.customer?.email || 'N/A',
            phone: o.customer?.phone || 'N/A',
            city: o.customer?.address?.city || o.customer?.city || 'N/A',
            orderCount: 0,
            totalSpent: 0
          };
        }
        customerMap[key].orderCount += 1;
        customerMap[key].totalSpent += (o.totalAmount || 0);
      });

      const customerList = Object.values(customerMap);
      const totalUniqueCustomers = customerList.length;
      const repeatCustomers = customerList.filter(c => c.orderCount >= 2).sort((a, b) => b.totalSpent - a.totalSpent);
      const repeatRate = totalUniqueCustomers > 0 ? Number(((repeatCustomers.length / totalUniqueCustomers) * 100).toFixed(1)) : 0;

      groundedData = {
        category: 'RETURNING_CUSTOMERS',
        totalUniqueCustomers,
        repeatCustomerCount: repeatCustomers.length,
        repeatCustomerRate: `${repeatRate}%`,
        topLoyalCustomers: repeatCustomers.slice(0, 5).map(c => ({
          name: c.name,
          city: c.city,
          ordersPlaced: c.orderCount,
          totalLifetimeValue: `₹${c.totalSpent.toLocaleString('en-IN')}`
        }))
      };

      if (repeatCustomers.length === 0) {
        fallbackText = `You currently have **${totalUniqueCustomers} unique customer(s)** for **${store.name}**, with 0 recorded repeat buyers yet. Focus on post-purchase WhatsApp engagement and loyalty discounts to drive second-order conversion.`;
      } else {
        fallbackText = `Customer Retention & Loyalty Report for **${store.name}**:\n\n` +
          `• **Total Unique Customers:** ${totalUniqueCustomers}\n` +
          `• **Returning Customers (2+ orders):** ${repeatCustomers.length} (${repeatRate}% repeat buyer rate)\n\n` +
          `**Top Returning Buyers:**\n` +
          repeatCustomers.slice(0, 5).map(c => `• **${c.name}** (${c.city}): ${c.orderCount} orders placed | LTV: ₹${c.totalSpent.toLocaleString('en-IN')}`).join('\n') +
          `\n\n*Actionable Insight:* Send exclusive preview drops to your repeat buyers to maximize high-margin organic conversions.`;
      }
    }

    // =========================================================================
    // CATEGORY 4c: PRODUCT PROMOTION & CAMPAIGNS
    // =========================================================================
    else if (intent === 'PRODUCT_PROMOTION') {
      const [products, forecastResult] = await Promise.all([
        Product.find({ store: storeId, status: { $ne: 'archived' } }).lean(),
        forecastingService.forecastStoreDemand(storeId, 30)
      ]);

      const runwayMap = {};
      (forecastResult.forecasts || []).forEach(f => {
        runwayMap[f.sku] = f.daysOfStock;
      });

      // Filter products with sufficient stock (>= 15 units or >= 7 days runway) and margin >= 50%
      const candidates = products.map(p => {
        const sellingPrice = p.sellingPrice || 0;
        const costPrice = p.costPrice || Math.round(sellingPrice * 0.45);
        const unitProfit = sellingPrice - costPrice;
        const marginPct = sellingPrice > 0 ? Number(((unitProfit / sellingPrice) * 100).toFixed(1)) : 0;
        const runway = runwayMap[p.sku] ?? (p.stockQuantity > 20 ? 14 : 3);

        return {
          sku: p.sku,
          title: p.title,
          category: p.category,
          stock: p.stockQuantity,
          runwayDays: runway,
          sellingPrice: `₹${sellingPrice.toLocaleString('en-IN')}`,
          marginPct,
          unitProfit: `₹${unitProfit.toLocaleString('en-IN')}`
        };
      })
      .filter(p => p.stock >= 15 && p.marginPct >= 50)
      .sort((a, b) => b.marginPct - a.marginPct);

      groundedData = {
        category: 'PRODUCT_PROMOTION',
        recommendedSkusCount: candidates.length,
        recommendations: candidates.slice(0, 4).map(c => ({
          sku: c.sku,
          title: c.title,
          stockAvailable: c.stock,
          margin: `${c.marginPct}%`,
          unitProfit: c.unitProfit,
          runway: `${c.runwayDays} days left`
        }))
      };

      if (candidates.length === 0) {
        fallbackText = `For **${store.name}**, ensure inventory replenishment is underway before scaling promotions, as high-velocity SKUs currently have tight runways.`;
      } else {
        fallbackText = `Top recommended products to promote for **${store.name}** (High Margin + Safe Inventory Buffer):\n\n` +
          candidates.slice(0, 4).map((c, i) => `${i + 1}. **${c.title}** (${c.sku})\n   • Stock: ${c.stock} units (${c.runwayDays} days runway safe for ads)\n   • **Gross Margin: ${c.marginPct}%** (Unit Profit: ${c.unitProfit})\n   • Recommended Channel: Instagram Reel Ads & WhatsApp Broadcast`).join('\n\n') +
          `\n\n*Why promote these:* Promoting these SKUs will generate high contribution margin without the risk of immediate stockouts.`;
      }
    }

    // =========================================================================
    // CATEGORY 5: DELIVERY FAILURES & NDRs
    // =========================================================================
    else if (intent === 'DELIVERY_FAILURES') {
      const deliveries = await Delivery.find({
        store: storeId,
        createdAt: { $gte: thirtyDaysAgo }
      }).populate('order', 'orderNumber totalAmount paymentMethod customer').lean();

      const totalDispatches = deliveries.length;
      const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;
      const failedCount = deliveries.filter(d => d.status === 'FAILED').length;
      const rtoCount = deliveries.filter(d => d.status === 'RTO').length;
      const inTransitCount = deliveries.filter(d => d.status === 'SHIPPED' || d.status === 'OUT_FOR_DELIVERY').length;

      const failureReasons = {};
      deliveries.filter(d => d.status === 'FAILED' || d.status === 'RTO').forEach(d => {
        const r = d.ndrReason || 'Customer unavailable';
        failureReasons[r] = (failureReasons[r] || 0) + 1;
      });

      groundedData = {
        category: 'DELIVERY_FAILURES',
        dateRange: dateRangeStr,
        totalDispatched: totalDispatches,
        deliveredSuccessCount: deliveredCount,
        failedDeliveryAttempts: failedCount,
        rtoCount,
        activeInTransit: inTransitCount,
        deliverySuccessRate: totalDispatches > 0 ? `${Math.round((deliveredCount / totalDispatches) * 100)}%` : '0%',
        rtoRate: totalDispatches > 0 ? `${Math.round((rtoCount / totalDispatches) * 100)}%` : '0%',
        commonFailureReasons: failureReasons
      };

      fallbackText = `Logistics & NDR telemetry for **${store.name}** (${dateRangeStr}):\n\n` +
        `• **Total Dispatches:** ${totalDispatches}\n` +
        `• **Successful Deliveries:** ${deliveredCount} (${groundedData.deliverySuccessRate})\n` +
        `• **Active Failed Delivery Attempts (NDRs):** ${failedCount}\n` +
        `• **Return-to-Origin (RTO):** ${rtoCount} (${groundedData.rtoRate})\n\n` +
        (failedCount > 0 ? `*NDR Recovery Active:* CommercePilot has initiated automated email rescheduling links to recover failed parcels before they convert to RTO courier penalties.` : `No active delivery crises.`);
    }

    // =========================================================================
    // CATEGORY 6: BUSINESS SUMMARY & GENERAL OPERATIONS
    // =========================================================================
    else {
      const [recentOrders, allProducts, recentDeliveries] = await Promise.all([
        Order.find({ store: storeId, createdAt: { $gte: thirtyDaysAgo } }).lean(),
        Product.find({ store: storeId, status: { $ne: 'archived' } }).lean(),
        Delivery.find({ store: storeId, createdAt: { $gte: thirtyDaysAgo } }).lean()
      ]);

      const validOrders = recentOrders.filter(o => o.orderStatus !== 'CANCELLED');
      const grossRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrdersCount = validOrders.length;
      const cancelledCount = recentOrders.filter(o => o.orderStatus === 'CANCELLED').length;
      const codOrdersCount = validOrders.filter(o => o.paymentMethod === 'COD').length;
      const prepaidCount = totalOrdersCount - codOrdersCount;
      const aov = totalOrdersCount > 0 ? Math.round(grossRevenue / totalOrdersCount) : 0;

      // Estimate total COGS
      const estimatedCogs = Math.round(grossRevenue * 0.45);
      const estimatedGrossProfit = grossRevenue - estimatedCogs;
      const profitMargin = grossRevenue > 0 ? Number(((estimatedGrossProfit / grossRevenue) * 100).toFixed(1)) : 0;

      const lowStockProducts = allProducts.filter(p => (p.stockQuantity || 0) <= (p.reorderThreshold || 10));
      const failedDeliveries = recentDeliveries.filter(d => d.status === 'FAILED');

      groundedData = {
        category: 'BUSINESS_SUMMARY',
        dateRange: dateRangeStr,
        storeName: store.name,
        businessType: store.businessType,
        totalOrders: totalOrdersCount,
        cancelledOrders: cancelledCount,
        grossRevenue: `₹${grossRevenue.toLocaleString('en-IN')}`,
        estimatedCostOfGoodsSold: `₹${estimatedCogs.toLocaleString('en-IN')}`,
        estimatedGrossProfit: `₹${estimatedGrossProfit.toLocaleString('en-IN')}`,
        profitMarginPercentage: `${profitMargin}%`,
        averageOrderValue: `₹${aov.toLocaleString('en-IN')}`,
        paymentMix: {
          codOrders: codOrdersCount,
          prepaidOrders: prepaidCount,
          codSharePercentage: totalOrdersCount > 0 ? `${Math.round((codOrdersCount / totalOrdersCount) * 100)}%` : '0%'
        },
        inventoryHealth: {
          totalCatalogSkus: allProducts.length,
          lowStockSkusCount: lowStockProducts.length
        },
        logisticsHealth: {
          totalShipments: recentDeliveries.length,
          activeNdrs: failedDeliveries.length
        },
        hasLimitedData: totalOrdersCount < 5
      };

      fallbackText = `Operational Summary for **${store.name}** (${dateRangeStr}):\n\n` +
        `• **Gross Revenue (GMV):** ${groundedData.grossRevenue} across ${totalOrdersCount} orders (AOV: ${groundedData.averageOrderValue})\n` +
        `• **Est. Gross Profit:** ${groundedData.estimatedGrossProfit} (~${groundedData.profitMarginPercentage} margin, distinguishing revenue from product cost)\n` +
        `• **Payment Mix:** ${codOrdersCount} COD vs ${prepaidCount} Prepaid (${groundedData.paymentMix.codSharePercentage} COD)\n` +
        `• **Operational Alerts:** ${lowStockProducts.length} SKU(s) low on inventory; ${failedDeliveries.length} failed delivery attempt(s).\n\n` +
        `*Advisory:* Keep COD email verification enabled to minimize return logistics penalties.`;
    }

    // =========================================================================
    // SEND GROUNDED CONTEXT TO GROQ LLM
    // =========================================================================
    const systemPrompt = `You are CommercePilot AI, an elite, data-grounded ecommerce operations director for Indian D2C brands.
You strictly answer using the provided GROUNDED DATABASE TELEMETRY.
Follow these strict integrity rules:
1. Distinguish Gross Revenue from Net Profit. Never conflate them.
2. Cite the exact date range specified in the telemetry (${dateRangeStr}).
3. Reference real SKUs, quantities, order numbers, and rupee values provided in the data.
4. Do not invent missing historical information or hallucinate orders.
5. If data is limited or zero, explicitly say so with an insufficient-data note.
6. Present your answers clearly in markdown with concise bullet points and bold highlights.
7. Treat all insights as recommendations, not audited financial guarantees.`;

    const userPrompt = `Seller Question: "${prompt}"

Grounded Database Telemetry:
${JSON.stringify(groundedData, null, 2)}

Provide a concise, highly actionable, expert answer.`;

    let reply = '';
    let usedGroq = false;

    try {
      reply = await generateGroqCompletion({
        prompt: userPrompt,
        systemPrompt,
        model: 'llama-3.3-70b-versatile'
      });
      usedGroq = Boolean(reply && reply.trim());
    } catch (err) {
      console.warn(`[AI Assistant] Groq unavailable (${err.message}). Using deterministic fallback.`);
      reply = fallbackText;
    }

    if (!reply || !reply.trim()) {
      reply = fallbackText;
    }

    return {
      success: true,
      intent,
      reply,
      groundedData,
      dateRange: dateRangeStr,
      usedGroq,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = aiAssistantService;
