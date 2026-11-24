const Product = require('../models/Product.model');
const InventoryMovement = require('../models/InventoryMovement.model');
const PurchaseOrder = require('../models/PurchaseOrder.model');
const Store = require('../models/Store.model');
const forecastingService = require('../services/forecastingService');
const emailService = require('../services/emailService');

/**
 * Get inventory health, stockout runway, and low-stock alerts
 */
const getInventoryOverview = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { filter = 'ALL', search = '' } = req.query;

    const query = { store: storeId };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { sku: searchRegex }];
    }

    if (filter === 'LOW_STOCK') {
      query.$expr = { $lte: ['$stockQuantity', '$reorderThreshold'] };
    } else if (filter === 'OUT_OF_STOCK') {
      query.stockQuantity = 0;
    }

    const products = await Product.find(query).sort({ stockQuantity: 1 });

    const items = products.map((p) => {
      const estimatedDailyVelocity = Math.max(1, Math.round(p.sellingPrice > 2000 ? 2 : 4));
      const runwayDays = Math.round(p.stockQuantity / estimatedDailyVelocity);
      const isCritical = p.stockQuantity <= p.reorderThreshold;

      return {
        ...p.toObject(),
        estimatedDailyVelocity,
        runwayDays,
        isCritical
      };
    });

    return res.status(200).json({
      success: true,
      items,
      totalCount: products.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust product stock manually
 */
const adjustStock = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { productId, adjustmentType = 'STOCK_IN', quantity, reason = 'Manual warehouse adjustment' } = req.body;

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required.' });
    }

    const product = await Product.findOne({ _id: productId, store: storeId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const previousStock = product.stockQuantity;
    const rawType = req.body.adjustmentType || req.body.type || 'STOCK_IN';
    const isAdd = rawType === 'STOCK_IN' || rawType === 'ADD';
    const quantityChanged = isAdd ? qty : -qty;
    const normalizedType = isAdd ? 'STOCK_IN' : 'STOCK_OUT';
    const newStock = Math.max(0, previousStock + quantityChanged);

    product.stockQuantity = newStock;
    await product.save();

    const movement = await InventoryMovement.create({
      store: storeId,
      product: product._id,
      sku: product.sku,
      type: normalizedType,
      quantityChanged,
      previousStock,
      newStock,
      reason
    });

    return res.status(200).json({
      success: true,
      message: `Stock updated successfully. New quantity: ${newStock} units.`,
      product,
      movement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent inventory movements history
 */
const getMovements = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { limit = 25 } = req.query;

    const movements = await InventoryMovement.find({ store: storeId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('product', 'title category sellingPrice');

    return res.status(200).json({
      success: true,
      movements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get real-time mathematical demand forecasts for store catalog
 */
const getDemandForecast = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const lookback = parseInt(req.query.lookbackDays, 10) || 30;
    const forecast = await forecastingService.forecastStoreDemand(storeId, lookback);

    return res.status(200).json(forecast);
  } catch (error) {
    next(error);
  }
};

/**
 * Get purchase orders list
 */
const getPurchaseOrders = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { status } = req.query;
    const query = { store: storeId };
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const purchaseOrders = await PurchaseOrder.find(query)
      .sort({ createdAt: -1 })
      .populate('items.product', 'title sku stockQuantity costPrice');

    return res.status(200).json({
      success: true,
      purchaseOrders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single purchase order
 */
const getPurchaseOrderById = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, store: req.store._id })
      .populate('items.product');

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    return res.status(200).json({ success: true, purchaseOrder: po });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Purchase Order and Dispatch Email to Supplier
 */
const approvePurchaseOrder = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const po = await PurchaseOrder.findOne({ _id: req.params.id, store: storeId });

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    po.status = 'APPROVED';
    po.approvedBy = req.user._id;
    po.approvedAt = new Date();

    // Dispatch Restock Request Email to Supplier
    const store = await Store.findById(storeId);
    const emailRes = await emailService.dispatchEmail({
      to: po.supplierEmail || 'orders@surattextiles.example.com',
      subject: `Official Purchase Order #${po.poNumber} from ${store.name || 'Merchant'}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #0F172A; color: #E2E8F0; border-radius: 8px;">
          <h2 style="color: #38BDF8; margin-top: 0;">Official Purchase Order: #${po.poNumber}</h2>
          <p>Dear <strong>${po.supplierName}</strong>,</p>
          <p>Please process and dispatch the following approved inventory replenishment items for <strong>${store.name}</strong>:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; color: #E2E8F0;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.2); text-align: left;">
                <th style="padding: 8px;">Product</th>
                <th style="padding: 8px;">SKU</th>
                <th style="padding: 8px;">Reorder Qty</th>
                <th style="padding: 8px; text-align: right;">Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              ${po.items.map(it => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 8px;">${it.title}</td>
                  <td style="padding: 8px; color: #94A3B8;">${it.sku}</td>
                  <td style="padding: 8px; font-weight: bold; color: #38BDF8;">${it.reorderQuantity} units</td>
                  <td style="padding: 8px; text-align: right;">₹${(it.estimatedCost || (it.reorderQuantity * it.unitCost)).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="font-size: 16px; font-weight: bold; color: #10B981;">Total Order Value: ₹${po.totalEstimatedCost.toLocaleString('en-IN')}</p>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 20px;">Dispatched autonomously via CommercePilot AI after merchant authorization.</p>
        </div>
      `,
      eventId: `po-supplier-email-${po._id}`
    });

    po.status = 'SENT_TO_SUPPLIER';
    po.sentAt = new Date();
    await po.save();

    return res.status(200).json({
      success: true,
      message: `Purchase Order #${po.poNumber} approved and dispatched to ${po.supplierName}.`,
      purchaseOrder: po,
      emailSent: emailRes.success
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit / Update Purchase Order
 */
const updatePurchaseOrder = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const po = await PurchaseOrder.findOne({ _id: req.params.id, store: storeId });

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const { supplierName, supplierEmail, items, notes } = req.body;

    if (supplierName) po.supplierName = supplierName.trim();
    if (supplierEmail) po.supplierEmail = supplierEmail.trim();
    if (notes !== undefined) po.notes = notes;

    if (items && Array.isArray(items)) {
      po.items = items;
      po.totalEstimatedCost = items.reduce((sum, it) => sum + (Number(it.estimatedCost) || (Number(it.reorderQuantity) * Number(it.unitCost)) || 0), 0);
    }

    await po.save();

    return res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully.',
      purchaseOrder: po
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Purchase Order
 */
const rejectPurchaseOrder = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const po = await PurchaseOrder.findOne({ _id: req.params.id, store: storeId });

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    po.status = 'REJECTED';
    po.notes = req.body.reason ? `${po.notes ? po.notes + ' | ' : ''}Rejected: ${req.body.reason}` : (po.notes || 'Rejected by merchant');
    await po.save();

    return res.status(200).json({
      success: true,
      message: `Purchase order #${po.poNumber} rejected.`,
      purchaseOrder: po
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryOverview,
  adjustStock,
  getMovements,
  getDemandForecast,
  getPurchaseOrders,
  getPurchaseOrderById,
  approvePurchaseOrder,
  updatePurchaseOrder,
  rejectPurchaseOrder
};
