import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Clock,
  MapPin,
  X,
  PlayCircle,
  Package,
  MessageSquare
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';

const DELIVERY_STATUSES = ['ALL', 'PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RTO'];

const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [whatsAppPreview, setWhatsAppPreview] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);

  // Simulation Event Form
  const [eventForm, setEventForm] = useState({
    eventType: 'OUT_FOR_DELIVERY',
    status: 'OUT_FOR_DELIVERY',
    location: 'Mumbai Hub',
    description: 'Package out for delivery with courier rider',
    failureReason: ''
  });

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await workspaceService.getDeliveries(params);
      setDeliveries(res.data?.deliveries || []);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDeliveries();
  };

  // Open Event Simulation Modal
  const handleOpenSimulate = (del) => {
    setSelectedDelivery(del);
    setEventForm({
      eventType: 'OUT_FOR_DELIVERY',
      status: 'OUT_FOR_DELIVERY',
      location: `${del.shippingAddress?.city || 'Local'} Distribution Center`,
      description: 'Shipment out for delivery with local partner',
      failureReason: ''
    });
    setShowSimulateModal(true);
  };

  // Open WhatsApp NDR Recovery Modal
  const handleOpenWhatsAppModal = async (del) => {
    setSelectedDelivery(del);
    try {
      const res = await workspaceService.getWhatsAppPreview(del._id);
      setWhatsAppPreview(res.preview);
    } catch (err) {
      setWhatsAppPreview({
        orderNumber: del.order?.orderNumber || 'TT10245',
        customerName: del.customer?.name || del.shippingAddress?.name || 'Customer',
        recipientPhone: del.customer?.phone || '+91 98765 43210',
        message: `Hello! Your Trendy Threads order ${del.order?.orderNumber || 'TT10245'} could not be delivered because you were unavailable. Would you like us to arrange another delivery attempt? Reply YES to request redelivery or contact our support team.`,
        isDemoSimulation: true
      });
    }
    setShowWhatsAppModal(true);
  };

  const handleSimulateReply = async (reply) => {
    if (!selectedDelivery) return;
    try {
      setReplyLoading(true);
      await workspaceService.simulateWhatsAppReply(selectedDelivery._id, reply);
      setShowWhatsAppModal(false);
      await fetchDeliveries();
    } catch (err) {
      alert(err.message || 'Failed to process WhatsApp reply simulation');
    } finally {
      setReplyLoading(false);
    }
  };

  // When eventType changes in simulation modal, auto-populate status and default note
  const handleEventTypeChange = (type) => {
    let newStatus = type;
    let desc = '';
    let reason = '';

    if (type === 'OUT_FOR_DELIVERY') {
      newStatus = 'OUT_FOR_DELIVERY';
      desc = 'Out for delivery today to recipient address.';
    } else if (type === 'DELIVERED') {
      newStatus = 'DELIVERED';
      desc = 'Package delivered successfully to recipient with OTP confirmation.';
    } else if (type === 'FAILED') {
      newStatus = 'FAILED';
      reason = 'CUSTOMER_UNAVAILABLE';
      desc = 'Delivery attempt failed: Customer premises locked or phone unreachable.';
    } else if (type === 'REATTEMPT') {
      newStatus = 'OUT_FOR_DELIVERY';
      desc = 'NDR resolved via automated customer email response. Re-attempt scheduled.';
    } else if (type === 'RTO') {
      newStatus = 'RTO';
      reason = 'CUSTOMER_REFUSED';
      desc = 'Return to Origin initiated after multiple failed delivery attempts.';
    }

    setEventForm((prev) => ({
      ...prev,
      eventType: type,
      status: newStatus,
      description: desc,
      failureReason: reason
    }));
  };

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;

    try {
      await workspaceService.simulateDeliveryEvent(selectedDelivery._id, eventForm);
      setShowSimulateModal(false);
      await fetchDeliveries();
    } catch (err) {
      alert(err.message || 'Simulation event failed');
    }
  };

  return (
    <div>
      {/* Title & Actions */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <h1>Delivery Failure Recovery (NDR)</h1>
          <p>Real-time courier telemetry, NDR resolution workflows & simulated logistics events</p>
        </div>
        <div className="page-actions-group">
          <button onClick={fetchDeliveries} className="btn btn-secondary">
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
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
            placeholder="Search by tracking #, order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="filter-pills-row">
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-faint)', marginRight: '4px' }}>
            STATUS:
          </span>
          {DELIVERY_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Data Table */}
      <div className="data-table-card">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking # / AWB</th>
                <th>Order Ref</th>
                <th>Customer & Destination</th>
                <th>Courier Partner</th>
                <th>Dispatch Date</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>NDR Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px' }} />
                    <p>Loading logistics pipeline...</p>
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                    <Truck size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>No delivery records matching status "{statusFilter}".</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', marginTop: '4px' }}>
                      Deliveries are automatically generated when orders are dispatched or demo data is seeded.
                    </p>
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => {
                  const isFailed = del.status === 'FAILED';
                  const isRTO = del.status === 'RTO';
                  const isDelivered = del.status === 'DELIVERED';
                  const isOut = del.status === 'OUT_FOR_DELIVERY';

                  return (
                    <tr key={del._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {del.trackingNumber || 'UNASSIGNED'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                          {del.courier || 'Delhivery Surface'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          {del.order?.orderNumber || 'ORD-REF'}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                          ₹{del.order?.totalAmount?.toLocaleString('en-IN')} ({del.order?.paymentMethod})
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {del.customer?.name || del.shippingAddress?.name || 'Customer'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                          {del.shippingAddress?.city || 'City'}, {del.shippingAddress?.postalCode || 'PIN'}
                        </div>
                      </td>
                      <td>
                        <span className="status-badge badge-gray">
                          {del.courier || 'Standard Courier'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {del.dispatchDate ? new Date(del.dispatchDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          }) : 'Awaiting'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: del.deliveryAttempts > 1 ? '#EF4444' : 'inherit' }}>
                          {del.deliveryAttempts || 1} / 3
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          isDelivered ? 'badge-success' :
                          isRTO ? 'badge-danger' :
                          isFailed ? 'badge-warning' :
                          isOut ? 'badge-info' : 'badge-purple'
                        }`}>
                          {del.status}
                        </span>
                        {isFailed && (
                          <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '2px', fontWeight: 600 }}>
                            NDR Alert
                          </div>
                        )}
                        {isRTO && (
                          <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px' }}>
                            ✓ Auto-Restocked
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isFailed && (
                            <button
                              onClick={() => handleOpenWhatsAppModal(del)}
                              className="btn"
                              style={{ padding: '6px 10px', fontSize: '11px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600 }}
                              title="Open WhatsApp NDR Recovery Flow"
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp Recovery</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenSimulate(del)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            title="Simulate Real-World Courier Event"
                          >
                            <PlayCircle size={13} style={{ color: '#818CF8' }} />
                            <span>Simulate Event</span>
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

      {/* Modal: Simulate Delivery Event */}
      {showSimulateModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowSimulateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Simulate Courier Logistics Event</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                  Tracking #{selectedDelivery.trackingNumber} • {selectedDelivery.order?.orderNumber}
                </span>
              </div>
              <button className="topbar-btn" onClick={() => setShowSimulateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit}>
              <div className="modal-body">
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#A5B4FC' }}>
                    <strong>Interactive Courier Simulator:</strong> Test how CommercePilot AI reacts to real courier scan events like Non-Delivery Reports (NDR) or RTO return restocks.
                  </div>
                </div>

                <div className="workspace-form-group">
                  <label className="workspace-label">Event to Simulate</label>
                  <select
                    className="workspace-select"
                    value={eventForm.eventType}
                    onChange={(e) => handleEventTypeChange(e.target.value)}
                  >
                    <option value="OUT_FOR_DELIVERY">Out for Delivery (Rider Dispatched)</option>
                    <option value="DELIVERED">Delivered Successfully (Delivered to Customer)</option>
                    <option value="FAILED">Delivery Attempt Failed (NDR Triggered)</option>
                    <option value="REATTEMPT">NDR Re-attempt Scheduled (Automated Recovery)</option>
                    <option value="RTO">Return to Origin / RTO (Auto-Restock Products)</option>
                  </select>
                </div>

                {eventForm.eventType === 'FAILED' && (
                  <div className="workspace-form-group">
                    <label className="workspace-label">NDR Failure Reason</label>
                    <select
                      className="workspace-select"
                      value={eventForm.failureReason}
                      onChange={(e) => setEventForm({ ...eventForm, failureReason: e.target.value })}
                    >
                      <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable / Phone Unreachable</option>
                      <option value="INCORRECT_ADDRESS">Address Incomplete or Landmark Missing</option>
                      <option value="CUSTOMER_POSTPONED">Customer Requested Future Delivery Date</option>
                      <option value="COD_AMOUNT_UNREADY">COD Cash Not Available with Customer</option>
                      <option value="CUSTOMER_REFUSED">Customer Refused Delivery / Rejected</option>
                    </select>
                  </div>
                )}

                <div className="workspace-form-group">
                  <label className="workspace-label">Hub / Scan Location</label>
                  <input
                    type="text"
                    className="workspace-input"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                </div>

                <div className="workspace-form-group">
                  <label className="workspace-label">Status Description / Log Entry</label>
                  <input
                    type="text"
                    className="workspace-input"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>

                {eventForm.eventType === 'RTO' && (
                  <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: '#34D399' }}>
                    💡 <strong>Smart Restock:</strong> Recording RTO will automatically return the order items to inventory and log an <code>InventoryMovement</code> record.
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowSimulateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit Logistics Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: WhatsApp NDR Delivery Recovery */}
      {showWhatsAppModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={18} style={{ color: '#059669' }} />
                    WhatsApp NDR Delivery Recovery
                  </h3>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#D97706', fontWeight: 700, border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                    DEMO SIMULATION MODE
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                  Recipient: {whatsAppPreview?.customerName || 'Customer'} ({whatsAppPreview?.recipientPhone || '+91 98765 43210'}) • Order {whatsAppPreview?.orderNumber || selectedDelivery.order?.orderNumber}
                </span>
              </div>
              <button className="topbar-btn" onClick={() => setShowWhatsAppModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ background: 'rgba(5, 150, 105, 0.05)', border: '1px solid rgba(5, 150, 105, 0.2)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Automated Outbound Recovery Message
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', fontSize: '13.5px', color: '#1E293B', lineHeight: 1.55, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {whatsAppPreview?.message || `Hello! Your Trendy Threads order ${selectedDelivery.order?.orderNumber || 'TT10245'} could not be delivered because you were unavailable. Would you like us to arrange another delivery attempt? Reply YES to request redelivery or contact our support team.`}
                </div>
              </div>

              <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Interactive Reply Simulation:
                </div>
                In live production, customer responses over WhatsApp Business API trigger instant webhook workflows. In this demonstration, you can simulate customer replies directly:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  disabled={replyLoading}
                  onClick={() => handleSimulateReply('YES')}
                  className="btn"
                  style={{ background: '#059669', color: '#FFFFFF', padding: '10px 14px', fontWeight: 600, fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <CheckCircle size={15} />
                  <span>Simulate: Customer Replies "YES"</span>
                </button>

                <button
                  type="button"
                  disabled={replyLoading}
                  onClick={() => handleSimulateReply('NO')}
                  className="btn"
                  style={{ background: '#DC2626', color: '#FFFFFF', padding: '10px 14px', fontWeight: 600, fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <X size={15} />
                  <span>Simulate: Customer Replies "NO"</span>
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowWhatsAppModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
