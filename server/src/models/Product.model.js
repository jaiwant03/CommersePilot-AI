const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Size: M / Color: Emerald"
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, default: 0 },
  attributes: {
    size: { type: String, default: '' },
    color: { type: String, default: '' }
  }
});

const productSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Fashion & Apparel'
    },
    sku: {
      type: String,
      required: [true, 'Primary SKU is required'],
      trim: true,
      uppercase: true
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative']
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative']
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0,
      min: 0
    },
    reorderThreshold: {
      type: Number,
      default: 10,
      min: 1
    },
    leadTimeDays: {
      type: Number,
      default: 7,
      min: 1
    },
    safetyStockDays: {
      type: Number,
      default: 7,
      min: 0
    },
    variants: [variantSchema],
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ store: 1, sku: 1 });
productSchema.index({ store: 1, category: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
