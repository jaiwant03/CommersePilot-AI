import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Package, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import workspaceService from '../../services/workspace.service';
import AnimatedRupee from '../../components/AnimatedRupee';

const ApprovePoPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const actionParam = searchParams.get('action');

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      if (!token) {
        setError('Missing purchase order approval token.');
        setLoading(false);
        return;
      }

      try {
        const res = await workspaceService.getTokenInfo(token);
        setTokenData(res);
      } catch (err) {
        setError(err.message || 'Invalid or expired approval link.');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  const handleAction = async (action) => {
    try {
      setSubmitting(true);
      const res = await workspaceService.approvePoAction(token, action);
      setActionResult(res);
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        <RefreshCw size={36} className="spinning" style={{ marginBottom: '16px', color: '#10B981' }} />
        <p>Loading Purchase Order approval review...</p>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="container container-narrow" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#EF4444' }}>
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Approval Link Expired or Already Processed
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          {error || 'This supplier purchase order has already been processed or the link has expired.'}
        </p>
        <Link to="/app/inventory" className="btn btn-secondary">
          Go to Inventory Workspace
        </Link>
      </div>
    );
  }

  if (actionResult) {
    const isApproved = actionResult.action === 'APPROVED';
    return (
      <div className="container container-narrow" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: isApproved ? '#10B981' : '#EF4444'
        }}>
          {isApproved ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          {isApproved ? 'Purchase Order Approved & Dispatched!' : 'Purchase Order Rejected'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          {actionResult.message}
        </p>
        <Link to="/app/inventory" className="btn btn-primary">
          Back to Inventory Workspace
        </Link>
      </div>
    );
  }

  const po = tokenData.purchaseOrder || {};

  return (
    <div className="container container-narrow" style={{ padding: '60px 20px' }}>
      <div className="data-table-card" style={{ maxWidth: '640px', margin: '0 auto', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', border: '1px solid var(--color-warning-border)' }}>
            <Package size={14} style={{ marginRight: '6px' }} />
            Merchant Purchase Order Approval
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Review PO #{po.poNumber}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Supplier: <strong>{po.supplierName}</strong> ({po.supplierEmail})
          </p>
        </div>

        {/* PO Items Table */}
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '24px' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: 'var(--color-text-muted)' }}>Item Title & SKU</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Reorder Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {po.items?.map((it, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{it.title}</div>
                    <code style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>{it.sku}</code>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    +{it.reorderQuantity} units
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    ₹{it.estimatedCost?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--border-subtle)', background: 'var(--color-bg-secondary)' }}>
                <td colSpan={2} style={{ padding: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Total Estimated COGS</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-success)', fontSize: '15px' }}>
                  ₹{(po.totalEstimatedCost || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleAction('approve')}
            disabled={submitting}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
          >
            {submitting ? <RefreshCw size={16} className="spinning" /> : <Send size={16} />}
            <span>Approve & Email Supplier</span>
          </button>

          <button
            onClick={() => handleAction('reject')}
            disabled={submitting}
            className="btn btn-secondary"
            style={{ padding: '12px 20px', color: 'var(--color-danger)' }}
          >
            <XCircle size={16} />
            <span>Reject PO</span>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '20px' }}>
          Security Gate: The manufacturer will not receive an order until you click "Approve".
        </p>
      </div>
    </div>
  );
};

export default ApprovePoPage;
