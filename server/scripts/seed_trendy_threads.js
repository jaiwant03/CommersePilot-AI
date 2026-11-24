/**
 * Seed Script: Trendy Threads E-Commerce Business
 * Real-world fashion business in Coimbatore, Tamil Nadu selling Women's Kurtis, T-shirts, Jeans, Dresses, Accessories.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User.model');
const Store = require('../src/models/Store.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');
const Delivery = require('../src/models/Delivery.model');
const PurchaseOrder = require('../src/models/PurchaseOrder.model');
const InventoryMovement = require('../src/models/InventoryMovement.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commercepilot_ai';

const seedTrendyThreads = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB:', MONGO_URI);

    // 1. Create or Find Merchant User
    const merchantEmail = 'meena@trendythreads.in';
    let user = await User.findOne({ email: merchantEmail });
    const hashedPassword = await bcrypt.hash('TrendyThreads2026!', 10);

    if (!user) {
      user = await User.create({
        fullName: 'Meena Kandasamy',
        email: merchantEmail,
        password: hashedPassword,
        phoneNumber: '+91 94432 10987',
        role: 'owner',
        isEmailVerified: true
      });
      console.log(`[Seed] Created merchant user: ${user.email}`);
    } else {
      user.password = hashedPassword;
      await user.save();
      console.log(`[Seed] Updated merchant user: ${user.email}`);
    }

    // 2. Create or Update Trendy Threads Store
    let store = await Store.findOne({ owner: user._id });
    if (!store) {
      store = await Store.create({
        name: 'Trendy Threads',
        owner: user._id,
        businessType: 'Independent Fashion & Cosmetics',
        currency: 'INR',
        salesChannels: ['Online Store', 'Instagram', 'WhatsApp'],
        connectionStatus: 'CONNECTED',
        lastSyncAt: new Date(),
        settings: {
          codRiskThreshold: 60,
          lowStockThreshold: 30,
          autoEmailVerification: true,
          autoNdrRecovery: true,
          alertEmail: merchantEmail
        }
      });
      console.log(`[Seed] Created store: ${store.name}`);
    } else {
      store.name = 'Trendy Threads';
      store.currency = 'INR';
      store.salesChannels = ['Online Store', 'Instagram', 'WhatsApp'];
      store.connectionStatus = 'CONNECTED';
      store.lastSyncAt = new Date();
      await store.save();
      console.log(`[Seed] Updated store: ${store.name}`);
    }

    // Associate store with user
    user.store = store._id;
    await user.save();

    // 3. Clear existing store artifacts for clean re-seed
    await Product.deleteMany({ store: store._id });
    await Order.deleteMany({ store: store._id });
    await Delivery.deleteMany({ store: store._id });
    await PurchaseOrder.deleteMany({ store: store._id });
    await InventoryMovement.deleteMany({ store: store._id });

    // 4. Create Fashion & Apparel Catalog
    const productsData = [
      {
        title: "Women's Black Kurti",
        sku: 'TT-KUR-BLK',
        category: 'Apparel & Fashion',
        sellingPrice: 1299,
        costPrice: 450,
        stockQuantity: 25,
        reorderThreshold: 30,
        supplierLeadTimeDays: 5,
        status: 'active',
        description: "Pure breathable cotton everyday black kurti with intricate Lucknowi threadwork embroidery."
      },
      {
        title: 'Premium Kurti',
        sku: 'TT-KUR-PREM',
        category: 'Apparel & Fashion',
        sellingPrice: 2500,
        costPrice: 900,
        stockQuantity: 40,
        reorderThreshold: 20,
        supplierLeadTimeDays: 7,
        status: 'active',
        description: 'Chanderi silk festive kurti with zari work and designer neckline.'
      },
      {
        title: 'Floral Anarkali Kurti',
        sku: 'TT-KUR-FLOR',
        category: 'Apparel & Fashion',
        sellingPrice: 1999,
        costPrice: 750,
        stockQuantity: 18,
        reorderThreshold: 15,
        supplierLeadTimeDays: 6,
        status: 'active',
        description: 'Hand-block printed floral Anarkali with flared hemline.'
      },
      {
        title: 'White Casual T-shirt',
        sku: 'TT-TSH-WHT',
        category: 'Apparel & Fashion',
        sellingPrice: 699,
        costPrice: 250,
        stockQuantity: 60,
        reorderThreshold: 25,
        supplierLeadTimeDays: 4,
        status: 'active',
        description: '100% combed cotton basic round neck unisex tee.'
      },
      {
        title: 'Vintage Black Tee',
        sku: 'TT-TSH-BLK',
        category: 'Apparel & Fashion',
        sellingPrice: 799,
        costPrice: 280,
        stockQuantity: 45,
        reorderThreshold: 20,
        supplierLeadTimeDays: 4,
        status: 'active',
        description: 'Heavyweight vintage washed graphic tee.'
      },
      {
        title: 'High-Rise Blue Jeans',
        sku: 'TT-JNS-BLU',
        category: 'Apparel & Fashion',
        sellingPrice: 1899,
        costPrice: 650,
        stockQuantity: 55,
        reorderThreshold: 20,
        supplierLeadTimeDays: 8,
        status: 'active',
        description: 'Stretch denim wide-leg ankle-length casual jeans.'
      },
      {
        title: 'Slim Fit Denim',
        sku: 'TT-JNS-SLIM',
        category: 'Apparel & Fashion',
        sellingPrice: 1799,
        costPrice: 600,
        stockQuantity: 50,
        reorderThreshold: 20,
        supplierLeadTimeDays: 8,
        status: 'active',
        description: 'Mid-rise classic washed denim with 5-pocket styling.'
      },
      {
        title: 'Cotton Tiered Maxi Dress',
        sku: 'TT-DRS-MAXI',
        category: 'Apparel & Fashion',
        sellingPrice: 2299,
        costPrice: 800,
        stockQuantity: 22,
        reorderThreshold: 15,
        supplierLeadTimeDays: 6,
        status: 'active',
        description: 'Tiered floral boho summer dress with puff sleeves.'
      },
      {
        title: 'Silk Dupatta & Belt Set',
        sku: 'TT-ACC-DUPS',
        category: 'Apparel & Fashion',
        sellingPrice: 999,
        costPrice: 350,
        stockQuantity: 35,
        reorderThreshold: 15,
        supplierLeadTimeDays: 5,
        status: 'active',
        description: 'Banarasi art silk woven dupatta with embellished matching waist belt.'
      }
    ];

    const insertedProducts = await Product.insertMany(
      productsData.map(p => ({ ...p, store: store._id }))
    );
    console.log(`[Seed] Inserted ${insertedProducts.length} catalog products`);

    const blackKurti = insertedProducts.find(p => p.sku === 'TT-KUR-BLK');
    const premiumKurti = insertedProducts.find(p => p.sku === 'TT-KUR-PREM');
    const anarkaliKurti = insertedProducts.find(p => p.sku === 'TT-KUR-FLOR');
    const whiteTee = insertedProducts.find(p => p.sku === 'TT-TSH-WHT');

    // 5. Seed Historical Sales Orders to Generate Exact Demand Velocity
    // For Women's Black Kurti: 450 units sold over trailing 30 days = exactly 15.00 units/day ADD
    // With current stock 25: 25 / 15.00 = 1.67 days of stock runway remaining!
    const historicalOrders = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Distribute 450 units sold across 30 days (15 units per day)
    for (let day = 1; day <= 30; day++) {
      const orderDate = new Date(now - day * dayMs);
      historicalOrders.push({
        store: store._id,
        orderNumber: `ORD-HIST-${1000 + day}`,
        customer: {
          fullName: day % 2 === 0 ? 'Priya Sharma' : 'Pooja Nair',
          email: day % 2 === 0 ? 'priya.sharma@example.com' : 'pooja.nair@example.com',
          phone: day % 2 === 0 ? '+91 98401 23456' : '+91 98402 34567',
          address: {
            street: '104, RS Puram West',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641002'
          }
        },
        items: [
          {
            product: blackKurti._id,
            sku: blackKurti.sku,
            title: blackKurti.title,
            quantity: 15,
            unitPrice: blackKurti.sellingPrice,
            totalPrice: blackKurti.sellingPrice * 15
          }
        ],
        subtotal: blackKurti.sellingPrice * 15,
        totalAmount: blackKurti.sellingPrice * 15,
        paymentMethod: 'PREPAID',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    // Additional completed orders for variety
    historicalOrders.push(
      {
        store: store._id,
        orderNumber: 'ORD-TT-101',
        customer: {
          fullName: 'Kavitha R',
          email: 'kavitha.r@example.com',
          phone: '+91 94433 44556',
          address: { street: '12, Saibaba Colony', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641011' }
        },
        items: [{ product: premiumKurti._id, sku: premiumKurti.sku, title: premiumKurti.title, quantity: 2, unitPrice: 2500, totalPrice: 5000 }],
        subtotal: 5000,
        totalAmount: 5000,
        paymentMethod: 'PREPAID',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        createdAt: new Date(now - 4 * dayMs)
      },
      {
        store: store._id,
        orderNumber: 'ORD-TT-102',
        customer: {
          fullName: 'Pooja Nair',
          email: 'pooja.nair@example.com',
          phone: '+91 98402 34567',
          address: { street: '45, Race Course Road', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641018' }
        },
        items: [{ product: anarkaliKurti._id, sku: anarkaliKurti.sku, title: anarkaliKurti.title, quantity: 1, unitPrice: 1999, totalPrice: 1999 }],
        subtotal: 1999,
        totalAmount: 1999,
        paymentMethod: 'PREPAID',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        createdAt: new Date(now - 2 * dayMs)
      }
    );

    // 6. Create Target COD Order: TT10245 (Ananya Deshmukh, Coimbatore)
    // Incomplete address, past RTO history -> Scored 65/100 High Risk
    const codOrderTT10245 = {
      store: store._id,
      orderNumber: 'TT10245',
      customer: {
        fullName: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@gmail.com',
        phone: '+91 98765 43210',
        address: {
          street: 'Near Cross Cut Road, Gandhipuram', // Missing house # / landmark
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641012'
        }
      },
      items: [
        {
          product: premiumKurti._id,
          sku: premiumKurti.sku,
          title: premiumKurti.title,
          quantity: 1,
          unitPrice: 2500,
          totalPrice: 2500
        }
      ],
      subtotal: 2500,
      totalAmount: 2500,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'ON_HOLD',
      riskScore: 65,
      riskLevel: 'HIGH',
      needsVerification: true,
      reviewStatus: 'PENDING',
      riskReasons: [
        'Incomplete delivery address; house number or landmark missing',
        'Previous failed delivery found in available order history'
      ],
      recommendation: 'Hold shipment until buyer confirms address via secure email link.',
      history: [
        { status: 'PENDING', note: 'Order placed via Online Store' },
        { status: 'ON_HOLD', note: 'COD Risk Radar scored 65/100 (HIGH). Incomplete address + past RTO.' }
      ],
      createdAt: new Date(now - 12 * 60 * 60 * 1000)
    };

    historicalOrders.push(codOrderTT10245);
    const insertedOrders = await Order.insertMany(historicalOrders);
    console.log(`[Seed] Inserted ${insertedOrders.length} orders (including TT10245 with 65/100 Risk Score)`);

    const savedTT10245 = insertedOrders.find(o => o.orderNumber === 'TT10245');

    // 7. Create Delivery for TT10245 with NDR (Failed Delivery)
    const deliveryTT10245 = await Delivery.create({
      store: store._id,
      order: savedTT10245._id,
      awb: 'DEL-TT10245',
      courier: 'Delhivery',
      status: 'FAILED',
      destination: {
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641012'
      },
      ndrReason: 'Customer unavailable at delivery premises',
      attemptsCount: 1,
      recoveryStatus: 'PENDING',
      customerResponse: 'PENDING',
      whatsappMessage: 'Hello! Your Trendy Threads order TT10245 could not be delivered because you were unavailable. Would you like us to arrange another delivery attempt? Reply YES to request redelivery or contact our support team.',
      trackingEvents: [
        { status: 'SHIPPED', location: 'Coimbatore Hub', message: 'Shipment dispatched from Gandhipuram center', timestamp: new Date(now - 18 * 60 * 60 * 1000) },
        { status: 'OUT_FOR_DELIVERY', location: 'Gandhipuram Route', message: 'Courier executive out for delivery (Attempt #1)', timestamp: new Date(now - 8 * 60 * 60 * 1000) },
        { status: 'FAILED', location: 'Gandhipuram Route', message: 'Delivery Attempt Failed (NDR): Customer unavailable at delivery premises', timestamp: new Date(now - 4 * 60 * 60 * 1000) }
      ]
    });
    console.log(`[Seed] Created delivery for TT10245 with status FAILED (AWB: ${deliveryTT10245.awb})`);

    // 8. Create Ready-to-Approve Purchase Order for Women's Black Kurti
    // Restock 100 units from Coimbatore Fabric Mills
    const draftPO = await PurchaseOrder.create({
      store: store._id,
      poNumber: 'PO-1001',
      supplierName: 'Coimbatore Fabric Mills',
      supplierEmail: 'orders@coimbatorefabric.in',
      items: [
        {
          product: blackKurti._id,
          sku: blackKurti.sku,
          title: blackKurti.title,
          currentStock: blackKurti.stockQuantity,
          reorderQuantity: 100,
          unitCost: blackKurti.costPrice,
          estimatedCost: blackKurti.costPrice * 100
        }
      ],
      totalEstimatedCost: blackKurti.costPrice * 100,
      status: 'DRAFT_PENDING_APPROVAL',
      notes: 'Automated restock draft triggered by Predictive Inventory Runway (1.67 days remaining).'
    });
    console.log(`[Seed] Created Purchase Order ${draftPO.poNumber} for Women's Black Kurti (Total: ₹${draftPO.totalEstimatedCost})`);

    console.log('\n======================================================================');
    console.log('✅ TRENDY THREADS SEEDING COMPLETED SUCCESSFULLY');
    console.log('Store: Trendy Threads (Coimbatore, Tamil Nadu)');
    console.log('Merchant Credentials: meena@trendythreads.in / TrendyThreads2026!');
    console.log('High Risk COD Order: TT10245 (₹2,500, Score: 65/100, Status: ON_HOLD)');
    console.log('NDR Failed Delivery: DEL-TT10245 (Delhivery, Customer Unavailable)');
    console.log('Critical Runway Product: TT-KUR-BLK (25 in stock, 15/day ADD = 1.67 days runway)');
    console.log('Draft PO: PO-1001 (100 units, ₹45,000 to Coimbatore Fabric Mills)');
    console.log('======================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedTrendyThreads();
