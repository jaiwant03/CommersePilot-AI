const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Business/Store name is required'],
      trim: true,
      maxlength: [120, 'Business name cannot exceed 120 characters']
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      trim: true,
      enum: [
        'D2C Brand',
        'Instagram / Social Commerce Seller',
        'Shopify Merchant',
        'WooCommerce Store',
        'Independent Fashion & Cosmetics',
        'Retailer / Wholesaler',
        'Other'
      ],
      default: 'D2C Brand'
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true
    },
    salesChannels: {
      type: [String],
      default: ['Online Store', 'Instagram', 'WhatsApp']
    },
    connectionStatus: {
      type: String,
      enum: ['CONNECTED', 'DISCONNECTED', 'IMPORT_READY'],
      default: 'CONNECTED'
    },
    lastSyncAt: {
      type: Date,
      default: Date.now
    },
    syncProvider: {
      type: String,
      default: 'STORE_API'
    },
    // Onboarding Step 2: Extended Business Details
    details: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      supportEmail: { type: String, trim: true, default: '' },
      supportPhone: { type: String, trim: true, default: '' }
    },
    // Onboarding Step 3: Business Category
    category: {
      type: String,
      trim: true,
      default: 'Fashion & Apparel'
    },
    // Onboarding Step 4: Primary Ecommerce Channel
    channel: {
      type: String,
      trim: true,
      default: 'Shopify'
    },
    // Onboarding Step 5: Payment Methods
    paymentMethods: {
      type: [String],
      default: ['cod', 'prepaid']
    },
    // Onboarding Step 6: Initial Inventory Preferences
    inventoryPreferences: {
      lowStockAlertThreshold: {
        type: Number,
        default: 10,
        min: 1
      },
      autoReorderEnabled: {
        type: Boolean,
        default: false
      },
      syncFrequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily'],
        default: 'realtime'
      },
      restockAlertChannel: {
        type: String,
        enum: ['email'],
        default: 'email'
      }
    },
    // Operations & Autopilot Settings
    settings: {
      codRiskThreshold: { type: Number, default: 60, min: 10, max: 95 },
      lowStockThreshold: { type: Number, default: 10, min: 1 },
      autoEmailVerification: { type: Boolean, default: true },
      autoNdrRecovery: { type: Boolean, default: true },
      alertEmail: { type: String, default: '' }
    },
    onboardingStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 7
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
