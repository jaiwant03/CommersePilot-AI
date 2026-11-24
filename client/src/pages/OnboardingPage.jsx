import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Store, 
  Layers, 
  ShoppingBag, 
  CreditCard, 
  Boxes, 
  CheckCircle2,
  Truck,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, store, updateStore, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State initialized from user & store
  const [formData, setFormData] = useState({
    businessName: store?.name || '',
    city: store?.details?.city || 'Mumbai',
    state: store?.details?.state || 'Maharashtra',
    supportEmail: store?.details?.supportEmail || user?.email || '',
    supportPhone: store?.details?.supportPhone || user?.phoneNumber || '',
    category: store?.category || 'Fashion & Apparel',
    channel: store?.channel || 'Shopify',
    paymentMethods: store?.paymentMethods || ['cod', 'prepaid'],
    lowStockThreshold: store?.inventoryPreferences?.lowStockAlertThreshold || 10,
    autoReorder: store?.inventoryPreferences?.autoReorderEnabled ?? true,
    syncFrequency: store?.inventoryPreferences?.syncFrequency || 'realtime',
    alertChannel: store?.inventoryPreferences?.restockAlertChannel || 'both'
  });

  // Load latest state from server on mount
  useEffect(() => {
    const fetchState = async () => {
      try {
        const data = await authService.getOnboardingState();
        if (data?.store) {
          updateStore(data.store);
          setFormData((prev) => ({
            ...prev,
            businessName: data.store.name || prev.businessName,
            city: data.store.details?.city || prev.city,
            state: data.store.details?.state || prev.state,
            category: data.store.category || prev.category,
            channel: data.store.channel || prev.channel,
            paymentMethods: data.store.paymentMethods?.length ? data.store.paymentMethods : prev.paymentMethods,
            lowStockThreshold: data.store.inventoryPreferences?.lowStockAlertThreshold || prev.lowStockThreshold
          }));
          if (data.store.onboardingStep && data.store.onboardingStep > 1 && data.store.onboardingStep <= 7) {
            setCurrentStep(data.store.onboardingStep);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch onboarding state:', err.message);
      }
    };
    fetchState();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      // Save progress to server
      const nextStep = Math.min(currentStep + 1, 7);
      await authService.updateOnboardingStep({
        step: nextStep,
        details: {
          city: formData.city,
          state: formData.state,
          supportEmail: formData.supportEmail,
          supportPhone: formData.supportPhone
        },
        category: formData.category,
        channel: formData.channel,
        paymentMethods: formData.paymentMethods,
        inventoryPreferences: {
          lowStockAlertThreshold: Number(formData.lowStockThreshold),
          autoReorderEnabled: formData.autoReorder,
          syncFrequency: formData.syncFrequency,
          restockAlertChannel: formData.alertChannel
        }
      });

      setCurrentStep(nextStep);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save step progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteSetup = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      await authService.completeOnboarding();
      await refreshUser();
      navigate('/app/overview', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Unable to complete setup.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Fashion & Apparel',
    'Cosmetics & Skincare',
    'Jewelry & Accessories',
    'Health & Wellness',
    'Home Decor & Living',
    'Electronics & Gadgets',
    'Food & Specialty Beverage',
    'Other D2C'
  ];

  const channels = [
    {
      id: 'Shopify',
      title: 'Shopify',
      desc: 'Seamless 1-click webhook synchronization for orders, inventory, and customer details.'
    },
    {
      id: 'WooCommerce',
      title: 'WooCommerce',
      desc: 'Connect via REST API and live webhooks for real-time order status tracking.'
    },
    {
      id: 'Instagram / Social Commerce',
      title: 'Instagram & Social Commerce',
      desc: 'Conversational order capture, automated DM verification, and payment link flows.'
    },
    {
      id: 'Custom Webhook / Multi-Channel',
      title: 'Custom API / ERP',
      desc: 'Flexible JSON webhooks compatible with custom Next.js storefronts or ERPs.'
    }
  ];

  return (
    <div className="onboarding-page">
      <div className="auth-glow" aria-hidden="true"></div>

      <div className="container onboarding-shell">
        {/* Stepper Progress Bar */}
        <div className="stepper-header">
          <div className="stepper-progress-bar">
            <div 
              className="stepper-progress-fill" 
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>

          <div className="stepper-indicators">
            {['Welcome', 'Details', 'Category', 'Channel', 'Payments', 'Inventory', 'Launch'].map((lbl, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              return (
                <div 
                  key={stepNum} 
                  className={`step-indicator-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-circle">
                    {isCompleted ? <Check size={14} /> : stepNum}
                  </div>
                  <span className="step-label">{lbl}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="auth-alert-error" style={{ marginBottom: '20px' }}>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Welcome Screen */}
        {currentStep === 1 && (
          <div className="onboarding-card">
            <div className="onboarding-step-header" style={{ textAlign: 'center' }}>
              <div className="step-badge">
                <Sparkles size={12} />
                <span>Step 1 of 7 • Getting Started</span>
              </div>
              <h1 className="onboarding-step-title">
                Welcome to CommercePilot AI, {user?.fullName?.split(' ')[0] || 'Merchant'}!
              </h1>
              <p className="onboarding-step-desc" style={{ maxWidth: '620px', margin: '0 auto' }}>
                Your autonomous operations platform is ready for calibration. In the next 2 minutes, 
                we'll configure your store's COD risk rules, inventory thresholds, and courier recovery preferences.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '32px 0' }}>
              <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: 'var(--shadow-xs)' }}>
                <ShieldCheck size={28} style={{ color: 'var(--color-primary)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-primary)' }}>COD Shield</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Automated email verification link & address checks before dispatch.</p>
              </div>

              <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: 'var(--shadow-xs)' }}>
                <Boxes size={28} style={{ color: 'var(--color-info)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-primary)' }}>Stockout Radar</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Real-time SKU velocity tracking and supplier restock alerts.</p>
              </div>

              <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: 'var(--shadow-xs)' }}>
                <Truck size={28} style={{ color: 'var(--color-success)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '14px', marginBottom: '4px', color: 'var(--color-text-primary)' }}>NDR Recovery</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Instant customer email rescheduling for undelivered parcels.</p>
              </div>
            </div>

            <div className="onboarding-actions" style={{ justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-lg" 
                onClick={handleNext}
                disabled={loading}
              >
                Start Store Configuration
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Enter Business Details */}
        {currentStep === 2 && (
          <div className="onboarding-card">
            <div className="onboarding-step-header">
              <div className="step-badge">Step 2 of 7 • Business Location & Support</div>
              <h1 className="onboarding-step-title">Enter Business Details</h1>
              <p className="onboarding-step-desc">
                Provide operational location details used for courier SLA calculations and buyer communications.
              </p>
            </div>

            <div className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="businessName">Store / Brand Legal Name</label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  className="form-input"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">Operating City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Surat, Mumbai, Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="state">State / Province</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maharashtra, Gujarat"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="supportEmail">Customer Support Email</label>
                  <input
                    id="supportEmail"
                    name="supportEmail"
                    type="email"
                    className="form-input"
                    placeholder="support@yourbrand.com"
                    value={formData.supportEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="supportPhone">Customer Support Phone Number</label>
                  <input
                    id="supportPhone"
                    name="supportPhone"
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.supportPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Business Category */}
        {currentStep === 3 && (
          <div className="onboarding-card">
            <div className="onboarding-step-header">
              <div className="step-badge">Step 3 of 7 • Category Modeling</div>
              <h1 className="onboarding-step-title">Select Business Category</h1>
              <p className="onboarding-step-desc">
                Helps our neural models calibrate baseline RTO risk and return reasons for your specific industry.
              </p>
            </div>

            <div className="category-chips-grid">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`category-chip ${formData.category === cat ? 'selected' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                >
                  <Layers size={16} />
                  <span>{cat}</span>
                </div>
              ))}
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Select Ecommerce Channel */}
        {currentStep === 4 && (
          <div className="onboarding-card">
            <div className="onboarding-step-header">
              <div className="step-badge">Step 4 of 7 • Storefront Connectivity</div>
              <h1 className="onboarding-step-title">Select Primary Ecommerce Channel</h1>
              <p className="onboarding-step-desc">
                Choose the primary channel where customer orders are placed. You can add more channels later.
              </p>
            </div>

            <div className="selector-grid">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className={`selection-card ${formData.channel === ch.id ? 'selected' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, channel: ch.id }))}
                >
                  <div className="selection-card-header">
                    <div className="selection-icon">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="selection-check">
                      <Check size={12} />
                    </div>
                  </div>
                  <h3 className="selection-title">{ch.title}</h3>
                  <p className="selection-desc">{ch.desc}</p>
                </div>
              ))}
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Select Payment Methods */}
        {currentStep === 5 && (
          <div className="onboarding-card">
            <div className="onboarding-step-header">
              <div className="step-badge">Step 5 of 7 • Payment Orchestration</div>
              <h1 className="onboarding-step-title">Select Supported Payment Methods</h1>
              <p className="onboarding-step-desc">
                CommercePilot AI activates custom verification rules depending on whether you accept Cash on Delivery.
              </p>
            </div>

            <div className="selector-grid">
              <div
                className={`selection-card ${formData.paymentMethods.includes('cod') && formData.paymentMethods.includes('prepaid') ? 'selected' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, paymentMethods: ['cod', 'prepaid'] }))}
              >
                <div className="selection-card-header">
                  <div className="selection-icon">
                    <Zap size={20} />
                  </div>
                  <div className="selection-check">
                    <Check size={12} />
                  </div>
                </div>
                <h3 className="selection-title">Both COD & Prepaid (Recommended)</h3>
                <p className="selection-desc">
                  Full autopilot protection. Evaluates COD risk, sends automated email confirmation links, and offers UPI conversion incentives.
                </p>
              </div>

              <div
                className={`selection-card ${formData.paymentMethods.includes('cod') && !formData.paymentMethods.includes('prepaid') ? 'selected' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, paymentMethods: ['cod'] }))}
              >
                <div className="selection-card-header">
                  <div className="selection-icon">
                    <Truck size={20} />
                  </div>
                  <div className="selection-check">
                    <Check size={12} />
                  </div>
                </div>
                <h3 className="selection-title">Cash on Delivery (COD) Only</h3>
                <p className="selection-desc">
                  Focused strictly on RTO reduction, phone OTP verification, and doorstep delivery success.
                </p>
              </div>

              <div
                className={`selection-card ${!formData.paymentMethods.includes('cod') && formData.paymentMethods.includes('prepaid') ? 'selected' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, paymentMethods: ['prepaid'] }))}
              >
                <div className="selection-card-header">
                  <div className="selection-icon">
                    <CreditCard size={20} />
                  </div>
                  <div className="selection-check">
                    <Check size={12} />
                  </div>
                </div>
                <h3 className="selection-title">Prepaid Only (UPI, Cards, NetBanking)</h3>
                <p className="selection-desc">
                  Zero RTO risk. Focuses on predictive stockout prevention, automated tracking, and instant NDR recovery.
                </p>
              </div>
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Initial Inventory Preferences */}
        {currentStep === 6 && (
          <div className="onboarding-card">
            <div className="onboarding-step-header">
              <div className="step-badge">Step 6 of 7 • Inventory Rules</div>
              <h1 className="onboarding-step-title">Enter Initial Inventory Preferences</h1>
              <p className="onboarding-step-desc">
                Set thresholds for when CommercePilot AI alerts your team or drafts purchase orders to suppliers.
              </p>
            </div>

            <div className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="lowStockThreshold">
                  Low Stock Alert Threshold (Units)
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formData.lowStockThreshold} units</span>
                </label>
                <input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="range"
                  min="2"
                  max="50"
                  className="form-input"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  style={{ cursor: 'pointer', padding: '8px 0' }}
                />
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Trigger warnings when an SKU variant drops below {formData.lowStockThreshold} units.
                </span>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="syncFrequency">Inventory Sync Frequency</label>
                  <select
                    id="syncFrequency"
                    name="syncFrequency"
                    className="form-select"
                    value={formData.syncFrequency}
                    onChange={handleChange}
                  >
                    <option value="realtime">Real-time (Instant Webhooks)</option>
                    <option value="hourly">Hourly Polling</option>
                    <option value="daily">Daily Reconciliation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="alertChannel">Restock Notification Channel</label>
                  <select
                    id="alertChannel"
                    name="alertChannel"
                    className="form-select"
                    value={formData.alertChannel}
                    onChange={handleChange}
                  >
                    <option value="email">Verified Email Alert (Recommended)</option>
                  </select>
                </div>
              </div>

              <label className="form-checkbox-row" style={{ marginTop: '8px' }}>
                <input
                  type="checkbox"
                  name="autoReorder"
                  className="form-checkbox"
                  checked={formData.autoReorder}
                  onChange={handleChange}
                />
                <span>Auto-draft supplier purchase orders when projected runway is under 48 hours</span>
              </label>
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
                Review Setup <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Finish Setup */}
        {currentStep === 7 && (
          <div className="onboarding-card">
            <div className="onboarding-step-header" style={{ textAlign: 'center' }}>
              <div className="step-badge">
                <CheckCircle2 size={12} />
                <span>Step 7 of 7 • Configuration Ready</span>
              </div>
              <h1 className="onboarding-step-title">Review & Finish Setup</h1>
              <p className="onboarding-step-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
                Review your autonomous store operational profile below. Click launch to activate your store autopilot.
              </p>
            </div>

            <div className="summary-review-grid">
              <div className="summary-item">
                <span className="summary-label">Store / Brand Name</span>
                <span className="summary-value">{formData.businessName || store?.name || 'Your Store'}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Location</span>
                <span className="summary-value">{formData.city}, {formData.state}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Category</span>
                <span className="summary-value">{formData.category}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Primary Channel</span>
                <span className="summary-value">{formData.channel}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Payment Modes</span>
                <span className="summary-value">
                  {formData.paymentMethods.join(', ').toUpperCase()}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Low Stock Threshold</span>
                <span className="summary-value">&lt; {formData.lowStockThreshold} units ({formData.syncFrequency})</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>All 7 operational checks validated • Ready for autopilot activation</span>
              </div>
            </div>

            <div className="onboarding-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-outline" onClick={handleBack} disabled={loading}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-lg" 
                onClick={handleCompleteSetup}
                disabled={loading}
              >
                {loading ? 'Activating Autopilot...' : 'Finish Setup & Launch CommercePilot'}
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
