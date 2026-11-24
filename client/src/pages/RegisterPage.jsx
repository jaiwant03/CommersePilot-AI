import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Building,
  Store,
  Globe,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    businessName: '',
    businessType: 'D2C Brand',
    country: 'India',
    phoneNumber: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        businessType: formData.businessType,
        country: formData.country,
        phoneNumber: formData.phoneNumber
      });

      // After successful registration, navigate directly into the operational workspace
      navigate('/app/overview', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    'D2C Brand',
    'Instagram / Social Seller',
    'Shopify Merchant',
    'WooCommerce Store',
    'Independent Fashion & Cosmetics',
    'Retailer / Wholesaler',
    'Other'
  ];

  return (
    <div className="auth-container">
      <div className="auth-glow" aria-hidden="true"></div>

      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={13} />
            <span>CommercePilot AI Merchant Onboarding</span>
          </div>
          <h1 className="auth-title">Create Your Seller Account</h1>
          <p className="auth-subtitle">
            Put your order fulfillment, COD verification, and inventory on autopilot.
          </p>
        </div>

        {errorMessage && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name & Business Email */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name *</label>
              <div className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-input"
                  placeholder="Aarav Sharma"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Business Email *</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="aarav@yourbrand.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Business Name & Business Type */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="businessName">Business / Brand Name *</label>
              <div className="auth-input-wrap">
                <Building size={16} className="auth-input-icon" />
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  className="form-input"
                  placeholder="Luxe Chic Apparel"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="businessType">Business Type *</label>
              <div className="auth-input-wrap">
                <Store size={16} className="auth-input-icon" />
                <select
                  id="businessType"
                  name="businessType"
                  className="form-select"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                >
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Country & Phone Number */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="country">Country *</label>
              <div className="auth-input-wrap">
                <Globe size={16} className="auth-input-icon" />
                <select
                  id="country"
                  name="country"
                  className="form-select"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="India">India (IN)</option>
                  <option value="United States">United States (US)</option>
                  <option value="United Kingdom">United Kingdom (UK)</option>
                  <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                  <option value="Singapore">Singapore (SG)</option>
                  <option value="Canada">Canada (CA)</option>
                  <option value="Australia">Australia (AU)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phoneNumber">
                Phone Number 
                <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '11.5px' }}>(Optional)</span>
              </label>
              <div className="auth-input-wrap">
                <Phone size={16} className="auth-input-icon" />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password *
              <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '11.5px' }}>(Min. 8 characters)</span>
            </label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating Account & Store...' : 'Register & Start Onboarding'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in here
          </Link>
        </div>
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="auth-trust-badges">
        <div className="trust-badge-item">
          <CheckCircle2 size={14} />
          <span>Zero-Risk 30-Day Pilot</span>
        </div>
        <span className="trust-sep">•</span>
        <div className="trust-badge-item">
          <ShieldCheck size={14} />
          <span>Zero Credit Card Required</span>
        </div>
        <span className="trust-sep">•</span>
        <div className="trust-badge-item">
          <Zap size={14} />
          <span>5-Minute Shopify & WooCommerce Sync</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
