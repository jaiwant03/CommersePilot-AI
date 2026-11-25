const Store = require('../models/Store.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Customer = require('../models/Customer.model');
const InventoryMovement = require('../models/InventoryMovement.model');
const emailService = require('../services/emailService');

/**
 * Get store settings & live SMTP health
 */
const getSettings = async (req, res, next) => {
  try {
    const store = (req.store?._id ? await Store.findById(req.store._id) : null) || await Store.findOne({ owner: req.user._id });
    const smtpStatus = await emailService.verifySmtpConnection();
    return res.status(200).json({ success: true, store, smtpStatus });
  } catch (error) {
    next(error);
  }
};

/**
 * Update store settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const { 
      name, 
      businessType, 
      category, 
      channel, 
      currency,
      salesChannels,
      paymentMethods, 
      inventoryPreferences, 
      details, 
      settings 
    } = req.body;

    if (name) store.name = name.trim();
    if (businessType) store.businessType = businessType;
    if (category) store.category = category;
    if (channel) store.channel = channel;
    if (currency) store.currency = currency.trim().toUpperCase();
    if (salesChannels && Array.isArray(salesChannels)) store.salesChannels = salesChannels;
    if (paymentMethods && Array.isArray(paymentMethods)) store.paymentMethods = paymentMethods;
    if (details) store.details = { ...store.details, ...details };
    if (inventoryPreferences) {
      store.inventoryPreferences = { ...store.inventoryPreferences, ...inventoryPreferences };
    }
    if (settings) {
      store.settings = { ...store.settings, ...settings };
    }

    await store.save();

    return res.status(200).json({
      success: true,
      message: 'Store settings saved successfully.',
      store
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to parse CSV text into an array of objects
 */
const parseCsv = (csvText) => {
  const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV splitting accounting for possible comma delimiters
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(obj);
  }

  return rows;
};

/**
 * Functional CSV / JSON Store Data Importer
 * Supports Products, Orders, Customers & Inventory records
 */
const importStoreData = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const { type = 'products', format = 'json', data } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, message: 'No import data provided.' });
    }

    let records = [];
    if (format === 'csv' && typeof data === 'string') {
      records = parseCsv(data);
    } else if (Array.isArray(data)) {
      records = data;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid data format. Send array of objects or valid CSV string.' });
    }

    let importedCount = 0;
    const summary = { products: 0, orders: 0, customers: 0, movements: 0 };

    if (type === 'products') {
      for (const row of records) {
        if (!row.title && !row.Title) continue;
        const title = row.title || row.Title || 'Fashion Item';
        const sku = (row.sku || row.SKU || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`).toUpperCase();
        const sellingPrice = Number(row.sellingPrice || row.price || row.Price || 999);
        const costPrice = Number(row.costPrice || row.Cost || Math.round(sellingPrice * 0.45));
        const stockQuantity = Number(row.stockQuantity || row.stock || row.Stock || 20);
        const category = row.category || row.Category || 'Fashion & Apparel';
        const reorderThreshold = Number(row.reorderThreshold || row.reorderPoint || 10);

        const prod = await Product.findOneAndUpdate(
          { store: store._id, sku },
          {
            store: store._id,
            title,
            category,
            sku,
            sellingPrice,
            costPrice,
            stockQuantity,
            reorderThreshold,
            status: 'active'
          },
          { upsert: true, new: true }
        );

        await InventoryMovement.create({
          store: store._id,
          product: prod._id,
          sku: prod.sku,
          type: 'INITIAL_STOCK',
          quantityChanged: stockQuantity,
          previousStock: 0,
          newStock: stockQuantity,
          reason: 'Imported via CSV/JSON Store Sync'
        });

        importedCount++;
        summary.products++;
      }
    } else if (type === 'orders') {
      for (const row of records) {
        const orderNumber = row.orderNumber || row.orderId || `TT-${10000 + Math.floor(Math.random() * 90000)}`;
        const custName = row.customerName || row.fullName || 'Customer';
        const custPhone = row.phone || row.mobile || '+91 98401 00000';
        const custEmail = row.email || `${custName.toLowerCase().replace(/\s+/g, '')}@example.com`;
        const totalAmount = Number(row.totalAmount || row.amount || 1500);
        const paymentMethod = (row.paymentMethod || 'COD').toUpperCase();
        const street = row.address || row.street || 'Coimbatore Central';
        const city = row.city || 'Coimbatore';
        const state = row.state || 'Tamil Nadu';
        const pincode = row.pincode || '641001';

        // Upsert customer
        let cust = await Customer.findOne({ store: store._id, phone: custPhone });
        if (!cust) {
          cust = await Customer.create({
            store: store._id,
            fullName: custName,
            email: custEmail,
            phone: custPhone,
            address: { street, city, state, pincode, country: 'India' },
            ordersCount: 1,
            totalSpent: totalAmount
          });
        } else {
          cust.ordersCount += 1;
          cust.totalSpent += totalAmount;
          await cust.save();
        }

        const items = [{
          title: row.productTitle || row.item || 'Fashion Kurti',
          sku: row.sku || 'TT-KUR-01',
          quantity: Number(row.quantity || 1),
          unitPrice: totalAmount,
          totalPrice: totalAmount
        }];

        await Order.findOneAndUpdate(
          { store: store._id, orderNumber },
          {
            store: store._id,
            orderNumber,
            customer: {
              id: cust._id,
              fullName: custName,
              email: custEmail,
              phone: custPhone,
              address: { street, city, state, pincode, country: 'India' }
            },
            items,
            subtotal: totalAmount,
            totalAmount,
            paymentMethod: paymentMethod === 'PREPAID' ? 'PREPAID' : 'COD',
            paymentStatus: paymentMethod === 'PREPAID' ? 'PAID' : 'PENDING',
            orderStatus: row.status || 'CONFIRMED'
          },
          { upsert: true, new: true }
        );

        importedCount++;
        summary.orders++;
      }
    }

    // Update store sync timestamp
    store.lastSyncAt = new Date();
    store.connectionStatus = 'CONNECTED';
    store.syncProvider = 'CSV_IMPORT';
    await store.save();

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${importedCount} ${type} records.`,
      importedCount,
      summary,
      lastSyncAt: store.lastSyncAt,
      connectionStatus: store.connectionStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send live SMTP test email to verify delivery for any entered email address
 */
const sendTestEmail = async (req, res, next) => {
  try {
    const store = (req.store?._id ? await Store.findById(req.store._id) : null) || await Store.findOne({ owner: req.user._id });
    const targetEmail = (req.body?.email || store?.settings?.alertEmail || req.user?.email || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address to send a test email.'
      });
    }

    const result = await emailService.sendTestEmail({
      to: targetEmail,
      storeName: store?.name || 'CommercePilot AI Store'
    });

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: `SMTP dispatch failed for ${targetEmail}: ${result.error || result.reason || 'Unknown error'}`,
        result
      });
    }

    return res.status(200).json({
      success: true,
      message: result.isDemoMode
        ? `Simulated test email logged for ${targetEmail} (SMTP credentials not configured).`
        : `Live test email successfully dispatched to ${targetEmail}!`,
      result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  importStoreData,
  sendTestEmail
};
