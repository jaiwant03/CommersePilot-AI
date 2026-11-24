const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Customer full name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    ordersCount: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    rtoRiskScore: {
      type: Number,
      default: 15, // 0 - 100
      min: 0,
      max: 100
    },
    rtoHistoryCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

customerSchema.index({ store: 1, phone: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
