import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import authService from '../services/auth.service';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualToken, setManualToken] = useState('');

  const performVerification = async (verifyToken) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.verifyEmail(verifyToken);
      setVerified(true);
    } catch (err) {
      setErrorMsg(err.message || 'Email verification link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      performVerification(token);
    }
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-glow" aria-hidden="true"></div>

      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={14} />
            <span>Email Verification</span>
          </div>
          <h1 className="auth-title">Verify Your Business Email</h1>
        </div>

        {loading ? (
          <div style={{ padding: '32px 0' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                border: '3px solid rgba(99, 102, 241, 0.2)', 
                borderTopColor: '#6366F1', 
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite'
              }} 
            />
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>Verifying your token with secure credentials...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : verified ? (
          <div style={{ padding: '16px 0' }}>
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Email Address Verified!</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Your email address has been confirmed. You now have full operational access to your CommercePilot AI account.
            </p>
            <Link to="/onboarding" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Onboarding
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div>
            {errorMsg && (
              <div className="auth-alert-error" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {!token && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '16px' }}>
                  Paste the verification token from your confirmation email below:
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste token here"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => performVerification(manualToken)}
                  disabled={!manualToken.trim()}
                >
                  Verify Token
                </button>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
