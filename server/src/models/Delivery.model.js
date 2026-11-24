const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    awb: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    courier: {
      type: String,
      enum: ['Delhivery', 'Shiprocket', 'Blue Dart', 'Shadowfax', 'Ecom Express', 'Xpressbees'],
      default: 'Delhivery'
    },
    status: {
      type: String,
      enum: ['PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RTO'],
      default: 'PENDING'
    },
    destination: {
      city: { type: String, default: '' },
      pincode: { type: String, default: '' },
      state: { type: String, default: '' }
    },
    ndrReason: {
      type: String,
      default: ''
    },
    customerResponse: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'DECLINED', 'NO_RESPONSE'],
      default: 'PENDING'
    },
    recoveryStatus: {
      type: String,
      enum: ['PENDING', 'RECOVERED', 'CUSTOMER_DECLINED', 'EXPIRED'],
      default: 'PENDING'
    },
    whatsappMessage: {
      type: String,
      default: ''
    },
    whatsappStatus: {
      type: String,
      enum: ['NOT_SENT', 'SENT', 'DELIVERED', 'READ', 'REPLIED'],
      default: 'NOT_SENT'
    },
    rescheduledDate: {
      type: Date
    },
    attemptsCount: {
      type: Number,
      default: 0
    },
    trackingEvents: [
      {
        status: { type: String, required: true },
        location: { type: String, default: '' },
        message: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    estimatedDelivery: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

deliverySchema.index({ store: 1, awb: 1 });
deliverySchema.index({ store: 1, status: 1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
