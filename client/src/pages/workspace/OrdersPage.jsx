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
  IndianRupee
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';
import AnimatedRupee from '../../components/AnimatedRupee';

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

  // New Order Form state
  const [newOrder, setNewOrder] = useState({
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
      { productTitle: '', sku: '', quantity: 1, price: 0 }
    ],
    notes: ''
  });

  // Edit Order Status state
  const [editStatus, setEditStatus] = useState({
    orderStatus: '',
    paymentStatus: '',
    notes: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (paymentFilter !== 'ALL') params.paymentMethod = paymentFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await workspaceService.getOrders(params);
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsForPicker = async () => {
    try {
      const res = await workspaceService.getProducts();
      setProducts(res.data?.products || []);
    } catch (err) {
      console.warn('Could not load products for picker:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProductsForPicker();
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
      await workspaceService.updateOrder(selectedOrder._id, editStatus);
      setShowDetailsModal(false);
      await fetchOrders();
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

  // Add Item to New Order Form
  const handleAddItem = () => {
    setNewOrder((prev) => ({
      ...prev,
      items: [...prev.items, { productTitle: '', sku: '', quantity: 1, price: 0 }]
    }));
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    if (newOrder.items.length === 1) return;
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Select existing product into item line
  const handleSelectProduct = (index, productId) => {
    const prod = products.find((p) => p._id === productId);
    if (!prod) return;

    const updated = [...newOrder.items];
    updated[index] = {
      product: prod._id,
      productTitle: prod.title,
      sku: prod.sku || '',
      quantity: 1,
      price: prod.price || 0
    };
    setNewOrder((prev) => ({ ...prev, items: updated }));
  };

  // Create Order Submit
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      // Calculate total
      const total = newOrder.items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);
      const payload = {
        ...newOrder,
        totalAmount: total,
        subtotal: total
      };

      await workspaceService.createOrder(payload);
      setShowAddModal(false);
      // Reset form
      setNewOrder({
        customer: { name: '', email: '', phone: '', address: '', city: '', state: '', postalCode: '' },
        paymentMethod: 'COD',
        items: [{ productTitle: '', sku: '', quantity: 1, price: 0 }],
        notes: ''
      });
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to create order');
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
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

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
                  const isHighRisk = ord.codRiskScore >= 60;
                  const isMedRisk = ord.codRiskScore >= 35 && ord.codRiskScore < 60;
                  const itemCount = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;

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
                          {ord.customer?.name || 'Walk-in Customer'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                          {ord.customer?.phone || ord.customer?.email || 'No contact'}
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
                              {ord.codRiskScore}/100 {isHighRisk ? 'HIGH' : isMedRisk ? 'MED' : 'LOW'}
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
                  <strong>{selectedOrder.customer?.name}</strong> • {selectedOrder.customer?.phone} • {selectedOrder.customer?.email}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {selectedOrder.shippingAddress?.address || selectedOrder.customer?.address},{' '}
                  {selectedOrder.shippingAddress?.city || selectedOrder.customer?.city},{' '}
                  {selectedOrder.shippingAddress?.state || selectedOrder.customer?.state} - {selectedOrder.shippingAddress?.postalCode || selectedOrder.customer?.postalCode}
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
                          <td style={{ padding: '8px 12px' }}>{it.productTitle || 'Product SKU'}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--color-text-faint)' }}>{it.sku || '-'}</td>
                          <td style={{ padding: '8px 12px' }}>{it.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                            <AnimatedRupee value={it.price * it.quantity} />
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
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Manual / In-Store Order</h3>
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
                {/* Customer Details */}
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
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
                      onChange={(e) => setNewOrder({
                        ...newOrder,
                        customer: { ...newOrder.customer, name: e.target.value }
                      })}
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
                      onChange={(e) => setNewOrder({
                        ...newOrder,
                        customer: { ...newOrder.customer, phone: e.target.value }
                      })}
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
                      onChange={(e) => setNewOrder({
                        ...newOrder,
                        customer: { ...newOrder.customer, email: e.target.value }
                      })}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Payment Method *</label>
                    <select
                      className="workspace-select"
                      value={newOrder.paymentMethod}
                      onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
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
                    onChange={(e) => setNewOrder({
                      ...newOrder,
                      customer: { ...newOrder.customer, address: e.target.value }
                    })}
                  />
                </div>

                <div className="form-grid-3">
                  <div className="workspace-form-group">
                    <label className="workspace-label">City *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. Mumbai"
                      value={newOrder.customer.city}
                      onChange={(e) => setNewOrder({
                        ...newOrder,
                        customer: { ...newOrder.customer, city: e.target.value }
                      })}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">State *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. Maharashtra"
                      value={newOrder.customer.state}
                      onChange={(e) => setNewOrder({
                        ...newOrder,
                        customer: { ...newOrder.customer, state: e.target.value }
                      })}
                    />
                  </div>
                  <div className="workspace-form-group">
                    <label className="workspace-label">Postal Code (PIN) *</label>
                    <input
                      type="text"
                      className="workspace-input"
                      required
                      placeholder="e.g. 400001"
                      value={newOrder.customer.postalCode}
                      onChange={(e) => setNewOrder({
                        ...newOrder,
                        customer: { ...newOrder.customer, postalCode: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* Items Selection */}
                <div style={{ marginTop: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    Order Items
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    + Add Item
                  </button>
                </div>

                {newOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 1fr 70px 90px 32px',
                      gap: '8px',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    {products.length > 0 ? (
                      <select
                        className="workspace-select"
                        value={it.product || ''}
                        onChange={(e) => handleSelectProduct(idx, e.target.value)}
                      >
                        <option value="">Select Catalog Product...</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title} (₹{p.price})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="workspace-input"
                        placeholder="Item Title"
                        required
                        value={it.productTitle}
                        onChange={(e) => {
                          const updated = [...newOrder.items];
                          updated[idx].productTitle = e.target.value;
                          setNewOrder({ ...newOrder, items: updated });
                        }}
                      />
                    )}

                    <input
                      type="text"
                      className="workspace-input"
                      placeholder="SKU"
                      value={it.sku}
                      onChange={(e) => {
                        const updated = [...newOrder.items];
                        updated[idx].sku = e.target.value;
                        setNewOrder({ ...newOrder, items: updated });
                      }}
                    />

                    <input
                      type="number"
                      className="workspace-input"
                      placeholder="Qty"
                      min={1}
                      required
                      value={it.quantity}
                      onChange={(e) => {
                        const updated = [...newOrder.items];
                        updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                        setNewOrder({ ...newOrder, items: updated });
                      }}
                    />

                    <input
                      type="number"
                      className="workspace-input"
                      placeholder="Price"
                      min={0}
                      required
                      value={it.price}
                      onChange={(e) => {
                        const updated = [...newOrder.items];
                        updated[idx].price = parseFloat(e.target.value) || 0;
                        setNewOrder({ ...newOrder, items: updated });
                      }}
                    />

                    {newOrder.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="topbar-btn"
                        style={{ width: '32px', height: '32px', color: '#EF4444' }}
                        title="Remove line item"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Place Order
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
