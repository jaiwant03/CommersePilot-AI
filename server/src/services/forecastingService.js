const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

/**
 * Demand Forecasting Service
 * Deterministic moving-average demand forecasting and inventory replenishment modeling.
 * Strictly uses application mathematics (ADD, ROP, Days of Stock) - no false claims of deep learning.
 */
const forecastingService = {
  /**
   * Run Demand Forecast and Reorder Point Analysis for all products in a store
   * @param {string|ObjectId} storeId
   * @param {number} lookbackDays - Default 30 days
   */
  forecastStoreDemand: async (storeId, lookbackDays = 30) => {
    const lookback = Math.max(7, parseInt(lookbackDays, 10) || 30);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookback);

    // 1. Fetch active products for the store
    const products = await Product.find({ store: storeId, status: { $ne: 'archived' } }).lean();
    if (!products || products.length === 0) {
      return {
        success: true,
        summary: {
          totalSkusScanned: 0,
          criticalCount: 0,
          reorderCount: 0,
          healthyCount: 0,
          stockoutCount: 0,
          totalEstimatedReorderBudget: 0
        },
        forecasts: [],
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          lookbackDays: lookback,
          hasInsufficientData: true,
          warningMessage: 'No products in store catalog.'
        },
        methodology: 'Deterministic Average Daily Demand (ADD) moving average. Recommendations are mathematical projections.'
      };
    }

    // 2. Fetch completed/fulfilled/valid orders in the lookback window
    const orders = await Order.find({
      store: storeId,
      createdAt: { $gte: startDate, $lte: endDate },
      orderStatus: { $nin: ['CANCELLED'] }
    }).select('items createdAt').lean();

    // Check data sufficiency
    const totalOrdersInPeriod = orders.length;
    const hasInsufficientData = totalOrdersInPeriod < 5;

    // 3. Aggregate units sold per SKU / Product
    const salesPerProduct = {};
    const salesPerSku = {};

    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const prodId = item.product ? item.product.toString() : null;
        const sku = item.sku ? item.sku.toUpperCase() : null;
        const qty = Number(item.quantity) || 0;

        if (prodId) {
          salesPerProduct[prodId] = (salesPerProduct[prodId] || 0) + qty;
        }
        if (sku) {
          salesPerSku[sku] = (salesPerSku[sku] || 0) + qty;
        }
      });
    });

    // 4. Compute forecasting metrics per product
    let criticalCount = 0;
    let reorderCount = 0;
    let healthyCount = 0;
    let stockoutCount = 0;
    let totalEstimatedReorderBudget = 0;

    const forecasts = products.map(product => {
      const prodIdStr = product._id.toString();
      const skuStr = product.sku ? product.sku.toUpperCase() : '';

      // Total units sold across lookback period
      const unitsSold = salesPerProduct[prodIdStr] || salesPerSku[skuStr] || 0;

      // Average Daily Demand (ADD)
      const averageDailyDemand = Number((unitsSold / lookback).toFixed(2));

      // Stock parameters
      const availableStock = Number(product.stockQuantity) || 0;
      const supplierLeadTime = Number(product.leadTimeDays) || 7;
      const reorderThreshold = Number(product.reorderThreshold) || 10;
      const costPrice = Number(product.costPrice) || Math.round((Number(product.sellingPrice) || 1000) * 0.45);
      const sellingPrice = Number(product.sellingPrice) || costPrice * 2;

      // Safety stock calculation:
      // If product has safetyStockDays, use (ADD * safetyStockDays), minimum 5 units or reorderThreshold/2
      const safetyStockDays = Number(product.safetyStockDays) || 7;
      const calculatedSafetyStock = averageDailyDemand > 0
        ? Math.max(5, Math.ceil(averageDailyDemand * safetyStockDays))
        : Math.ceil(reorderThreshold / 2);

      // Reorder Point = (Average Daily Demand × Supplier Lead Time) + Safety Stock
      const calculatedRop = Math.ceil((averageDailyDemand * supplierLeadTime) + calculatedSafetyStock);
      // Use max of calculated ROP and manual reorderThreshold to protect small sellers
      const effectiveRop = Math.max(calculatedRop, reorderThreshold);

      // Days of Stock = Available Stock / Average Daily Demand
      let daysOfStock = null;
      let runwayCategory = 'HEALTHY';

      if (availableStock === 0) {
        daysOfStock = 0;
        runwayCategory = 'OUT_OF_STOCK';
        stockoutCount++;
        reorderCount++;
      } else if (averageDailyDemand === 0) {
        daysOfStock = 999; // Stagnant / Infinite at 0 demand
        runwayCategory = 'SLOW_MOVING';
      } else {
        daysOfStock = Number((availableStock / averageDailyDemand).toFixed(2));
        if (daysOfStock <= supplierLeadTime) {
          runwayCategory = 'CRITICAL_RUNWAY'; // Stockout will occur before lead-time delivery!
          criticalCount++;
          reorderCount++;
        } else if (availableStock <= effectiveRop) {
          runwayCategory = 'REORDER_RECOMMENDED';
          reorderCount++;
        } else if (daysOfStock > 90) {
          runwayCategory = 'OVERSTOCK_RISK';
          healthyCount++;
        } else {
          runwayCategory = 'HEALTHY';
          healthyCount++;
        }
      }

      // Suggested Reorder Quantity (Target: 45 days demand cycle + Safety Stock - Current Stock)
      let suggestedReorderQuantity = 0;
      let estimatedCost = 0;

      if (runwayCategory === 'OUT_OF_STOCK' || runwayCategory === 'CRITICAL_RUNWAY' || runwayCategory === 'REORDER_RECOMMENDED') {
        const targetCycleUnits = Math.ceil(Math.max(averageDailyDemand, 0.5) * 45);
        suggestedReorderQuantity = Math.max(targetCycleUnits - availableStock, 15);
        estimatedCost = suggestedReorderQuantity * costPrice;
        totalEstimatedReorderBudget += estimatedCost;
      }

      // Actionable recommendation string
      let recommendation = '';
      if (runwayCategory === 'OUT_OF_STOCK') {
        recommendation = `Stockout alert! Order ${suggestedReorderQuantity} units immediately from supplier (${supplierLeadTime}d lead time).`;
      } else if (runwayCategory === 'CRITICAL_RUNWAY') {
        recommendation = `Critical: Only ${daysOfStock} days runway left. Lead time is ${supplierLeadTime} days. Stockout imminent without reorder.`;
      } else if (runwayCategory === 'REORDER_RECOMMENDED') {
        recommendation = `Stock (${availableStock}) has breached reorder point (${effectiveRop}). Recommended replenishment: ${suggestedReorderQuantity} units.`;
      } else if (runwayCategory === 'SLOW_MOVING') {
        recommendation = `0 units sold in last ${lookback} days. Consider price promotion or bundling before replenishing.`;
      } else if (runwayCategory === 'OVERSTOCK_RISK') {
        recommendation = `Inventory runway exceeds 90 days (${daysOfStock}d). Avoid new purchase orders to free working capital.`;
      } else {
        recommendation = `Optimal stock runway of ${daysOfStock} days. No replenishment needed currently.`;
      }

      return {
        productId: product._id,
        sku: product.sku,
        title: product.title,
        category: product.category,
        availableStock,
        unitsSoldInPeriod: unitsSold,
        averageDailyDemand,
        supplierLeadTime,
        safetyStock: calculatedSafetyStock,
        reorderThreshold,
        reorderPoint: effectiveRop,
        daysOfStock,
        runwayCategory,
        suggestedReorderQuantity,
        costPrice,
        sellingPrice,
        grossMarginPercentage: sellingPrice > 0 ? Number((((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1)) : 0,
        estimatedReorderCost: estimatedCost,
        recommendation
      };
    });

    // Sort: Critical & Out of Stock first, then Reorder Recommended, then Healthy
    const priorityOrder = {
      OUT_OF_STOCK: 1,
      CRITICAL_RUNWAY: 2,
      REORDER_RECOMMENDED: 3,
      SLOW_MOVING: 4,
      OVERSTOCK_RISK: 5,
      HEALTHY: 6
    };
    forecasts.sort((a, b) => (priorityOrder[a.runwayCategory] || 99) - (priorityOrder[b.runwayCategory] || 99));

    return {
      success: true,
      summary: {
        totalSkusScanned: products.length,
        criticalCount,
        reorderCount,
        healthyCount,
        stockoutCount,
        totalEstimatedReorderBudget
      },
      forecasts,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        lookbackDays: lookback,
        hasInsufficientData,
        warningMessage: hasInsufficientData
          ? `Limited historical data (${totalOrdersInPeriod} orders in past ${lookback} days). Average daily demand calculations will become more robust as sales accumulate.`
          : null
      },
      methodology: 'Deterministic Average Daily Demand (ADD) moving average forecasting. Daily demand calculated over the active lookback window.'
    };
  }
};

module.exports = forecastingService;
