import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Footer = () => {
  const { serverStatus } = useApp();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link to="/" className="brand-logo">
              <div className="logo-symbol">
                <Sparkles size={18} />
              </div>
              <span className="brand-text">
                CommercePilot <span>AI</span>
              </span>
            </Link>
            <p className="footer-brand-desc">
              Your Ecommerce Business. On Autopilot. Intelligent COD order verification,
              predictive inventory safeguarding, and automated delivery recovery for high-growth online brands.
            </p>
            <div className="footer-status-pill">
              <span className={`status-dot ${serverStatus.healthy ? '' : 'status-dot-warn'}`}></span>
              <span>
                {serverStatus.checked
                  ? serverStatus.healthy
                    ? 'All Systems Operational'
                    : 'System Initializing'
                  : 'Telemetry Connecting...'}
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Product</h4>
            <div className="footer-links">
              <Link to="/features" className="footer-link">COD Intelligence</Link>
              <Link to="/features" className="footer-link">Predictive Inventory</Link>
              <Link to="/features" className="footer-link">NDR Recovery</Link>
              <Link to="/features" className="footer-link">AI Copilot</Link>
              <Link to="/pricing" className="footer-link">Plans & Pricing</Link>
            </div>
          </div>

          {/* Solutions Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Solutions</h4>
            <div className="footer-links">
              <span className="footer-link">Indian D2C Brands</span>
              <span className="footer-link">Shopify Merchants</span>
              <span className="footer-link">WooCommerce Stores</span>
              <span className="footer-link">Instagram & Social Sellers</span>
              <span className="footer-link">Fashion & Cosmetics</span>
            </div>
          </div>

          {/* Company Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Company</h4>
            <div className="footer-links">
              <Link to="/how-it-works" className="footer-link">How It Works</Link>
              <a href="#faq" className="footer-link">FAQ & Support</a>
              <span className="footer-link">Security Architecture</span>
              <span className="footer-link">Roadmap</span>
            </div>
          </div>

          {/* Legal Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Legal</h4>
            <div className="footer-links">
              <span className="footer-link">Privacy Policy</span>
              <span className="footer-link">Terms of Service</span>
              <span className="footer-link">Data Protection</span>
              <span className="footer-link">Cookie Preferences</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CommercePilot AI Inc. All rights reserved.</p>
          <div className="footer-legal-links">
            <span>Built for Modern Ecommerce</span>
            <span>•</span>
            <span>SOC2 Compliant Architecture</span>
            <span>•</span>
            <span>Made for Indian Commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
