const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: { type: String, required: true },
  title: { type: String, required: true },
  currentStock: { type: Number, required: true, default: 0 },
  reorderQuantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  estimatedCost: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    poNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    supplierName: {
      type: String,
      required: true,
      default: 'Primary Apparel Manufacturer'
    },
    supplierEmail: {
      type: String,
      required: true,
      default: 'orders@surattextiles.example.com'
    },
    items: [poItemSchema],
    totalEstimatedCost: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['DRAFT_PENDING_APPROVAL', 'APPROVED', 'SENT_TO_SUPPLIER', 'RECEIVED', 'REJECTED'],
      default: 'DRAFT_PENDING_APPROVAL',
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    sentAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
