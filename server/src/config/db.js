const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB with graceful error and disconnection handling
 */
const connectDB = async () => {
  if (!config.mongodbUri) {
    console.warn('⚠️  MONGODB_URI is not set in environment. Running in disconnected database mode.');
    return null;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: config.env !== 'production'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't crash process in development if DB connection fails
    if (config.env === 'production') {
      process.exit(1);
    }
    return null;
  }
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Runtime Error: ${err.message}`);
});

module.exports = {
  connectDB,
  mongoose
};
