const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Delivery = require('../models/Delivery.model');
const Customer = require('../models/Customer.model');
const InventoryMovement = require('../models/InventoryMovement.model');

/**
 * Get comprehensive overview telemetry for store dashboard
 */
const getOverviewStats = async (req, res, next) => {
  try {
    const storeId = req.store._id;

    // Run parallel aggregation queries
    const [
      ordersCount,
      revenueResult,
      codCount,
      prepaidCount,
      needsVerificationCount,
      failedDeliveriesCount,
      recentOrders,
      lowStockProducts,
      recentDeliveries
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({ store: storeId }),

      // Total revenue
      Order.aggregate([
        { $match: { store: storeId, orderStatus: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // COD count
      Order.countDocuments({ store: storeId, paymentMethod: 'COD' }),

      // Prepaid count
      Order.countDocuments({ store: storeId, paymentMethod: 'PREPAID' }),

      // Orders needing verification (High risk or flagged)
      Order.countDocuments({ store: storeId, needsVerification: true, orderStatus: { $in: ['PENDING', 'ON_HOLD'] } }),

      // Failed deliveries (NDR)
      Delivery.countDocuments({ store: storeId, status: { $in: ['FAILED', 'RTO'] } }),

      // Recent 5 orders
      Order.find({ store: storeId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('orderNumber customer items totalAmount paymentMethod orderStatus riskLevel needsVerification createdAt'),

      // Low stock products (stock <= reorderThreshold)
      Product.find({
        store: storeId,
        $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] }
      })
        .limit(6)
        .select('title sku category stockQuantity reorderThreshold sellingPrice'),

      // Recent deliveries
      Delivery.find({ store: storeId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('order', 'orderNumber totalAmount paymentMethod')
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const isStoreEmpty = ordersCount === 0 && lowStockProducts.length === 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders: ordersCount,
        totalRevenue,
        codOrders: codCount,
        prepaidOrders: prepaidCount,
        ordersNeedingVerification: needsVerificationCount,
        lowStockProductsCount: lowStockProducts.length,
        failedDeliveries: failedDeliveriesCount
      },
      recentOrders,
      lowStockProducts,
      recentDeliveries,
      isStoreEmpty
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed realistic Indian D2C sample catalog, orders, and deliveries for new stores
 */
const seedDemoData = async (req, res, next) => {
  try {
    const storeId = req.store._id;

    // Check if store already has products
    const existingCount = await Product.countDocuments({ store: storeId });
    if (existingCount > 0 && !req.body.force) {
      return res.status(400).json({
        success: false,
        message: 'Storefront already contains data. Pass force: true to reset demo data.'
      });
    }

    if (req.body.force) {
      await Product.deleteMany({ store: storeId });
      await Order.deleteMany({ store: storeId });
      await Delivery.deleteMany({ store: storeId });
      await InventoryMovement.deleteMany({ store: storeId });
    }

    // 1. Seed Products
    const sampleProducts = [
      {
        store: storeId,
        title: 'Chikankari Handloom Kurti - Emerald',
        category: 'Fashion & Apparel',
        sku: 'CHIK-EMRL-M',
        sellingPrice: 2890,
        costPrice: 1100,
        stockQuantity: 4, // Low stock trigger
        reorderThreshold: 10,
        variants: [{ name: 'Size: M', sku: 'CHIK-EMRL-M', price: 2890, stockQuantity: 4 }]
      },
      {
        store: storeId,
        title: 'Matte Liquid Lipstick - Crimson Velvet',
        category: 'Cosmetics & Skincare',
        sku: 'LIP-CRIM-01',
        sellingPrice: 899,
        costPrice: 280,
        stockQuantity: 6, // Low stock trigger
        reorderThreshold: 15,
        variants: [{ name: 'Shade: Crimson', sku: 'LIP-CRIM-01', price: 899, stockQuantity: 6 }]
      },
      {
        store: storeId,
        title: 'Oversized Heavyweight Cotton Tee - Vintage Black',
        category: 'Fashion & Apparel',
        sku: 'TEE-VNTG-BLK-L',
        sellingPrice: 1499,
        costPrice: 520,
        stockQuantity: 42,
        reorderThreshold: 12,
        variants: [{ name: 'Size: L', sku: 'TEE-VNTG-BLK-L', price: 1499, stockQuantity: 42 }]
      },
      {
        store: storeId,
        title: 'Handcrafted Kundan Choker Necklace',
        category: 'Jewelry & Accessories',
        sku: 'JW-KUND-09',
        sellingPrice: 4250,
        costPrice: 1800,
        stockQuantity: 8,
        reorderThreshold: 5,
        variants: [{ name: 'Standard', sku: 'JW-KUND-09', price: 4250, stockQuantity: 8 }]
      },
      {
        store: storeId,
        title: 'Botanical Vitamin C Brightening Serum',
        category: 'Cosmetics & Skincare',
        sku: 'SRM-VITC-30ML',
        sellingPrice: 1199,
        costPrice: 380,
        stockQuantity: 28,
        reorderThreshold: 10,
        variants: [{ name: '30ml Dropper', sku: 'SRM-VITC-30ML', price: 1199, stockQuantity: 28 }]
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);

    // 2. Seed Customers
    const sampleCustomers = [
      {
        store: storeId,
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        phone: '+91 98201 44892',
        address: { street: '42 Ring Road, Varachha', city: 'Surat', state: 'Gujarat', pincode: '395006' },
        rtoRiskScore: 82,
        rtoHistoryCount: 2
      },
      {
        store: storeId,
        fullName: 'Pooja Nair',
        email: 'pooja.nair@outlook.com',
        phone: '+91 99401 22345',
        address: { street: '12th Cross, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
        rtoRiskScore: 12,
        rtoHistoryCount: 0
      },
      {
        store: storeId,
        fullName: 'Devika Sengupta',
        email: 'devika.s@yahoo.com',
        phone: '+91 98310 88712',
        address: { street: 'Boring Road, Near Reliance', city: 'Patna', state: 'Bihar', pincode: '800001' },
        rtoRiskScore: 54,
        rtoHistoryCount: 1
      },
      {
        store: storeId,
        fullName: 'Rohan Mehra',
        email: 'rohan.mehra@gmail.com',
        phone: '+91 98111 90214',
        address: { street: 'B-4/28 Safdarjung Enclave', city: 'New Delhi', state: 'Delhi', pincode: '110029' },
        rtoRiskScore: 8,
        rtoHistoryCount: 0
      }
    ];

    const createdCustomers = await Customer.insertMany(sampleCustomers);

    // 3. Seed Orders & Deliveries
    const sampleOrders = [
      {
        store: storeId,
        orderNumber: 'CP-1048',
        customer: {
          id: createdCustomers[0]._id,
          fullName: createdCustomers[0].fullName,
          email: createdCustomers[0].email,
          phone: createdCustomers[0].phone,
          address: createdCustomers[0].address
        },
        items: [{
          product: createdProducts[0]._id,
          title: createdProducts[0].title,
          sku: createdProducts[0].sku,
          quantity: 1,
          unitPrice: 2890,
          totalPrice: 2890
        }],
        subtotal: 2890,
        shippingFee: 0,
        discount: 0,
        totalAmount: 2890,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'ON_HOLD',
        riskScore: 82,
        riskLevel: 'HIGH',
        needsVerification: true,
        notes: 'Flagged by COD Risk Radar: Chronic doorstep refusal history on phone number.',
        history: [{ status: 'ON_HOLD', note: 'Automated email verification link dispatched' }]
      },
      {
        store: storeId,
        orderNumber: 'CP-1049',
        customer: {
          id: createdCustomers[1]._id,
          fullName: createdCustomers[1].fullName,
          email: createdCustomers[1].email,
          phone: createdCustomers[1].phone,
          address: createdCustomers[1].address
        },
        items: [{
          product: createdProducts[1]._id,
          title: createdProducts[1].title,
          sku: createdProducts[1].sku,
          quantity: 2,
          unitPrice: 899,
          totalPrice: 1798
        }],
        subtotal: 1798,
        shippingFee: 50,
        discount: 0,
        totalAmount: 1848,
        paymentMethod: 'PREPAID',
        paymentStatus: 'PAID',
        orderStatus: 'DISPATCHED',
        riskScore: 12,
        riskLevel: 'LOW',
        needsVerification: false,
        notes: 'Paid via UPI. Dispatched via Blue Dart Air.',
        history: [{ status: 'DISPATCHED', note: 'Package handed over to Blue Dart courier hub' }]
      },
      {
        store: storeId,
        orderNumber: 'CP-1050',
        customer: {
          id: createdCustomers[2]._id,
          fullName: createdCustomers[2].fullName,
          email: createdCustomers[2].email,
          phone: createdCustomers[2].phone,
          address: createdCustomers[2].address
        },
        items: [{
          product: createdProducts[2]._id,
          title: createdProducts[2].title,
          sku: createdProducts[2].sku,
          quantity: 1,
          unitPrice: 1499,
          totalPrice: 1499
        }],
        subtotal: 1499,
        shippingFee: 0,
        discount: 0,
        totalAmount: 1499,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        orderStatus: 'PROCESSING',
        riskScore: 54,
        riskLevel: 'MEDIUM',
        needsVerification: false,
        notes: 'Address confirmed by buyer via secure email verification.',
        history: [{ status: 'PROCESSING', note: 'Address verified; packed for courier pickup' }]
      },
      {
        store: storeId,
        orderNumber: 'CP-1051',
        customer: {
          id: createdCustomers[3]._id,
          fullName: createdCustomers[3].fullName,
          email: createdCustomers[3].email,
          phone: createdCustomers[3].phone,
          address: createdCustomers[3].address
        },
        items: [{
          product: createdProducts[3]._id,
          title: createdProducts[3].title,
          sku: createdProducts[3].sku,
          quantity: 1,
          unitPrice: 4250,
          totalPrice: 4250
        }],
        subtotal: 4250,
        shippingFee: 0,
        discount: 250,
        totalAmount: 4000,
        paymentMethod: 'PREPAID',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        riskScore: 8,
        riskLevel: 'LOW',
        needsVerification: false,
        notes: 'Delivered successfully in New Delhi.',
        history: [{ status: 'DELIVERED', note: 'Doorstep OTP verified by Delhivery delivery agent' }]
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);

    // 4. Create Deliveries for Dispatched / Failed / Delivered Orders
    const sampleDeliveries = [
      {
        store: storeId,
        order: createdOrders[1]._id,
        awb: 'BLU84729104',
        courier: 'Blue Dart',
        status: 'SHIPPED',
        destination: { city: 'Bengaluru', pincode: '560038', state: 'Karnataka' },
        trackingEvents: [
          { status: 'SHIPPED', location: 'Mumbai Sorting Facility', message: 'In transit to Bengaluru Hub' }
        ]
      },
      {
        store: storeId,
        order: createdOrders[2]._id,
        awb: 'DEL99218271',
        courier: 'Delhivery',
        status: 'FAILED',
        ndrReason: 'Customer unavailable at doorstep; phone ringing unanswered',
        attemptsCount: 1,
        destination: { city: 'Patna', pincode: '800001', state: 'Bihar' },
        trackingEvents: [
          { status: 'OUT_FOR_DELIVERY', location: 'Patna Hub', message: 'Rider out for delivery' },
          { status: 'FAILED', location: 'Patna Hub', message: 'NDR: Customer unavailable at delivery address' }
        ]
      },
      {
        store: storeId,
        order: createdOrders[3]._id,
        awb: 'DEL77192803',
        courier: 'Delhivery',
        status: 'DELIVERED',
        attemptsCount: 1,
        destination: { city: 'New Delhi', pincode: '110029', state: 'Delhi' },
        trackingEvents: [
          { status: 'DELIVERED', location: 'New Delhi', message: 'Package delivered to recipient' }
        ]
      }
    ];

    await Delivery.insertMany(sampleDeliveries);

    // 5. Seed Inventory Movement logs
    const movements = createdProducts.map(p => ({
      store: storeId,
      product: p._id,
      sku: p.sku,
      type: 'STOCK_IN',
      quantityChanged: p.stockQuantity,
      previousStock: 0,
      newStock: p.stockQuantity,
      reason: 'Initial storefront catalog import'
    }));

    await InventoryMovement.insertMany(movements);

    return res.status(200).json({
      success: true,
      message: 'Demo storefront data seeded successfully. 5 products, 4 orders, and 3 courier deliveries initialized.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Real-time operational notifications for store alerts, high-risk COD orders, and critical stock
 */
const getStoreNotifications = async (req, res, next) => {
  try {
    const storeId = req.store._id;

    // 1. Fetch high-risk / verification-needed orders
    const urgentOrders = await Order.find({
      store: storeId,
      needsVerification: true,
      orderStatus: { $in: ['PENDING', 'ON_HOLD'] }
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('orderNumber customer totalAmount riskScore riskLevel createdAt');

    // 2. Fetch low-stock products
    const lowStockProds = await Product.find({
      store: storeId,
      $expr: { $lte: ['$stockQuantity', '$reorderThreshold'] }
    })
      .sort({ stockQuantity: 1 })
      .limit(4)
      .select('title sku stockQuantity reorderThreshold sellingPrice updatedAt createdAt');

    // 3. Fetch failed deliveries (NDR)
    const failedDeliveries = await Delivery.find({
      store: storeId,
      status: { $in: ['FAILED', 'RTO'] }
    })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('awb courier failureReason status updatedAt');

    const notifications = [];

    // Map urgent orders
    urgentOrders.forEach((ord) => {
      notifications.push({
        id: `ord-${ord._id}`,
        type: 'COD_RISK',
        title: `High COD Risk Order #${ord.orderNumber}`,
        message: `${ord.customer.fullName} • Score ${ord.riskScore}/100 • ₹${ord.totalAmount?.toLocaleString('en-IN')}`,
        link: '/app/orders',
        time: ord.createdAt,
        priority: 'urgent',
        read: false
      });
    });

    // Map low stock products
    lowStockProds.forEach((prod) => {
      notifications.push({
        id: `prod-${prod._id}`,
        type: 'LOW_STOCK',
        title: `Low Stock: ${prod.title}`,
        message: `Only ${prod.stockQuantity} units left (Threshold: ${prod.reorderThreshold}) • SKU: ${prod.sku}`,
        link: '/app/inventory',
        time: prod.updatedAt || prod.createdAt || new Date(),
        priority: 'warning',
        read: false
      });
    });

    // Map failed deliveries
    failedDeliveries.forEach((del) => {
      notifications.push({
        id: `del-${del._id}`,
        type: 'NDR_ALERT',
        title: `NDR Attempt Failed (${del.courier})`,
        message: `AWB #${del.awb} • Customer unreachable • WhatsApp recovery active`,
        link: '/app/deliveries',
        time: del.updatedAt || new Date(),
        priority: 'urgent',
        read: false
      });
    });

    // System guard notification if few alerts
    if (notifications.length === 0) {
      notifications.push({
        id: 'sys-guard',
        type: 'SYSTEM',
        title: 'Operations Guard Active',
        message: 'All store telemetry normal. 0 high risk orders or inventory bottlenecks.',
        link: '/app/overview',
        time: new Date(),
        priority: 'info',
        read: true
      });
    }

    return res.status(200).json({
      success: true,
      unreadCount: notifications.filter((n) => !n.read).length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewStats,
  seedDemoData,
  getStoreNotifications
};
