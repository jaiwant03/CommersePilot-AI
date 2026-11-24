import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Truck, CheckCircle2, AlertTriangle, RefreshCw, Calendar, Clock, MapPin } from 'lucide-react';
import workspaceService from '../../services/workspace.service';

const RescheduleDeliveryPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    preferredDate: 'Tomorrow',
    preferredSlot: '2 PM - 6 PM',
    landmark: '',
    updatedAddress: ''
  });

  useEffect(() => {
    const fetchInfo = async () => {
      if (!token) {
        setError('Missing rescheduling token.');
        setLoading(false);
        return;
      }

      try {
        const res = await workspaceService.getTokenInfo(token);
        setTokenData(res);
      } catch (err) {
        setError(err.message || 'Invalid or expired rescheduling link.');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await workspaceService.rescheduleDeliveryAction({
        token,
        ...formData
      });
      setSuccess(true);
    } catch (err) {
      alert(err.message || 'Failed to submit rescheduling request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        <RefreshCw size={36} className="spinning" style={{ marginBottom: '16px', color: '#38BDF8' }} />
        <p>Verifying delivery recovery link...</p>
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
          {error || 'This delivery rescheduling link has expired or has already been completed.'}
        </p>
        <Link to="/" className="btn btn-secondary">
          Return to Home
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container container-narrow" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#10B981' }}>
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Delivery Reschedule Confirmed!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          Your re-delivery slot for <strong>{formData.preferredDate} ({formData.preferredSlot})</strong> has been registered with {tokenData.delivery?.courier || 'the courier'}. We have alerted the merchant.
        </p>
        <Link to="/" className="btn btn-secondary">
          Return to Store Home
        </Link>
      </div>
    );
  }

  const delivery = tokenData.delivery || {};
  const order = tokenData.order || {};

  return (
    <div className="container container-narrow" style={{ padding: '60px 20px' }}>
      <div className="data-table-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-info-bg)', color: 'var(--color-info)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, marginBottom: '12px', border: '1px solid var(--color-info-border)' }}>
            <Truck size={14} style={{ marginRight: '6px' }} />
            Delivery NDR Recovery
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Reschedule Package Delivery
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            AWB Tracking #{delivery.awb} • {delivery.courier}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="workspace-form-group">
              <label className="workspace-label">Preferred Date</label>
              <select
                className="workspace-select"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              >
                <option value="Tomorrow">Tomorrow</option>
                <option value="Day After Tomorrow">Day After Tomorrow</option>
                <option value="This Weekend">This Coming Weekend</option>
              </select>
            </div>

            <div className="workspace-form-group">
              <label className="workspace-label">Preferred Time Slot</label>
              <select
                className="workspace-select"
                value={formData.preferredSlot}
                onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
              >
                <option value="10 AM - 1 PM">Morning (10 AM - 1 PM)</option>
                <option value="2 PM - 6 PM">Afternoon (2 PM - 6 PM)</option>
                <option value="6 PM - 8 PM">Evening (6 PM - 8 PM)</option>
              </select>
            </div>
          </div>

          <div className="workspace-form-group">
            <label className="workspace-label">Prominent Landmark / Drop Instructions</label>
            <input
              type="text"
              className="workspace-input"
              placeholder="e.g. Opposite City Mall, leave with 4th floor security guard"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
            />
            <span className="workspace-help">Helps the courier rider locate your doorstep faster.</span>
          </div>

          <div className="workspace-form-group">
            <label className="workspace-label">Address Correction (Optional)</label>
            <input
              type="text"
              className="workspace-input"
              placeholder="Update house # or street if previously incomplete"
              value={formData.updatedAddress}
              onChange={(e) => setFormData({ ...formData, updatedAddress: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '12px' }}
          >
            {submitting ? <RefreshCw size={16} className="spinning" /> : <Calendar size={16} />}
            <span>Confirm Re-delivery Preferences</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RescheduleDeliveryPage;
