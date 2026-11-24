import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle, RefreshCw, ShoppingBag } from 'lucide-react';
import workspaceService from '../../services/workspace.service';

const VerifyOrderPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      if (!token) {
        setError('Missing confirmation token.');
        setLoading(false);
        return;
      }

      try {
        const res = await workspaceService.getTokenInfo(token);
        setTokenData(res);
      } catch (err) {
        setError(err.message || 'Invalid or expired confirmation link.');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  const handleAction = async (action) => {
    try {
      setSubmitting(true);
      const res = await workspaceService.confirmOrderAction(token, action);
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
        <RefreshCw size={36} className="spinning" style={{ marginBottom: '16px', color: '#6366F1' }} />
        <p>Verifying secure order confirmation link...</p>
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
          Link Expired or Invalid
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          {error || 'This order verification link is no longer valid or has already been used.'}
        </p>
        <Link to="/" className="btn btn-secondary">
          Return to CommercePilot Home
        </Link>
      </div>
    );
  }

  if (actionResult) {
    const isCancelled = actionResult.orderStatus === 'CANCELLED';
    return (
      <div className="container container-narrow" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: isCancelled ? '#EF4444' : '#10B981'
        }}>
          {isCancelled ? <XCircle size={36} /> : <CheckCircle2 size={36} />}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          {isCancelled ? 'Order Cancellation Confirmed' : 'Order Successfully Verified!'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          {actionResult.message}
        </p>
        <Link to="/" className="btn btn-secondary">
          Return to Store Home
        </Link>
      </div>
    );
  }

  const order = tokenData.order || {};
  const customer = order.customer || {};

  return (
    <div className="container container-narrow" style={{ padding: '60px 20px' }}>
      <div className="data-table-card" style={{ maxWidth: '580px', margin: '0 auto', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-accent-bg)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', border: '1px solid var(--border-accent)' }}>
            <ShieldCheck size={14} style={{ marginRight: '6px' }} />
            Secure COD Verification
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Confirm Order #{order.orderNumber}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Store: <strong>{tokenData.storeName}</strong>
          </p>
        </div>

        {/* Order Details Card */}
        <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Buyer Name:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{customer.fullName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Payment Mode:</span>
            <span className="status-badge badge-warning">{order.paymentMethod || 'COD'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '10px' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Total Due at Delivery:</span>
            <strong style={{ color: 'var(--color-success)', fontSize: '17px' }}>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Destination Address */}
        <div style={{ background: 'var(--color-bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '4px' }}>Delivery Address:</strong>
          {customer.address?.street}, {customer.address?.city}, {customer.address?.state} - {customer.address?.pincode}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => handleAction('confirm')}
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {submitting ? <RefreshCw size={16} className="spinning" /> : <CheckCircle2 size={16} />}
            <span>Yes, Confirm My Order</span>
          </button>

          <button
            onClick={() => handleAction('cancel')}
            disabled={submitting}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px', color: 'var(--color-danger)' }}
          >
            <XCircle size={15} />
            <span>Cancel This Order</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--color-text-faint)' }}>
          Secure, expiring confirmation link powered by CommercePilot AI.
        </div>
      </div>
    </div>
  );
};

export default VerifyOrderPage;
