const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  title: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
});

const orderSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true,
      trim: true
    },
    customer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
      fullName: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true, default: '' },
      phone: { type: String, required: true, trim: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
      }
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'PREPAID'],
      required: true,
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PENDING'
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'ON_HOLD'],
      default: 'PENDING'
    },
    riskScore: {
      type: Number,
      default: 15,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW'
    },
    needsVerification: {
      type: Boolean,
      default: false
    },
    reviewStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'CONFIRMATION_REQUESTED', 'FLAGGED_MANUAL_REVIEW', 'REVIEWED'],
      default: 'PENDING'
    },
    riskReasons: {
      type: [String],
      default: []
    },
    recommendation: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery'
    },
    history: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

orderSchema.index({ store: 1, orderNumber: 1 });
orderSchema.index({ store: 1, orderStatus: 1 });
orderSchema.index({ store: 1, paymentMethod: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
