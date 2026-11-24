import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
  AlertTriangle,
  Truck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Package,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import workspaceService from '../../services/workspace.service';
import AnimatedRupee from '../../components/AnimatedRupee';

const OverviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await workspaceService.getOverview();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load overview metrics:', err);
      setError(err.message || 'Could not load store metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleSeedDemo = async (force = false) => {
    try {
      setSeeding(true);
      await workspaceService.seedDemoData({ force });
      await fetchOverview();
    } catch (err) {
      alert(err.message || 'Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <RefreshCw size={32} className="spinning" style={{ margin: '0 auto 16px' }} />
        <p>Loading real-time store telemetry from MongoDB...</p>
      </div>
    );
  }

  const metrics = data?.stats || data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const lowStockCount = metrics.lowStockProductsCount ?? metrics.lowStockProducts ?? lowStockProducts.length;
  const isDemoData = data?.isDemoData || (metrics.totalOrders > 0);

  return (
    <div>
      {/* Page Title & Actions */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <h1>Operational Overview</h1>
          <p>Real-time autonomous telemetry across orders, stock & delivery pipelines</p>
        </div>
        <div className="page-actions-group">
          <button
            onClick={fetchOverview}
            className="btn btn-secondary"
            title="Refresh Store Data"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/app/orders" className="btn btn-primary">
            <Plus size={16} />
            <span>New Order</span>
          </Link>
        </div>
      </div>

      {/* Demo Seeding Banner if empty or if demo data is present */}
      {metrics.totalOrders === 0 ? (
        <div className="demo-banner">
          <div className="demo-banner-left">
            <div className="demo-badge-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
                Store Database is Empty
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Seed realistic Indian D2C orders, COD risks, apparel inventory, and courier tracking data to explore CommercePilot AI.
              </div>
            </div>
          </div>
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="btn btn-primary"
          >
            {seeding ? <RefreshCw size={16} className="spinning" /> : <Sparkles size={16} />}
            <span>{seeding ? 'Generating Store Telemetry...' : 'Seed Realistic Demo Data'}</span>
          </button>
        </div>
      ) : isDemoData ? (
        <div className="demo-banner" style={{ background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div className="demo-banner-left">
            <div className="demo-badge-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                Demo Telemetry Active
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Showing realistic simulated catalog items, COD fraud evaluations and NDR delivery statuses.
              </div>
            </div>
          </div>
          <button
            onClick={() => handleSeedDemo(true)}
            disabled={seeding}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={seeding ? 'spinning' : ''} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      ) : null}

      {/* Key Operational Metric Cards */}
      <div className="metrics-grid">
        {/* Total Orders */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Total Orders</span>
            <div className="metric-icon-wrap orders">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="metric-value">{metrics.totalOrders || 0}</div>
          <div className="metric-meta success">
            <TrendingUp size={12} />
            <span>Active store volume</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Gross Revenue</span>
            <div className="metric-icon-wrap revenue">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="metric-value"><AnimatedRupee value={metrics.totalRevenue || 0} /></div>
          <div className="metric-meta success">
            <span>Aggregated order value</span>
          </div>
        </div>

        {/* COD Orders & Ratio */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">COD Orders</span>
            <div className="metric-icon-wrap cod">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value">{metrics.codOrders || 0}</div>
          <div className="metric-meta warn">
            <span>
              {metrics.totalOrders ? Math.round((metrics.codOrders / metrics.totalOrders) * 100) : 0}% of total volume
            </span>
          </div>
        </div>

        {/* Orders Needing Verification */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Needs Verification</span>
            <div className="metric-icon-wrap verification">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: metrics.ordersNeedingVerification > 0 ? '#EF4444' : 'inherit' }}>
            {metrics.ordersNeedingVerification || 0}
          </div>
          <div className="metric-meta danger">
            <span>High COD fraud/RTO risk</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Low-Stock SKUs</span>
            <div className="metric-icon-wrap stock">
              <Package size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: lowStockCount > 0 ? '#F59E0B' : 'inherit' }}>
            {lowStockCount || 0}
          </div>
          <div className="metric-meta warn">
            <span>Near reorder threshold</span>
          </div>
        </div>

        {/* Failed / At-Risk Deliveries */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Delivery NDR / Failed</span>
            <div className="metric-icon-wrap ndr">
              <Truck size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: metrics.failedDeliveries > 0 ? 'var(--color-danger)' : 'inherit' }}>
            {metrics.failedDeliveries || 0}
          </div>
          <div className="metric-meta danger">
            <span>Actionable recovery required</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders Table & Low Stock Alerts */}
      <div className="overview-grid-2">
        
        {/* Recent Orders Table */}
        <div className="data-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Recent Store Orders
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                Latest orders received across your sales channels
              </p>
            </div>
            <Link to="/app/orders" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                      No orders logged yet. Seed demo data or create a new order.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const isHighRisk = order.codRiskScore >= 60;
                    const isMedRisk = order.codRiskScore >= 35 && order.codRiskScore < 60;
                    return (
                      <tr key={order._id}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {order.orderNumber}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{order.customer?.name || 'Customer'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                            {order.customer?.city || 'India'}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}><AnimatedRupee value={order.totalAmount || 0} /></span>
                        </td>
                        <td>
                          <span className={`status-badge ${order.paymentMethod === 'COD' ? 'badge-warning' : 'badge-info'}`}>
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td>
                          {order.paymentMethod === 'COD' ? (
                            <span className={`risk-indicator ${isHighRisk ? 'high' : isMedRisk ? 'medium' : 'low'}`}>
                              {order.codRiskScore}/100 {isHighRisk ? '⚠️ High' : isMedRisk ? 'Medium' : '✓ Safe'}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>Prepaid Verified</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${
                            order.orderStatus === 'DELIVERED' ? 'badge-success' :
                            order.orderStatus === 'CANCELLED' ? 'badge-danger' :
                            order.orderStatus === 'SHIPPED' ? 'badge-info' : 'badge-purple'
                          }`}>
                            {order.orderStatus}
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

        {/* Low Stock & Stockout Alerts */}
        <div className="data-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Inventory Risk Radar
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
                Products at or below reorder threshold
              </p>
            </div>
            <Link to="/app/inventory" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <span>Manage Stock</span>
            </Link>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', fontWeight: 500 }}>Healthy Inventory Levels</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>All active SKUs have sufficient runway.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lowStockProducts.map((p) => {
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? p.stockQuantity ?? 0;
                  const threshold = p.reorderThreshold || 10;
                  const isCritical = totalStock === 0;

                  return (
                    <div
                      key={p._id}
                      className="radar-risk-item"
                    >
                      <div className="radar-risk-info">
                        <div className="radar-risk-title">
                          {p.title}
                        </div>
                        <div className="radar-risk-meta">
                          <span>SKU: {p.sku || 'N/A'}</span>
                          <span className="dot-sep">•</span>
                          <span>Threshold: {threshold}</span>
                        </div>
                      </div>
                      <div className="radar-risk-badge">
                        <span className={`status-badge ${isCritical ? 'badge-danger' : 'badge-warning'}`}>
                          {isCritical ? 'Stockout (0)' : `${totalStock} units left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewPage;
