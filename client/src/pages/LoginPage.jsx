import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
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

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password
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
            <Sparkles size={14} />
            <span>Seller Operations Console</span>
          </div>
          <h1 className="auth-title">Log in to CommercePilot</h1>
          <p className="auth-subtitle">
            Enter your credentials to access your autonomous store operations.
          </p>
        </div>

        {errorMessage && (
          <div className="auth-alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Business Email</label>
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

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#818CF8' }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
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
    </div>
  );
};

export default LoginPage;
