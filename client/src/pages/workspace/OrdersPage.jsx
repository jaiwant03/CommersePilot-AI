import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  ShoppingBag,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Truck,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';
import AnimatedRupee from '../../components/AnimatedRupee';

const INITIAL_ORDER_STATE = {
  customer: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  },
  paymentMethod: 'COD',
  items: [
    { product: '', productTitle: '', sku: '', quantity: 1, price: '' }
  ],
  notes: ''
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Order Form state & feedback
  const [newOrder, setNewOrder] = useState(INITIAL_ORDER_STATE);
  const [addOrderError, setAddOrderError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessBanner, setOrderSuccessBanner] = useState('');

  // Edit Order Status state
  const [editStatus, setEditStatus] = useState({
    orderStatus: '',
    paymentStatus: '',
    notes: ''
  });

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (paymentFilter !== 'ALL') params.paymentMethod = paymentFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await workspaceService.getOrders(params);
      const ordersList = res.orders || res.data?.orders || [];
      setOrders(ordersList);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchProductsForPicker = async () => {
    try {
      const res = await workspaceService.getProducts();
      const productsList = res.products || res.data?.products || [];
      setProducts(productsList);
    } catch (err) {
      console.warn('Could not load products for picker:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProductsForPicker();

    // Real-Time auto-sync interval (every 5 seconds when tab is active)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isSubmittingOrder) {
        fetchOrders(true);
      }
    }, 5000);

    // Re-sync immediately on window focus or tab visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders(true);
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // Real-Time order creation broadcast listener
    const handleOrderCreatedEvent = (e) => {
      if (e.detail) {
        setOrders((prev) => [e.detail, ...prev.filter((o) => o._id !== e.detail._id)]);
      }
      fetchOrders(true);
    };
    window.addEventListener('cp:order_created', handleOrderCreatedEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('cp:order_created', handleOrderCreatedEvent);
    };
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Open Details Modal
  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setEditStatus({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      notes: order.notes || ''
    });
    setShowDetailsModal(true);
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await workspaceService.updateOrder(selectedOrder._id, editStatus);
      const updated = res.order || res.data?.order || { ...selectedOrder, ...editStatus };
      setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, ...updated } : o)));
      setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
      setShowDetailsModal(false);
      await fetchOrders(true);
    } catch (err) {
      alert(err.message || 'Failed to update order');
    }
  };

  // COD Verification Actions
  const handleApproveOrder = async (orderId) => {
    try {
      await workspaceService.approveOrder(orderId);
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, reviewStatus: 'APPROVED', orderStatus: 'PROCESSING', needsVerification: false }));
      }
    } catch (err) {
      alert(err.message || 'Failed to approve order');
    }
  };

  const handleRequestConfirmation = async (orderId) => {
    try {
      await workspaceService.requestOrderConfirmation(orderId);
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, reviewStatus: 'CONFIRMATION_REQUESTED', needsVerification: true }));
      }
    } catch (err) {
      alert(err.message || 'Failed to request confirmation');
    }
  };

  const handleFlagReview = async (orderId) => {
    try {
      await workspaceService.flagOrderForReview(orderId, { reason: 'Flagged for high COD risk / address discrepancy' });
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, reviewStatus: 'FLAGGED_MANUAL_REVIEW', orderStatus: 'ON_HOLD' }));
      }
    } catch (err) {
      alert(err.message || 'Failed to flag order');
    }
  };

  const handleMarkReviewed = async (orderId) => {
    try {
      await workspaceService.markOrderReviewed(orderId);
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, reviewStatus: 'REVIEWED' }));
      }
    } catch (err) {
      alert(err.message || 'Failed to mark reviewed');
    }
  };

  // Customer Field Handler
  const handleCustomerChange = (field, value) => {
    setNewOrder((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
    if (addOrderError) setAddOrderError('');
  };

  // Item Field Change Handler (Immutable)
  const handleItemFieldChange = (index, field, value) => {
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => {
        if (i !== index) return it;
        return { ...it, [field]: value };
      })
    }));
    if (addOrderError) setAddOrderError('');
  };

  // Select Catalog Product into Line Item
  const handleSelectCatalogProduct = (index, productId) => {
    if (!productId) {
      setNewOrder((prev) => ({
        ...prev,
        items: prev.items.map((it, i) => (i === index ? { ...it, product: '' } : it))
      }));
      return;
    }
    const prod = products.find((p) => p._id === productId);
    if (!prod) return;

    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => {
        if (i !== index) return it;
        return {
          product: prod._id,
          productTitle: prod.title || '',
          sku: prod.sku || '',
          quantity: it.quantity || 1,
          price: prod.price !== undefined ? prod.price : ''
        };
      })
    }));
    if (addOrderError) setAddOrderError('');
  };

  // Add Item Line
  const handleAddLineItem = () => {
    setNewOrder((prev) => ({
      ...prev,
      items: [...prev.items, { product: '', productTitle: '', sku: '', quantity: 1, price: '' }]
    }));
  };

  // Remove Item Line
  const handleRemoveLineItem = (index) => {
    if (newOrder.items.length <= 1) return;
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // 1-Click Demo Customer & Order Autofill
  const handleFillDemoOrder = () => {
    const demoProd = products[0] || { _id: null, title: "Women's Black Kurti", sku: 'TT-KUR-BLK', price: 1299 };
    setNewOrder({
      customer: {
        name: 'Pooja Sundaram',
        email: 'pooja.sundaram@gmail.com',
        phone: '9845012345',
        address: '42, Avinashi Road, Near Lakshmi Mills',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        postalCode: '641018'
      },
      paymentMethod: 'COD',
      items: [
        {
          product: demoProd._id || '',
          productTitle: demoProd.title,
          sku: demoProd.sku || 'TT-KUR-BLK',
          quantity: 1,
          price: demoProd.price || 1299
        }
      ],
      notes: 'Customer confirmed availability via phone call.'
    });
    setAddOrderError('');
  };

  // Create Order Submit with Full Validation & Feedback
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setAddOrderError('');

    // 1. Validate Customer Information
    const { customer, items, paymentMethod, notes } = newOrder;
    if (!customer.name.trim()) {
      setAddOrderError('Please enter the customer full name.');
      return;
    }
    if (!customer.phone.trim() || customer.phone.trim().length < 7) {
      setAddOrderError('Please enter a valid phone number (at least 7 digits).');
      return;
    }
    if (!customer.address.trim()) {
      setAddOrderError('Please enter the delivery street address & landmark.');
      return;
    }
    if (!customer.city.trim() || !customer.state.trim() || !customer.postalCode.trim()) {
      setAddOrderError('City, State, and Postal Code (PIN) are required for delivery validation.');
      return;
    }

    if (!items || items.length === 0) {
      setAddOrderError('Please add at least one line item to the order.');
      return;
    }

    // 2. Validate Line Items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productTitle?.trim() && !it.product) {
        setAddOrderError(`Item #${i + 1} must have a product title or catalog selection.`);
        return;
      }
      const q = parseInt(it.quantity);
      if (isNaN(q) || q < 1) {
        setAddOrderError(`Item #${i + 1} must have a quantity of at least 1.`);
        return;
      }
      const p = parseFloat(it.price);
      if (isNaN(p) || p < 0) {
        setAddOrderError(`Item #${i + 1} must have a valid price (>= 0).`);
        return;
      }
    }

    try {
      setIsSubmittingOrder(true);
      const formattedItems = items.map((it) => ({
        product: it.product || undefined,
        productTitle: it.productTitle?.trim() || 'Catalog Item',
        sku: it.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        quantity: parseInt(it.quantity) || 1,
        price: parseFloat(it.price) || 0
      }));

      const total = formattedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);

      const payload = {
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          state: customer.state.trim(),
          postalCode: customer.postalCode.trim()
        },
        paymentMethod,
        items: formattedItems,
        notes: notes?.trim() || '',
        subtotal: total,
        totalAmount: total
      };

      const res = await workspaceService.createOrder(payload);
      setShowAddModal(false);
      setNewOrder(INITIAL_ORDER_STATE);

      const createdOrder = res.order || res.data?.order;
      if (createdOrder) {
        // Real-Time: Immediately prepend newly placed order to UI state
        setOrders((prev) => [createdOrder, ...prev.filter((o) => o._id !== createdOrder._id)]);
        // Real-Time: Broadcast event to other open tabs and components
        window.dispatchEvent(new CustomEvent('cp:order_created', { detail: createdOrder }));
      }

      setOrderSuccessBanner(`Order #${createdOrder?.orderNumber || 'created'} placed successfully! COD risk assessed and delivery manifest generated.`);
      setTimeout(() => setOrderSuccessBanner(''), 6000);
      await fetchOrders(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order. Please verify input fields.';
      setAddOrderError(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div>
      {/* Title & Actions */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <h1>Order Management</h1>
          <p>End-to-end order orchestration, automated COD risk detection & status tracking</p>
        </div>
        <div className="page-actions-group">
          <button onClick={fetchOrders} className="btn btn-secondary">
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={() => { setShowAddModal(true); setAddOrderError(''); }} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {orderSuccessBanner && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#059669',
          fontSize: '13px',
          fontWeight: 650,
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.06)'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{orderSuccessBanner}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-wrap">
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="table-search-input"
            placeholder="Search by order #, customer or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="filter-pills-row">
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-faint)', marginRight: '4px' }}>
            STATUS:
          </span>
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="filter-pills-row">
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-faint)', marginRight: '4px' }}>
            PAYMENT:
          </span>
          {['ALL', 'COD', 'PREPAID'].map((pm) => (
            <button
              key={pm}
              onClick={() => setPaymentFilter(pm)}
              className={`filter-pill ${paymentFilter === pm ? 'active' : ''}`}
            >
              {pm}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="data-table-card">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>COD Risk</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px' }} />
                    <p>Fetching database orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    <ShoppingBag size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>No orders match your filter criteria.</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', marginTop: '4px' }}>
                      Try clearing filters or click "Create Order" to create a live order.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const riskVal = ord.codRiskScore ?? ord.riskScore ?? 15;
                  const isHighRisk = riskVal >= 60;
                  const isMedRisk = riskVal >= 35 && riskVal < 60;
                  const itemCount = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;
                  const custName = ord.customer?.fullName || ord.customer?.name || 'Walk-in Customer';
                  const custPhone = ord.customer?.phone || ord.customer?.email || 'No contact';

                  return (
                    <tr key={ord._id}>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {ord.orderNumber}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {custName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                          {custPhone}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          <AnimatedRupee value={ord.totalAmount || 0} />
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${ord.paymentMethod === 'COD' ? 'badge-warning' : 'badge-info'}`}>
                          {ord.paymentMethod}
                        </span>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-faint)', marginTop: '2px' }}>
                          {ord.paymentStatus}
                        </div>
                      </td>
                      <td>
                        {ord.paymentMethod === 'COD' ? (
                          <div>
                            <span className={`risk-indicator ${isHighRisk ? 'high' : isMedRisk ? 'medium' : 'low'}`}>
                              {riskVal}/100 {isHighRisk ? 'HIGH' : isMedRisk ? 'MED' : 'LOW'}
                            </span>
                          </div>
                        ) : (
                          <span className="risk-indicator low">PREPAID</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          ord.orderStatus === 'DELIVERED' ? 'badge-success' :
                          ord.orderStatus === 'CANCELLED' ? 'badge-danger' :
                          ord.orderStatus === 'SHIPPED' ? 'badge-info' : 'badge-purple'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenDetails(ord)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          title="View and Edit Order"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View & Update Order Details */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Order {selectedOrder.orderNumber}</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                className="topbar-btn"
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Customer and Shipping Snapshot */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  Customer & Shipping Address
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  <strong>{selectedOrder.customer?.fullName || selectedOrder.customer?.name || 'Customer'}</strong> • {selectedOrder.customer?.phone || 'No phone'} • {selectedOrder.customer?.email || 'No email'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {(() => {
                    const addr = selectedOrder.customer?.address || selectedOrder.shippingAddress;
                    if (typeof addr === 'object' && addr !== null) {
                      return `${addr.street || addr.address || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || addr.postalCode || ''}`;
                    }
                    return `${selectedOrder.customer?.address || 'Standard Address'}, ${selectedOrder.customer?.city || ''}, ${selectedOrder.customer?.state || ''} - ${selectedOrder.customer?.postalCode || ''}`;
                  })()}
                </div>
              </div>

              {/* COD Risk Evaluation & Multi-Action Bar */}
              {selectedOrder.paymentMethod === 'COD' && (
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: (selectedOrder.riskScore ?? selectedOrder.codRiskScore ?? 0) >= 60 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1.5px solid ${(selectedOrder.riskScore ?? selectedOrder.codRiskScore ?? 0) >= 60 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`,
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(selectedOrder.riskScore ?? selectedOrder.codRiskScore ?? 0) >= 60 ? (
                        <AlertTriangle size={20} style={{ color: '#EF4444' }} />
                      ) : (
                        <ShieldCheck size={20} style={{ color: '#10B981' }} />
                      )}
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                          COD Risk Radar: {selectedOrder.riskScore ?? selectedOrder.codRiskScore ?? 0}/100 ({selectedOrder.riskLevel || ((selectedOrder.riskScore ?? selectedOrder.codRiskScore ?? 0) >= 60 ? 'HIGH' : 'LOW')})
                        </span>
                        {selectedOrder.reviewStatus && (
                          <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', fontWeight: 700 }}>
                            REVIEW STATUS: {selectedOrder.reviewStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`risk-indicator ${(selectedOrder.riskScore ?? selectedOrder.codRiskScore ?? 0) >= 60 ? 'high' : 'low'}`}>
                      {(selectedOrder.riskScore ?? selectedOrder.codRiskScore ?? 0) >= 60 ? 'High Risk - Action Needed' : 'Low Risk - Verified'}
                    </span>
                  </div>

                  {(selectedOrder.riskReasons?.length > 0 || selectedOrder.riskFactors?.length > 0) && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
                      <strong style={{ color: 'var(--color-text-primary)' }}>Risk Factors Detected:</strong>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        {(selectedOrder.riskReasons || selectedOrder.riskFactors || []).map((reason, rIdx) => (
                          <li key={rIdx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedOrder.recommendation && (
                    <div style={{ fontSize: '12px', color: '#B45309', marginBottom: '14px', fontWeight: 600 }}>
                      Operational Recommendation: {selectedOrder.recommendation}
                    </div>
                  )}

                  {/* 4 Multi-Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.15)' }}>
                    <button
                      type="button"
                      onClick={() => handleApproveOrder(selectedOrder._id)}
                      className="btn"
                      style={{ background: '#16A34A', color: '#fff', fontSize: '11px', padding: '8px 10px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    >
                      ✓ Approve Order
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestConfirmation(selectedOrder._id)}
                      className="btn"
                      style={{ background: '#4F46E5', color: '#fff', fontSize: '11px', padding: '8px 10px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    >
                      ✉ Request Confirmation
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFlagReview(selectedOrder._id)}
                      className="btn"
                      style={{ background: '#DC2626', color: '#fff', fontSize: '11px', padding: '8px 10px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    >
                      ⚠ Flag for Review
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkReviewed(selectedOrder._id)}
                      className="btn"
                      style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--border-subtle)', fontSize: '11px', padding: '8px 10px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}
                    >
                      ✓ Mark Reviewed
                    </button>
                  </div>
                </div>
              )}

              {/* Order Items Table */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Ordered Items
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>Item</th>
                        <th style={{ padding: '8px 12px' }}>SKU</th>
                        <th style={{ padding: '8px 12px' }}>Qty</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 12px' }}>{it.title || it.productTitle || 'Product SKU'}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--color-text-faint)' }}>{it.sku || '-'}</td>
                          <td style={{ padding: '8px 12px' }}>{it.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                            <AnimatedRupee value={it.totalPrice || ((it.unitPrice || it.price) * it.quantity) || 0} />
                          </td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid var(--border-subtle)', fontWeight: 700 }}>
                        <td colSpan={3} style={{ padding: '10px 12px' }}>Total Amount</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--color-primary-light)' }}>
                          <AnimatedRupee value={selectedOrder.totalAmount || 0} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Update Status Form */}
              <form onSubmit={handleUpdateOrderStatus}>
                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Order Status</label>
                    <select
                      className="workspace-select"
                      value={editStatus.orderStatus}
                      onChange={(e) => setEditStatus({ ...editStatus, orderStatus: e.target.value })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="workspace-form-group">
                    <label className="workspace-label">Payment Status</label>
                    <select
                      className="workspace-select"
                      value={editStatus.paymentStatus}
                      onChange={(e) => setEditStatus({ ...editStatus, paymentStatus: e.target.value })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                </div>

                <div className="workspace-form-group">
                  <label className="workspace-label">Internal Merchant Notes</label>
                  <textarea
                    className="workspace-textarea"
                    rows={2}
                    placeholder="Add operational notes or dispatch instructions..."
                    value={editStatus.notes}
                    onChange={(e) => setEditStatus({ ...editStatus, notes: e.target.value })}
                  />
                </div>

                <div className="modal-footer" style={{ padding: '12px 0 0', border: 'none' }}>
                  <button type="button" onClick={() => setShowDetailsModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Order */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="modal-title">Create Manual / In-Store Order</h3>
                <button
                  type="button"
                  className="demo-quickfill-btn"
                  onClick={handleFillDemoOrder}
                  title="Auto-fill sample customer & item for fast testing"
                >
                  <Sparkles size={12} />
                  <span>1-Click Demo Fill</span>
                </button>
              </div>
              <button
                className="topbar-btn"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                {addOrderError && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '10px',
                    color: '#DC2626',
                    fontSize: '12.5px',
                    fontWeight: 650,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{addOrderError}</span>
                  </div>
                )}

                {/* Customer Details */}
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '8px' }}>
                  Customer Information
                </div>
                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Full Name *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={newOrder.customer.name}
                      onChange={(e) => handleCustomerChange('name', e.target.value)}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Phone Number *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. 9876543210"
                      value={newOrder.customer.phone}
                      onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="workspace-form-group">
                    <label className="workspace-label">Email Address</label>
                    <input
                      type="email"
                      className="workspace-input"
                      placeholder="e.g. rahul@example.com"
                      value={newOrder.customer.email}
                      onChange={(e) => handleCustomerChange('email', e.target.value)}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Payment Method *</label>
                    <select
                      className="workspace-select"
                      value={newOrder.paymentMethod}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="PREPAID">Prepaid (UPI / Card / NetBanking)</option>
                    </select>
                  </div>
                </div>

                <div className="workspace-form-group">
                  <label className="workspace-label">Street Address & Landmark *</label>
                  <input
                    type="text"
                    className="workspace-input"
                    required
                    placeholder="e.g. 104, Horizon Heights, MG Road"
                    value={newOrder.customer.address}
                    onChange={(e) => handleCustomerChange('address', e.target.value)}
                  />
                </div>

                <div className="form-grid-3">
                  <div className="workspace-form-group">
                    <label className="workspace-label">City *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. Coimbatore"
                      value={newOrder.customer.city}
                      onChange={(e) => handleCustomerChange('city', e.target.value)}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">State *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. Tamil Nadu"
                      value={newOrder.customer.state}
                      onChange={(e) => handleCustomerChange('state', e.target.value)}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Postal Code (PIN) *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. 641001"
                      value={newOrder.customer.postalCode}
                      onChange={(e) => handleCustomerChange('postalCode', e.target.value)}
                    />
                  </div>
                </div>

                {/* Items Selection */}
                <div style={{ marginTop: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                    Order Line Items
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="btn btn-secondary"
                    style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  >
                    + Add Line Item
                  </button>
                </div>

                {newOrder.items.map((it, idx) => {
                  const lineTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0);
                  return (
                    <div key={idx} className="order-item-input-card">
                      <div className="order-item-header">
                        <span className="order-item-num">Item #{idx + 1}</span>
                        {products.length > 0 && (
                          <select
                            className="workspace-select item-catalog-select"
                            value={it.product || ''}
                            onChange={(e) => handleSelectCatalogProduct(idx, e.target.value)}
                          >
                            <option value="">⚡ Autofill from Catalog Product...</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.title} (₹{p.price})
                              </option>
                            ))}
                          </select>
                        )}
                        {newOrder.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="item-remove-btn"
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="form-grid-4">
                        <div className="workspace-form-group" style={{ marginBottom: 0 }}>
                          <label className="workspace-label">Item Title *</label>
                          <input
                            type="text"
                            className="workspace-input"
                            required
                            placeholder="e.g. Women's Black Kurti"
                            value={it.productTitle}
                            onChange={(e) => handleItemFieldChange(idx, 'productTitle', e.target.value)}
                          />
                        </div>

                        <div className="workspace-form-group" style={{ marginBottom: 0 }}>
                          <label className="workspace-label">SKU</label>
                          <input
                            type="text"
                            className="workspace-input"
                            placeholder="e.g. TT-KUR-BLK"
                            value={it.sku}
                            onChange={(e) => handleItemFieldChange(idx, 'sku', e.target.value)}
                          />
                        </div>

                        <div className="workspace-form-group" style={{ marginBottom: 0 }}>
                          <label className="workspace-label">Qty *</label>
                          <input
                            type="number"
                            className="workspace-input"
                            min={1}
                            required
                            value={it.quantity}
                            onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                          />
                        </div>

                        <div className="workspace-form-group" style={{ marginBottom: 0 }}>
                          <label className="workspace-label">Unit Price (₹) *</label>
                          <input
                            type="number"
                            className="workspace-input"
                            min={0}
                            step="any"
                            required
                            placeholder="0"
                            value={it.price}
                            onChange={(e) => handleItemFieldChange(idx, 'price', e.target.value)}
                          />
                        </div>

                        <div className="order-item-total-badge">
                          <span className="total-label">Total</span>
                          <span className="total-val">₹{lineTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Notes */}
                <div className="workspace-form-group" style={{ marginTop: '12px', marginBottom: 0 }}>
                  <label className="workspace-label">Order Notes / Instructions</label>
                  <input
                    type="text"
                    className="workspace-input"
                    placeholder="e.g. Urgent festival dispatch; customer confirmed via call"
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                {/* Live Order Summary Box */}
                <div className="order-summary-box">
                  <div className="order-summary-left">
                    <div className="summary-stat">
                      <span className="stat-label">Items:</span>
                      <span className="stat-val">{newOrder.items.length}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Payment:</span>
                      <span className="stat-val badge">{newOrder.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="order-summary-right">
                    <span className="grand-total-label">Grand Total:</span>
                    <span className="grand-total-val">
                      ₹{newOrder.items.reduce((s, it) => s + ((Number(it.quantity) || 0) * (Number(it.price) || 0)), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmittingOrder}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingOrder}>
                  {isSubmittingOrder ? <RefreshCw size={15} className="spinning" /> : <Plus size={15} />}
                  <span>{isSubmittingOrder ? 'Placing Order...' : 'Save & Place Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
