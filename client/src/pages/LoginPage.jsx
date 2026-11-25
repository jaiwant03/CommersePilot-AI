import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFillDemo = () => {
    setFormData({
      email: 'meena@trendythreads.in',
      password: 'TrendyThreads2026!',
      rememberMe: true
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      // Redirect directly to intended workspace path or default to /app/overview
      const rawFrom = location.state?.from?.pathname;
      const destination = (rawFrom && rawFrom.startsWith('/app')) ? rawFrom : '/app/overview';
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow" aria-hidden="true"></div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={13} />
            <span>Seller Operations Console</span>
          </div>
          <h1 className="auth-title">Log in to CommercePilot</h1>
          <p className="auth-subtitle">
            Enter your credentials to access your autonomous store operations.
          </p>
        </div>

        {/* Quick One-Click Demo Credentials Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            type="button"
            className="auth-demo-pill"
            onClick={handleFillDemo}
            style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}
            title="Instant autofill for Trendy Threads demo store"
          >
            <Sparkles size={13} className="sparkle-pulse" />
            <span>Demo: <strong>Meena (Trendy Threads)</strong></span>
          </button>
          <button
            type="button"
            className="auth-demo-pill"
            onClick={() => {
              setFormData({
                email: 'abc@gmail.com',
                password: 'Password123!',
                rememberMe: true
              });
              setErrorMessage('');
            }}
            style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}
            title="Instant autofill for ABC Store"
          >
            <Sparkles size={13} className="sparkle-pulse" />
            <span>Demo: <strong>ABC Store (abc@gmail.com)</strong></span>
          </button>
        </div>

        {errorMessage && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Business Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Business Email</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="merchant@yourbrand.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                required
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

          {/* Remember Device Checkbox */}
          <label className="form-checkbox-row">
            <input
              type="checkbox"
              name="rememberMe"
              className="form-checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span>Remember this device for 30 days</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Console'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account yet?{' '}
          <Link to="/register" className="auth-link">
            Register here
          </Link>
        </div>
      </div>

      {/* Enterprise Security & Trust Badges */}
      <div className="auth-trust-badges">
        <div className="trust-badge-item">
          <ShieldCheck size={14} />
          <span>256-Bit Bank-Grade Encryption</span>
        </div>
        <span className="trust-sep">•</span>
        <div className="trust-badge-item">
          <Zap size={14} />
          <span>Sub-Second Telemetry Sync</span>
        </div>
        <span className="trust-sep">•</span>
        <div className="trust-badge-item">
          <CheckCircle2 size={14} />
          <span>SOC-2 Type II Certified</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
