const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    workflowName: {
      type: String,
      required: true,
      enum: [
        'ORDER_ANALYSIS_VERIFICATION',
        'INVENTORY_INTELLIGENCE',
        'DELIVERY_RECOVERY_NDR',
        'DAILY_BUSINESS_REPORT'
      ],
      index: true
    },
    triggerEvent: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'RUNNING'],
      default: 'PENDING',
      index: true
    },
    executionMode: {
      type: String,
      required: true,
      enum: ['LIVE_N8N', 'DEMO_SIMULATION'],
      default: 'DEMO_SIMULATION'
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    referenceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    referenceProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    referenceDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery'
    },
    requestPayload: {
      type: mongoose.Schema.Types.Mixed
    },
    responsePayload: {
      type: mongoose.Schema.Types.Mixed
    },
    errorMessage: {
      type: String,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailType: {
      type: String,
      default: null
    },
    emailRecipient: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

automationLogSchema.index({ store: 1, createdAt: -1 });

const AutomationLog = mongoose.model('AutomationLog', automationLogSchema);

module.exports = AutomationLog;
