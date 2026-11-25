import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  ArrowUpDown,
  History,
  X,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Layers,
  FileText,
  CheckCircle2
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';

const CATEGORIES = [
  'ALL',
  'Apparel & Fashion',
  'Beauty & Cosmetics',
  'Footwear',
  'Jewelry & Accessories',
  'Home & Living',
  'Electronics & Gadgets',
  'Food & Beverages'
];

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Tabs: Products Catalog vs Forecast vs Purchase Orders vs Movements
  const [activeTab, setActiveTab] = useState('products');
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loadingPOs, setLoadingPOs] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State for Add / Edit Product
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Apparel & Fashion',
    sku: '',
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    reorderThreshold: 10,
    description: '',
    variants: []
  });

  // Stock Adjustment Form
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    variantSku: '',
    type: 'ADD', // 'ADD', 'REMOVE', 'SET'
    quantity: 1,
    reason: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (lowStockOnly) params.lowStock = 'true';

      const res = await workspaceService.getProducts(params);
      setProducts(res.products || res.data?.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoadingMovements(true);
      const res = await workspaceService.getInventoryMovements();
      setMovements(res.movements || res.data?.movements || []);
    } catch (err) {
      console.error('Failed to load inventory movements:', err);
    } finally {
      setLoadingMovements(false);
    }
  };

  const fetchForecast = async () => {
    try {
      setLoadingForecast(true);
      const res = await workspaceService.getDemandForecast();
      setForecastData(res.data || res);
    } catch (err) {
      console.error('Failed to load demand forecasts:', err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const fetchPOs = async () => {
    try {
      setLoadingPOs(true);
      const res = await workspaceService.getPurchaseOrders();
      setPurchaseOrders(res.purchaseOrders || res.data?.purchaseOrders || []);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoadingPOs(false);
    }
  };

  const handleApprovePO = async (poId) => {
    try {
      await workspaceService.approvePurchaseOrder(poId);
      await fetchPOs();
      alert('Purchase order approved and official replenishment notification dispatched to supplier.');
    } catch (err) {
      alert(err.message || 'Failed to approve purchase order');
    }
  };

  const handleRejectPO = async (poId) => {
    try {
      await workspaceService.rejectPurchaseOrder(poId, { reason: 'Cancelled by merchant' });
      await fetchPOs();
    } catch (err) {
      alert(err.message || 'Failed to reject purchase order');
    }
  };

  const handleReceivePO = async (poId) => {
    try {
      await workspaceService.receivePurchaseOrder(poId);
      await fetchPOs();
      alert('Goods received! Inventory quantities have been updated in your catalog.');
    } catch (err) {
      alert(err.message || 'Failed to receive purchase order');
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'forecast') {
      fetchForecast();
    } else if (activeTab === 'purchase_orders') {
      fetchPOs();
    } else {
      fetchMovements();
    }
  }, [categoryFilter, lowStockOnly, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Add Product
  const handleOpenAdd = () => {
    setProductForm({
      title: '',
      category: 'Apparel & Fashion',
      sku: '',
      price: 0,
      costPrice: 0,
      stockQuantity: 10,
      reorderThreshold: 5,
      description: '',
      variants: []
    });
    setShowAddModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      await workspaceService.createProduct(productForm);
      setShowAddModal(false);
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  // Edit Product
  const handleOpenEdit = (p) => {
    setSelectedProduct(p);
    setProductForm({
      title: p.title,
      category: p.category,
      sku: p.sku || '',
      price: p.price,
      costPrice: p.costPrice || 0,
      stockQuantity: p.stockQuantity || 0,
      reorderThreshold: p.reorderThreshold || 10,
      description: p.description || '',
      variants: p.variants || []
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await workspaceService.updateProduct(selectedProduct._id, productForm);
      setShowEditModal(false);
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to update product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      await workspaceService.deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Open Stock Adjust Modal
  const handleOpenAdjust = (p) => {
    setSelectedProduct(p);
    setAdjustForm({
      productId: p._id,
      variantSku: p.variants?.[0]?.sku || p.sku || '',
      type: 'ADD',
      quantity: 10,
      reason: 'Batch restocking'
    });
    setShowAdjustModal(true);
  };

  const handleStockAdjustmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await workspaceService.adjustStock(adjustForm);
      setShowAdjustModal(false);
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  return (
    <div>
      {/* Title & Actions */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <h1>Predictive Inventory</h1>
          <p>Real-time SKU tracking, automated reorder thresholds & audit logs</p>
        </div>
        <div className="page-actions-group">
          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'var(--color-bg-secondary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('products')}
              className={`filter-pill ${activeTab === 'products' ? 'active' : ''}`}
              style={{ border: 'none' }}
            >
              <Package size={14} style={{ marginRight: '6px', display: 'inline' }} />
              Catalog SKUs
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`filter-pill ${activeTab === 'forecast' ? 'active' : ''}`}
              style={{ border: 'none' }}
            >
              <TrendingDown size={14} style={{ marginRight: '6px', display: 'inline' }} />
              Demand Forecasting & Runways
            </button>
            <button
              onClick={() => setActiveTab('purchase_orders')}
              className={`filter-pill ${activeTab === 'purchase_orders' ? 'active' : ''}`}
              style={{ border: 'none' }}
            >
              <FileText size={14} style={{ marginRight: '6px', display: 'inline' }} />
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`filter-pill ${activeTab === 'movements' ? 'active' : ''}`}
              style={{ border: 'none' }}
            >
              <History size={14} style={{ marginRight: '6px', display: 'inline' }} />
              Movement Logs
            </button>
          </div>

          <button onClick={fetchProducts} className="btn btn-secondary">
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Controls: Search, Category, Low-stock toggle */}
          <div className="table-controls-bar">
            <form onSubmit={handleSearchSubmit} className="search-input-wrap">
              <Search size={16} className="search-icon-pos" />
              <input
                type="text"
                className="table-search-input"
                placeholder="Search by title or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            <div className="filter-pills-row">
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-faint)', marginRight: '4px' }}>
                CATEGORY:
              </span>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`filter-pill ${lowStockOnly ? 'active' : ''}`}
              style={{ borderColor: lowStockOnly ? '#EF4444' : undefined }}
            >
              <AlertTriangle size={13} style={{ marginRight: '4px', display: 'inline', color: '#F59E0B' }} />
              Low Stock Alert Only
            </button>
          </div>

          {/* Products Table */}
          <div className="data-table-card">
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th>Base SKU</th>
                    <th>Variants</th>
                    <th>Selling Price</th>
                    <th>Cost Price</th>
                    <th>Gross Margin</th>
                    <th>Available Stock</th>
                    <th>Threshold</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && products.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                        <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px' }} />
                        <p>Loading database inventory...</p>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                        <Package size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                        <p style={{ fontWeight: 600 }}>No products found matching filters.</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', marginTop: '4px' }}>
                          Add a product or seed the database with catalog items.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const totalStock = p.variants?.length > 0
                        ? p.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
                        : (p.stockQuantity || 0);

                      const threshold = p.reorderThreshold || 10;
                      const isLowStock = totalStock <= threshold;
                      const isOut = totalStock === 0;
                      const margin = p.price > 0 && p.costPrice > 0
                        ? Math.round(((p.price - p.costPrice) / p.price) * 100)
                        : null;

                      return (
                        <tr key={p._id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {p.title}
                            </div>
                            {p.description && (
                              <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              {p.category}
                            </span>
                          </td>
                          <td>
                            <code style={{ fontSize: '12px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                              {p.sku || 'N/A'}
                            </code>
                          </td>
                          <td>
                            {p.variants?.length > 0 ? (
                              <span className="status-badge badge-purple">
                                {p.variants.length} sizes/colors
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>Single SKU</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              ₹{p.price?.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              ₹{p.costPrice ? p.costPrice.toLocaleString('en-IN') : '0'}
                            </span>
                          </td>
                          <td>
                            {margin !== null ? (
                              <span style={{ fontSize: '12px', color: margin >= 40 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                                {margin}%
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>-</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${isOut ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}`}>
                              {isOut ? 'Stockout (0)' : `${totalStock} units`}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                              {threshold} units
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleOpenAdjust(p)}
                                className="btn btn-secondary"
                                style={{ padding: '5px 8px', fontSize: '11px' }}
                                title="Adjust Stock Quantity"
                              >
                                <ArrowUpDown size={12} />
                                <span>Adjust</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="topbar-btn"
                                style={{ width: '28px', height: '28px' }}
                                title="Edit Product"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id, p.title)}
                                className="topbar-btn"
                                style={{ width: '28px', height: '28px', color: '#EF4444' }}
                                title="Delete Product"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'forecast' ? (
        /* Demand Forecasting & Stock Runways Tab */
        <div className="data-table-card">
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Predictive Demand Forecasting &amp; Stock Runways
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Algorithmic inventory intelligence based on 30-day trailing sales velocity (ADD) and supplier lead times
              </p>
            </div>
            <button onClick={fetchForecast} className="btn btn-secondary" style={{ fontSize: '12px' }}>
              <RefreshCw size={14} className={loadingForecast ? 'spinning' : ''} />
              <span>Refresh Forecast</span>
            </button>
          </div>

          {forecastData?.summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '16px 20px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontWeight: 600 }}>SKUS SCANNED</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {forecastData.summary.totalSkusScanned || 0}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>ITEMS NEEDING REORDER</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                  {forecastData.summary.skusNeedingReorder || 0}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 600 }}>EST. REPLENISHMENT CAPITAL</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#4F46E5', marginTop: '4px' }}>
                  ₹{(forecastData.summary.totalEstimatedReorderBudget || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product &amp; SKU</th>
                  <th>Current Stock</th>
                  <th>Avg Daily Demand (ADD)</th>
                  <th>Days of Stock (Runway)</th>
                  <th>Reorder Point (ROP)</th>
                  <th>Suggested Restock</th>
                  <th>Est. Cost</th>
                  <th>Status &amp; Urgency</th>
                </tr>
              </thead>
              <tbody>
                {loadingForecast ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                      <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px' }} />
                      <p>Running moving-average demand models...</p>
                    </td>
                  </tr>
                ) : (forecastData?.forecasts || []).length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                      No demand telemetry available yet.
                    </td>
                  </tr>
                ) : (
                  (forecastData?.forecasts || []).map((f) => {
                    const isCritical = f.daysOfStock <= 3 || f.runwayCategory === 'CRITICAL_RUNWAY';
                    const isOut = f.availableStock === 0 || f.runwayCategory === 'OUT_OF_STOCK';

                    return (
                      <tr key={f.sku}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{f.title}</div>
                          <code style={{ fontSize: '11px' }}>{f.sku}</code>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: isOut ? '#EF4444' : isCritical ? '#D97706' : 'inherit' }}>
                            {f.availableStock} units
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{f.averageDailyDemand} units/day</span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11px',
                            background: isOut ? '#FEE2E2' : isCritical ? '#FEF3C7' : '#DCFCE7',
                            color: isOut ? '#DC2626' : isCritical ? '#B45309' : '#16A34A'
                          }}>
                            {isOut ? '0.00 days (OUT OF STOCK)' : `${f.daysOfStock} days`}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{f.reorderPoint} units</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#4F46E5' }}>{f.suggestedReorderQuantity} units</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>₹{(f.estimatedReorderCost || 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isOut || isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isOut || isCritical ? '#DC2626' : '#16A34A'
                          }}>
                            {isOut ? 'IMMEDIATE PO' : isCritical ? 'CRITICAL RUNWAY' : 'SAFE BUFFER'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'purchase_orders' ? (
        /* Purchase Orders Tab */
        <div className="data-table-card">
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Supplier Purchase Orders (POs)
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Auto-drafted purchase orders generated when SKU stock runway drops below lead times
              </p>
            </div>
            <button onClick={fetchPOs} className="btn btn-secondary" style={{ fontSize: '12px' }}>
              <RefreshCw size={14} className={loadingPOs ? 'spinning' : ''} />
              <span>Refresh POs</span>
            </button>
          </div>

          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Supplier / Manufacturer</th>
                  <th>Replenishment Items</th>
                  <th>Estimated Capital</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingPOs ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                      <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px' }} />
                      <p>Loading purchase orders...</p>
                    </td>
                  </tr>
                ) : purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => {
                    const isDraft = po.status === 'DRAFT' || po.status === 'PENDING';
                    const isApproved = po.status === 'APPROVED';

                    return (
                      <tr key={po._id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {po.poNumber || `PO-${po._id.slice(-6).toUpperCase()}`}
                          </span>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                            {new Date(po.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{po.supplier?.name || 'Coimbatore Fabric Mills'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                            {po.supplier?.email || 'supplies@coimbatorefabric.in'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>
                            {(po.items || []).map((it, idx) => (
                              <div key={idx}>
                                {it.title || it.sku} x <strong>{it.reorderQuantity || it.quantity} units</strong> (₹{it.unitCost}/unit)
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            ₹{(po.totalEstimatedCost || po.totalCost || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: po.status === 'RECEIVED' ? 'rgba(16, 185, 129, 0.25)' : isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: po.status === 'RECEIVED' ? '#059669' : isApproved ? '#16A34A' : '#D97706'
                          }}>
                            {po.status || 'DRAFT'}
                          </span>
                        </td>
                        <td>
                          {isDraft ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleApprovePO(po._id)}
                                className="btn"
                                style={{ background: '#16A34A', color: '#fff', border: 'none', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}
                              >
                                ✓ Approve &amp; Dispatch PO
                              </button>
                              <button
                                onClick={() => handleRejectPO(po._id)}
                                className="btn"
                                style={{ background: '#DC2626', color: '#fff', border: 'none', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          ) : po.status === 'RECEIVED' ? (
                            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                              ✓ Received &amp; Restocked
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                                ✓ Dispatched
                              </span>
                              <button
                                onClick={() => handleReceivePO(po._id)}
                                className="btn"
                                style={{ background: '#0284C7', color: '#fff', border: 'none', padding: '5px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '5px', cursor: 'pointer' }}
                                title="Click when shipment arrives to automatically add stock to catalog"
                              >
                                📦 Mark Received
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Movements / Audit Log Tab */
        <div className="data-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Stock Audit Trail & Automated Movements
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
              Permanent record of order deductions, restocks, NDR returns, and manual adjustments
            </p>
          </div>

          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Movement Type</th>
                  <th>Quantity Delta</th>
                  <th>Reason / Context</th>
                </tr>
              </thead>
              <tbody>
                {loadingMovements ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                      <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px' }} />
                      <p>Loading stock movements...</p>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                      No inventory movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr key={mov._id}>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {new Date(mov.createdAt).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {mov.product?.title || 'Catalog Product'}
                          </span>
                        </td>
                        <td>
                          <code>{mov.variantSku || mov.product?.sku || '-'}</code>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            mov.type === 'RETURN_RESTOCK' ? 'badge-success' :
                            mov.type === 'ORDER_DEDUCTION' ? 'badge-info' : 'badge-purple'
                          }`}>
                            {mov.type}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: isPositive ? '#10B981' : '#EF4444' }}>
                            {isPositive ? `+${mov.quantity}` : mov.quantity}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                            {mov.reason || 'Automated inventory event'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Product */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Product to Catalog</h3>
              <button className="topbar-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div className="workspace-form-group">
                  <label className="workspace-label">Product Title *</label>
                  <input
                    type="text"
                    className="workspace-input"
                    required
                    placeholder="e.g. Royal Silk Anarkali Kurta Set"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Category *</label>
                    <select
                      className="workspace-select"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Base SKU *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. ANR-001"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      className="workspace-input"
                      required
                      min={0}
                      placeholder="e.g. 2499"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Cost of Goods Sold (₹)</label>
                    <input
                      type="number"
                      className="workspace-input"
                      min={0}
                      placeholder="e.g. 950"
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Initial Stock Quantity</label>
                    <input
                      type="number"
                      className="workspace-input"
                      min={0}
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Reorder Threshold Alert</label>
                    <input
                      type="number"
                      className="workspace-input"
                      min={1}
                      value={productForm.reorderThreshold}
                      onChange={(e) => setProductForm({ ...productForm, reorderThreshold: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </div>

                <div className="workspace-form-group">
                  <label className="workspace-label">Product Description</label>
                  <textarea
                    className="workspace-textarea"
                    rows={2}
                    placeholder="Short description for shipping and sales channels..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product */}
      {showEditModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Product Details</h3>
              <button className="topbar-btn" onClick={() => setShowEditModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              <div className="modal-body">
                <div className="workspace-form-group">
                  <label className="workspace-label">Product Title *</label>
                  <input
                    type="text"
                    className="workspace-input"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Category</label>
                    <select
                      className="workspace-select"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">SKU</label>
                    <input
                      type="text"
                      className="workspace-input"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Selling Price (₹)</label>
                    <input
                      type="number"
                      className="workspace-input"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Cost Price (₹)</label>
                    <input
                      type="number"
                      className="workspace-input"
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Reorder Threshold</label>
                    <input
                      type="number"
                      className="workspace-input"
                      value={productForm.reorderThreshold}
                      onChange={(e) => setProductForm({ ...productForm, reorderThreshold: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock */}
      {showAdjustModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Adjust Stock: {selectedProduct.title}</h3>
              <button className="topbar-btn" onClick={() => setShowAdjustModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit}>
              <div className="modal-body">
                <div className="workspace-form-group">
                  <label className="workspace-label">Adjustment Type</label>
                  <select
                    className="workspace-select"
                    value={adjustForm.type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  >
                    <option value="ADD">Restock / Add Units (+)</option>
                    <option value="REMOVE">Damage / Write-off / Audit Deduction (-)</option>
                    <option value="SET">Set Exact Physical Count (=)</option>
                  </select>
                </div>

                <div className="workspace-form-group">
                  <label className="workspace-label">Quantity</label>
                  <input
                    type="number"
                    className="workspace-input"
                    required
                    min={0}
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="workspace-form-group">
                  <label className="workspace-label">Reason Note *</label>
                  <input
                    type="text"
                    className="workspace-input"
                    required
                    placeholder="e.g. Received shipment from Surat vendor, warehouse cycle count"
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
