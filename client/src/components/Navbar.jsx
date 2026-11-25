import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Sparkles, LogOut, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { mobileMenuOpen, toggleMobileMenu } = useApp();
  const { user, store, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const NAV_SECTIONS = ['home', 'product', 'features', 'how-it-works', 'pricing'];

  // Scroll spy: update active navbar link as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      // On landing page, dynamically detect which section is in view
      if (location.pathname === '/') {
        const navHeight = 90;
        let current = 'home';

        // Check if scrolled near the bottom of document
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
          current = 'pricing';
        } else {
          for (const sectionId of NAV_SECTIONS) {
            const el = document.getElementById(sectionId);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= navHeight + 80 && rect.bottom > navHeight) {
                current = sectionId;
              }
            }
          }
        }
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Also listen for active section changes dispatched from landing page components
  useEffect(() => {
    if (location.pathname !== '/') return;
    const handleSectionChange = (e) => {
      if (e.detail?.sectionId) {
        setActiveSection(e.detail.sectionId);
      }
    };
    window.addEventListener('sectionchange', handleSectionChange);
    return () => window.removeEventListener('sectionchange', handleSectionChange);
  }, [location.pathname]);

  // Close mobile drawer upon route change
  useEffect(() => {
    toggleMobileMenu(false);
  }, [location.pathname]);

  const handleNavClick = (sectionId, e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        const yOffset = -70;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setActiveSection(sectionId);
      }
    }
  };

  return (
    <>
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Brand Logo & Name */}
        <Link to="/" className="brand-logo" aria-label="CommercePilot AI Home">
          <div className="logo-symbol">
            <Sparkles size={20} />
          </div>
          <span className="brand-text">
            CommercePilot <span>AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-menu" aria-label="Main Navigation">
          <a
            href="/#home"
            onClick={(e) => handleNavClick('home', e)}
            className={`nav-link ${location.pathname === '/' && activeSection === 'home' ? 'active' : ''}`}
          >
            Home
          </a>
          <a
            href="/#product"
            onClick={(e) => handleNavClick('product', e)}
            className={`nav-link ${location.pathname === '/' && activeSection === 'product' ? 'active' : location.pathname === '/product' ? 'active' : ''}`}
          >
            Product
          </a>
          <a
            href="/#features"
            onClick={(e) => handleNavClick('features', e)}
            className={`nav-link ${location.pathname === '/' && activeSection === 'features' ? 'active' : location.pathname === '/features' ? 'active' : ''}`}
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => handleNavClick('how-it-works', e)}
            className={`nav-link ${location.pathname === '/' && activeSection === 'how-it-works' ? 'active' : location.pathname === '/how-it-works' ? 'active' : ''}`}
          >
            How It Works
          </a>
          <a
            href="/#pricing"
            onClick={(e) => handleNavClick('pricing', e)}
            className={`nav-link ${location.pathname === '/' && activeSection === 'pricing' ? 'active' : location.pathname === '/pricing' ? 'active' : ''}`}
          >
            Pricing
          </a>
          {isAuthenticated && (
            <Link to="/app/overview" className={`nav-link ${location.pathname.startsWith('/app') ? 'active' : ''}`}>
              Workspace
            </Link>
          )}
        </nav>

        {/* Action CTAs */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="nav-auth-desktop">
              <Link to="/app/overview" className="nav-btn-open-app">
                <span>Open App</span>
                <ArrowRight size={13} />
              </Link>
              <div className="nav-user-pill">
                <UserCheck size={13} style={{ color: '#16A34A' }} />
                <span>{user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JK'}</span>
              </div>
              <button 
                type="button" 
                onClick={logout} 
                className="nav-logout-btn"
                title="Log out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-desktop">
              <Link to="/login" className="modelled-nav-btn-white">
                Login
              </Link>
              <Link to="/signup" className="nav-btn-open-app">
                <span>Get Started</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => toggleMobileMenu(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>

      {/* Mobile Slide-Out Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="mobile-nav-links">
          <a
            href="/#home"
            onClick={(e) => { handleNavClick('home', e); toggleMobileMenu(false); }}
            className={`mobile-nav-link ${location.pathname === '/' && activeSection === 'home' ? 'active' : ''}`}
          >
            Home
          </a>
          <a
            href="/#product"
            onClick={(e) => { handleNavClick('product', e); toggleMobileMenu(false); }}
            className={`mobile-nav-link ${location.pathname === '/' && activeSection === 'product' ? 'active' : location.pathname === '/product' ? 'active' : ''}`}
          >
            Product
          </a>
          <a
            href="/#features"
            onClick={(e) => { handleNavClick('features', e); toggleMobileMenu(false); }}
            className={`mobile-nav-link ${location.pathname === '/' && activeSection === 'features' ? 'active' : ''}`}
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => { handleNavClick('how-it-works', e); toggleMobileMenu(false); }}
            className={`mobile-nav-link ${location.pathname === '/' && activeSection === 'how-it-works' ? 'active' : ''}`}
          >
            How It Works
          </a>
          <a
            href="/#pricing"
            onClick={(e) => { handleNavClick('pricing', e); toggleMobileMenu(false); }}
            className={`mobile-nav-link ${location.pathname === '/' && activeSection === 'pricing' ? 'active' : ''}`}
          >
            Pricing
          </a>
          {isAuthenticated && (
            <Link to="/app/overview" className={`mobile-nav-link ${location.pathname.startsWith('/app') ? 'active' : ''}`}>
              Workspace
            </Link>
          )}
        </div>

        <div className="mobile-nav-actions">
          {isAuthenticated ? (
            <button type="button" onClick={logout} className="btn btn-secondary">
              <LogOut size={16} /> Logout ({user?.fullName?.split(' ')[0]})
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started Free
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
