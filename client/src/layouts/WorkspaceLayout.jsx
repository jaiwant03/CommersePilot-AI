import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  TrendingUp,
  Sparkles,
  Zap,
  Settings,
  Bell,
  LogOut,
  Store,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/app/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/app/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/app/inventory', label: 'Inventory', icon: Package },
  { path: '/app/deliveries', label: 'Deliveries', icon: Truck },
  { path: '/app/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/app/assistant', label: 'AI Assistant', icon: Sparkles, badge: 'Groq' },
  { path: '/app/automations', label: 'Automations', icon: Zap },
  { path: '/app/settings', label: 'Store Settings', icon: Settings },
];

const WorkspaceLayout = () => {
  const { user, store, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Derive current page title for breadcrumb
  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = currentNav ? currentNav.label : 'Workspace';

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S';
  const storeName = store?.name || 'My Store';
  const storeChannel = store?.channel || 'D2C';

  return (
    <div className="workspace-shell">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`workspace-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/app/overview" className="sidebar-brand">
            <div className="logo-symbol">
              <Sparkles size={17} />
            </div>
            <div className="brand-text-col">
              <span className="brand-title">CommercePilot</span>
              <span className="brand-tier-badge">AI PRO</span>
            </div>
          </Link>
          <button
            className="topbar-btn mobile-sidebar-toggle"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            style={{ marginLeft: 'auto' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Core Operations</div>
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-link-inner">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </NavLink>
            );
          })}

          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>
            Intelligence & Tools
          </div>
          {NAV_ITEMS.slice(4).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-link-inner">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="store-preview-link">
            <span className="store-preview-left">
              <ExternalLink size={14} />
              <span>Marketing Site</span>
            </span>
            <span className="live-status-pill">
              <span className="live-beacon-dot" />
              Live
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="workspace-main">
        {/* Topbar */}
        <header className="workspace-topbar">
          <div className="topbar-left">
            <button
              className="topbar-btn mobile-sidebar-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>

            <div className="breadcrumbs">
              <span>CommercePilot</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{pageTitle}</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Store Switcher Pill */}
            <div className="store-switcher-pill" title={`Connected Channel: ${storeChannel}`}>
              <Store size={14} style={{ color: '#818CF8' }} />
              <span>{storeName}</span>
              <span className="store-badge">{storeChannel}</span>
            </div>

            {/* Notification Center */}
            <div style={{ position: 'relative' }} ref={notificationsRef}>
              <button
                className="topbar-btn"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                aria-label="Notifications"
                title="Active Alerts"
              >
                <Bell size={17} />
                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <div className="dropdown-panel" style={{ width: '300px' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    Operations Telemetry
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', gap: '10px', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)' }}>
                    <ShieldAlert size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>High COD Risk Order</div>
                      <div style={{ color: 'var(--color-text-faint)' }}>Customer address flagged for verification.</div>
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Automations Active</div>
                      <div style={{ color: 'var(--color-text-faint)' }}>Email verification and NDR recovery active.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                className="profile-menu-trigger"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="User Profile"
              >
                <div className="profile-avatar">{userInitial}</div>
                <div className="profile-name" style={{ display: 'none' /* on mobile */ }}>
                  {user?.fullName?.split(' ')[0] || 'Merchant'}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              {profileOpen && (
                <div className="dropdown-panel">
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {user?.fullName || 'Seller'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                      {user?.email}
                    </div>
                  </div>

                  <Link
                    to="/app/settings"
                    className="dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={15} />
                    <span>Store Preferences</span>
                  </Link>

                  <Link
                    to="/"
                    className="dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ExternalLink size={15} />
                    <span>Landing Website</span>
                  </Link>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
