import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Percent,
  Truck,
  RefreshCw,
  PieChart as PieIcon,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Info,
  Package,
  Layers,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import workspaceService from '../../services/workspace.service';
import AnimatedRupee from '../../components/AnimatedRupee';

const TIME_RANGES = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: 'all', label: 'All Time' }
];

const COLORS = {
  emerald: '#10B981',
  indigo: '#6366F1',
  violet: '#8B5CF6',
  sky: '#38BDF8',
  amber: '#F59E0B',
  rose: '#EF4444',
  textSecondary: '#94A3B8'
};

const PIE_COLORS = ['#F59E0B', '#10B981', '#38BDF8', '#6366F1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-md)',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
            <span style={{ color: 'var(--color-text-muted)' }}>{entry.name}:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {entry.name.includes('₹') || entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('profit')
                ? `₹${Number(entry.value).toLocaleString('en-IN')}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workspaceService.getAnalytics({ range });
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const {
    dateRange = {},
    kpis = {},
    paymentMix = [],
    revenueTimeline = [],
    deliveryBreakdown = [],
    productPerformance = [],
    inventorySummary = {},
    aiInsights = {},
    hasInsufficientData = false
  } = data || {};

  return (
    <div>
      {/* Page Title & Controls */}
      <div className="page-title-row">
        <div className="page-title-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>Business Intelligence & Analytics</h1>
            <span className="status-badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Groq Grounded AI
            </span>
          </div>
          <p>
            Deterministic sales economics, gross vs net profit margins, and moving-average inventory forecasting
          </p>
        </div>

        {/* Range Selector & Refresh */}
        <div className="page-actions-group">
          <div style={{
            display: 'inline-flex',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}>
            {TIME_RANGES.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setRange(t.key)}
                style={{
                  background: range === t.key ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: range === t.key ? '#A5B4FC' : 'var(--color-text-muted)',
                  border: range === t.key ? '1px solid rgba(99, 102, 241, 0.35)' : 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button onClick={fetchAnalytics} className="btn btn-secondary" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Date Scope & Accuracy Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-6)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
          <Calendar size={14} style={{ color: '#818CF8' }} />
          <span>Active Date Scope: <strong>{dateRange.startDate} to {dateRange.endDate}</strong> ({dateRange.label})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-faint)' }}>
          <Info size={13} />
          <span>Financials strictly distinguish Gross Revenue from Net Realized Profit (after COGS)</span>
        </div>
      </div>

      {/* Insufficient Data Warning Banner */}
      {hasInsufficientData && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#FBBF24',
          fontSize: '13px'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Sparse Historical Data Warning:</strong> This store has fewer than 5 recorded orders in the selected period. Moving-average demand forecasts and cancellation ratios represent initial projections that will refine as transaction history accumulates.
          </div>
        </div>
      )}

      {/* Top 5 KPI Metrics (Distinguishing Revenue from Profit) */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {/* Gross Revenue */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Gross Revenue (GMV)</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34D399' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="metric-value"><AnimatedRupee value={kpis.grossRevenue || 0} /></div>
          <div className="metric-meta success">
            <ArrowUpRight size={13} />
            <span>Total billed orders</span>
          </div>
        </div>

        {/* Net Gross Profit */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Net Gross Profit</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#A5B4FC' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-value"><AnimatedRupee value={kpis.netProfit || 0} /></div>
          <div className="metric-meta success">
            <span>{kpis.grossProfitMargin || 0}% margin (after COGS)</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Average Order Value (AOV)</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8' }}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="metric-value"><AnimatedRupee value={kpis.averageOrderValue || 0} /></div>
          <div className="metric-meta">
            <span>{kpis.totalOrders || 0} valid customer orders</span>
          </div>
        </div>

        {/* Delivery Success Rate */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Courier Delivery Success</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34D399' }}>
              <Truck size={16} />
            </div>
          </div>
          <div className="metric-value">{kpis.deliverySuccessRate || 0}%</div>
          <div className="metric-meta">
            <span>RTO Rate: {kpis.rtoRate || 0}%</span>
          </div>
        </div>

        {/* Order Cancellation Rate */}
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Order Cancellation Rate</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#F87171' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="metric-value">{kpis.cancellationRate || 0}%</div>
          <div className="metric-meta">
            <span>{kpis.cancelledOrders || 0} cancelled orders</span>
          </div>
        </div>
      </div>

      {/* AI Grounded Insights Section */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
                AI Executive Intelligence & Recommendations
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                Synthesized by {aiInsights.generatedBy || 'Groq Llama 3.3'} from verified store records ({dateRange.label})
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
            {aiInsights.disclaimer}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          {/* 1. Daily Sales Summary */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '14px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-success)', marginBottom: '6px' }}>
              <TrendingUp size={14} />
              <span>Sales & Profit Realization</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {aiInsights.salesSummary || 'Awaiting sales data to synthesize summary.'}
            </p>
          </div>

          {/* 2. Inventory Warnings */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '14px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-warning-text)', marginBottom: '6px' }}>
              <Package size={14} />
              <span>Inventory Runways & Alerts</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {aiInsights.inventoryWarnings || 'Inventory stock levels optimal.'}
            </p>
          </div>

          {/* 3. Product Performance Insights */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '14px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
              <BarChart2 size={14} />
              <span>Product Margin Leaders</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {aiInsights.productPerformance || 'Product performance will populate with orders.'}
            </p>
          </div>

          {/* 4. Customer & NDR Patterns */}
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '14px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-info)', marginBottom: '6px' }}>
              <Truck size={14} />
              <span>Customer Payment & Courier Mix</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {aiInsights.customerPatterns || 'Awaiting logistics records.'}
            </p>
          </div>
        </div>

        {/* Operational Recommendation Pill */}
        <div style={{
          marginTop: 'var(--space-4)',
          padding: '12px 14px',
          background: 'var(--color-accent-bg)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-text-primary)'
        }}>
          <Sparkles size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <div>
            <strong>AI Operational Advice:</strong> {aiInsights.operationalRecommendations || 'Keep COD email verification active to minimize RTO loss.'}
          </div>
        </div>
      </div>

      {/* Row of 2 Charts: Revenue vs Net Profit & Orders vs Cancellations */}
      <div className="analytics-grid-2">
        {/* Chart 1: Revenue vs Net Profit Timeline */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Revenue & Net Profit Over Time</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                Distinguishing Gross GMV from Net Margin (after product cost)
              </div>
            </div>
            <TrendingUp size={18} style={{ color: '#10B981' }} />
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {revenueTimeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No transaction data in this time range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="formattedDate" stroke={COLORS.textSecondary} fontSize={10} tickLine={false} />
                  <YAxis stroke={COLORS.textSecondary} fontSize={10} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke={COLORS.emerald} strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke={COLORS.indigo} strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Order Volume & Cancellations */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Orders vs. Cancellations Timeline</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                Daily realized fulfillment vs customer cancellations
              </div>
            </div>
            <BarChart2 size={18} style={{ color: '#818CF8' }} />
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {revenueTimeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No order history recorded in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="formattedDate" stroke={COLORS.textSecondary} fontSize={10} tickLine={false} />
                  <YAxis stroke={COLORS.textSecondary} fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="orders" name="Completed Orders" fill={COLORS.sky} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancellations" name="Cancellations" fill={COLORS.rose} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row of 2 Charts: Payment Mix (COD vs Prepaid) & Courier Logistics NDRs */}
      <div className="analytics-grid-2">
        {/* Chart 3: COD vs Prepaid Payment Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Payment Mix: COD vs Prepaid</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                Cash-on-delivery exposure vs instant online UPI settlement
              </div>
            </div>
            <PieIcon size={18} style={{ color: '#F59E0B' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, gap: '20px' }}>
            {paymentMix.length === 0 || paymentMix.every(p => p.orders === 0) ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No payment records found.</p>
            ) : (
              <>
                <div style={{ width: '50%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMix}
                        dataKey="orders"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {paymentMix.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '45%' }}>
                  {paymentMix.map((pm, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span>{pm.name}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '16px' }}>
                        {pm.orders} orders ({pm.percentage}%) • ₹{(pm.revenue || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart 4: Logistics & Delivery NDR Outcomes */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Logistics & NDR Delivery Breakdown</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                Courier fulfillment and return-to-origin loss metrics
              </div>
            </div>
            <Truck size={18} style={{ color: '#38BDF8' }} />
          </div>

          <div style={{ width: '100%', height: 240 }}>
            {deliveryBreakdown.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '80px 0' }}>
                No delivery events recorded in this period.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryBreakdown} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" stroke={COLORS.textSecondary} fontSize={10} allowDecimals={false} />
                  <YAxis type="category" dataKey="label" stroke={COLORS.textSecondary} fontSize={11} width={130} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Shipments" radius={[0, 4, 4, 0]}>
                    {deliveryBreakdown.map((entry, index) => (
                      <Cell key={`del-cell-${index}`} fill={entry.color || COLORS.indigo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Demand Forecasting & Inventory Runway Table */}
      <div className="data-table-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
              Deterministic Demand Forecasting & Reorder Points
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
              Formula: Days of Stock = Available / Average Daily Demand (ADD) • Reorder Point = (ADD × Lead Time) + Safety Stock
            </div>
          </div>
          <span className="sidebar-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC' }}>
            Moving Average (ADD) Model
          </span>
        </div>

        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product SKU & Title</th>
                <th>Current Stock</th>
                <th>Avg. Daily Demand (ADD)</th>
                <th>Runway (Days of Stock)</th>
                <th>Reorder Point (ROP)</th>
                <th>Replenishment Status</th>
                <th>Suggested Order</th>
                <th>Est. Restock Cost</th>
              </tr>
            </thead>
            <tbody>
              {!inventorySummary.forecasts || inventorySummary.forecasts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No products in catalog to forecast.
                  </td>
                </tr>
              ) : (
                inventorySummary.forecasts.map((f, idx) => {
                  let badgeClass = 'badge-success';
                  let statusText = 'Optimal Stock';

                  if (f.runwayCategory === 'OUT_OF_STOCK') {
                    badgeClass = 'badge-danger';
                    statusText = 'Out of Stock';
                  } else if (f.runwayCategory === 'CRITICAL_RUNWAY') {
                    badgeClass = 'badge-danger';
                    statusText = 'Critical Runway';
                  } else if (f.runwayCategory === 'REORDER_RECOMMENDED') {
                    badgeClass = 'badge-warning';
                    statusText = 'Reorder Needed';
                  } else if (f.runwayCategory === 'SLOW_MOVING') {
                    badgeClass = 'badge-purple';
                    statusText = 'Slow Moving (0 sales)';
                  }

                  return (
                    <tr key={f.productId || idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{f.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>{f.sku} • {f.category}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: f.availableStock <= f.reorderThreshold ? '#EF4444' : 'var(--color-text-primary)' }}>
                          {f.availableStock} units
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                          {f.averageDailyDemand} / day
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 600,
                          color: f.daysOfStock <= f.supplierLeadTime ? '#EF4444' : f.daysOfStock <= 20 ? '#F59E0B' : '#10B981'
                        }}>
                          {f.daysOfStock === 999 ? '90d+' : f.daysOfStock === 0 ? '0 days' : `${f.daysOfStock} days`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                          {f.reorderPoint} units
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${badgeClass}`}>
                          {statusText}
                        </span>
                      </td>
                      <td>
                        {f.suggestedReorderQuantity > 0 ? (
                          <span style={{ fontWeight: 700, color: '#38BDF8' }}>
                            +{f.suggestedReorderQuantity} units
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-faint)', fontSize: '12px' }}>None needed</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                          {f.estimatedReorderCost > 0 ? `₹${f.estimatedReorderCost.toLocaleString('en-IN')}` : '₹0'}
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

      {/* Product Performance & Margins Table */}
      <div className="data-table-card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
              Product Sales Velocity & Gross Margins
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
              Gross Profit = Gross Revenue minus Cost of Goods Sold (COGS)
            </div>
          </div>
          <span className="sidebar-badge">{productPerformance.length} items ranked</span>
        </div>

        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank & Product</th>
                <th>Units Sold</th>
                <th>Gross Revenue (GMV)</th>
                <th>Cost of Goods (COGS)</th>
                <th>Net Gross Profit</th>
                <th>Profit Margin</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No recorded product sales in this time range.
                  </td>
                </tr>
              ) : (
                productPerformance.map((p, index) => (
                  <tr key={p.sku || index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : 'rgba(255, 255, 255, 0.05)',
                          color: index < 3 ? '#000' : 'var(--color-text-muted)',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{p.unitsSold} units</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#10B981' }}><AnimatedRupee value={p.revenue} /></span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}><AnimatedRupee value={p.cogs} /></span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#38BDF8' }}><AnimatedRupee value={p.grossProfit} /></span>
                    </td>
                    <td>
                      <span className={`status-badge ${p.profitMargin >= 50 ? 'badge-success' : p.profitMargin >= 30 ? 'badge-purple' : 'badge-warning'}`}>
                        {p.profitMargin}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
