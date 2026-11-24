const Product = require('../models/Product.model');
const InventoryMovement = require('../models/InventoryMovement.model');

/**
 * Get paginated products with search & category filtering
 */
const getProducts = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const { search, category, status, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = { store: storeId };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { sku: searchRegex }];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limitNum),
      Product.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      store: req.store._id
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product
 */
const createProduct = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const {
      title,
      description,
      category,
      sku,
      sellingPrice,
      costPrice,
      stockQuantity,
      reorderThreshold,
      variants,
      status
    } = req.body;

    const finalSellingPrice = sellingPrice !== undefined ? sellingPrice : req.body.price;
    const finalCostPrice = costPrice !== undefined ? costPrice : (req.body.cost || 0);

    // Check SKU duplicate in store
    const existingSku = await Product.findOne({ store: storeId, sku: sku.trim().toUpperCase() });
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `A product with SKU "${sku}" already exists in your store.`
      });
    }

    const product = new Product({
      store: storeId,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'Fashion & Apparel',
      sku: sku.trim().toUpperCase(),
      sellingPrice: Number(finalSellingPrice) || 0,
      costPrice: Number(finalCostPrice) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      reorderThreshold: Number(reorderThreshold) || 10,
      variants: Array.isArray(variants) ? variants : [],
      status: status || 'active'
    });

    await product.save();

    // Log initial inventory movement
    if (product.stockQuantity > 0) {
      await InventoryMovement.create({
        store: storeId,
        product: product._id,
        sku: product.sku,
        type: 'STOCK_IN',
        quantityChanged: product.stockQuantity,
        previousStock: 0,
        newStock: product.stockQuantity,
        reason: 'Initial product stock creation'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 */
const updateProduct = async (req, res, next) => {
  try {
    const storeId = req.store._id;
    const product = await Product.findOne({ _id: req.params.id, store: storeId });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      title,
      description,
      category,
      sku,
      sellingPrice,
      costPrice,
      stockQuantity,
      reorderThreshold,
      variants,
      status
    } = req.body;

    const previousStock = product.stockQuantity;

    if (title) product.title = title.trim();
    if (description !== undefined) product.description = description.trim();
    if (category) product.category = category.trim();
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    else if (req.body.price !== undefined) product.sellingPrice = Number(req.body.price);
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (reorderThreshold !== undefined) product.reorderThreshold = Number(reorderThreshold);
    if (variants && Array.isArray(variants)) product.variants = variants;
    if (status) product.status = status;

    if (sku && sku.trim().toUpperCase() !== product.sku) {
      const duplicateSku = await Product.findOne({
        store: storeId,
        sku: sku.trim().toUpperCase(),
        _id: { $ne: product._id }
      });
      if (duplicateSku) {
        return res.status(409).json({ success: false, message: `SKU "${sku}" is already in use.` });
      }
      product.sku = sku.trim().toUpperCase();
    }

    // Check if stock quantity changed
    if (stockQuantity !== undefined && Number(stockQuantity) !== previousStock) {
      const newStock = Number(stockQuantity);
      const diff = newStock - previousStock;
      product.stockQuantity = newStock;

      await InventoryMovement.create({
        store: storeId,
        product: product._id,
        sku: product.sku,
        type: diff > 0 ? 'STOCK_IN' : 'ADJUSTMENT',
        quantityChanged: diff,
        previousStock,
        newStock,
        reason: 'Manual stock adjustment in Product Management'
      });
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      store: req.store._id
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
