const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['ORDER_CONFIRMATION', 'DELIVERY_RESCHEDULE', 'PO_APPROVAL'],
      index: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery'
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '7d' } // Auto-cleanup after 7 days
    },
    respondedAt: {
      type: Date
    },
    responseValue: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

module.exports = VerificationToken;
