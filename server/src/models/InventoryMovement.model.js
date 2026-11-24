const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: {
      type: String,
      required: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: ['STOCK_IN', 'ORDER_DEDUCTION', 'RETURN_RESTOCK', 'ADJUSTMENT', 'MANUAL'],
      required: true
    },
    quantityChanged: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    referenceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    }
  },
  {
    timestamps: true
  }
);

inventoryMovementSchema.index({ store: 1, product: 1 });
inventoryMovementSchema.index({ store: 1, createdAt: -1 });

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

module.exports = InventoryMovement;
