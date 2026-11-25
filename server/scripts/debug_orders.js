const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Order = require('../src/models/Order.model');
const Store = require('../src/models/Store.model');
const User = require('../src/models/User.model');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Atlas connected successfully');

  const users = await User.find().select('name email store role');
  console.log('Users in DB:');
  users.forEach(u => console.log(` - ${u.email} (${u.name}) -> store: ${u.store}`));

  const stores = await Store.find().select('name storeDomain');
  console.log('\nStores in DB:');
  stores.forEach(s => console.log(` - ${s._id} : ${s.name} (${s.storeDomain})`));

  const count = await Order.countDocuments();
  console.log(`\nTotal orders in DB: ${count}`);

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).select('orderNumber store totalAmount createdAt customer paymentMethod');
  console.log('\nMost recent orders:');
  recentOrders.forEach(o => console.log(` - Order #${o.orderNumber}: store=${o.store}, customer=${o.customer?.name}, amount=${o.totalAmount}, time=${o.createdAt}`));

  await mongoose.disconnect();
}

check().catch(console.error);
