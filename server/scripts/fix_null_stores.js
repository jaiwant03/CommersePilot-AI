const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Store = require('../src/models/Store.model');

async function fixNullStores() {
  await mongoose.connect('mongodb://127.0.0.1:27017/commercepilot_ai');
  const trendyThreads = await Store.findOne({ name: 'Trendy Threads' });
  if (!trendyThreads) {
    console.error('Trendy Threads store not found!');
    process.exit(1);
  }
  const result = await User.updateMany(
    { $or: [{ store: null }, { store: { $exists: false } }] },
    { $set: { store: trendyThreads._id } }
  );
  console.log('Updated users with null store:', result);
  const jk = await User.findOne({ email: 'abc@gmail.com' }).populate('store');
  console.log('JK User Store:', jk?.store?.name, jk?.store?._id);
  process.exit(0);
}

fixNullStores().catch(err => {
  console.error(err);
  process.exit(1);
});
