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
  CheckCircle2,
  RefreshCw,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import workspaceService from '../services/workspace.service';

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationTab, setNotificationTab] = useState('all');
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cp_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await workspaceService.getNotifications();
      if (res?.notifications) {
        setNotifications(res.notifications);
        const unread = res.notifications.filter(
          (n) => !n.read && !readNotificationIds.includes(n.id)
        ).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [readNotificationIds.length]);

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(updated);
    try {
      localStorage.setItem('cp_read_notifications', JSON.stringify(updated));
    } catch {}
    setUnreadCount(0);
  };

  const handleNotificationClick = (item) => {
    if (!readNotificationIds.includes(item.id)) {
      const updated = [...readNotificationIds, item.id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('cp_read_notifications', JSON.stringify(updated));
      } catch {}
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotificationsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filteredNotifications = notifications.filter((item) => {
    if (notificationTab === 'urgent') return item.priority === 'urgent' || item.type === 'COD_RISK' || item.type === 'NDR_ALERT';
    if (notificationTab === 'inventory') return item.type === 'LOW_STOCK';
    return true;
  });

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
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  if (!notificationsOpen) fetchNotifications();
                }}
                aria-label="Notifications"
                title="Active Store Alerts"
                style={{ position: 'relative' }}
              >
                <Bell size={17} />
                {unreadCount > 0 && <span className="notification-dot" />}
              </button>

              {notificationsOpen && (
                <div className="notification-panel">
                  {/* Header */}
                  <div className="notification-header">
                    <div className="notification-header-title">
                      <Bell size={15} style={{ color: '#0284C7' }} />
                      <span>Store Alerts</span>
                      {unreadCount > 0 && (
                        <span className="notification-badge-count">{unreadCount} new</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="notification-mark-all"
                        title="Mark all as read"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="notification-tabs">
                    <button
                      type="button"
                      className={`notification-tab-btn ${notificationTab === 'all' ? 'active' : ''}`}
                      onClick={() => setNotificationTab('all')}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      type="button"
                      className={`notification-tab-btn ${notificationTab === 'urgent' ? 'active' : ''}`}
                      onClick={() => setNotificationTab('urgent')}
                    >
                      Urgent ({notifications.filter((n) => n.priority === 'urgent').length})
                    </button>
                    <button
                      type="button"
                      className={`notification-tab-btn ${notificationTab === 'inventory' ? 'active' : ''}`}
                      onClick={() => setNotificationTab('inventory')}
                    >
                      Stock ({notifications.filter((n) => n.type === 'LOW_STOCK').length})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="notification-list">
                    {filteredNotifications.length === 0 ? (
                      <div className="notification-empty-state">
                        <CheckCircle2 size={26} style={{ color: '#10B981' }} />
                        <div style={{ fontWeight: 650, fontSize: '13px', color: '#0F172A' }}>
                          All caught up!
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          No operational alerts or critical issues found.
                        </div>
                      </div>
                    ) : (
                      filteredNotifications.map((n) => {
                        const isUnread = !readNotificationIds.includes(n.id);
                        return (
                          <div
                            key={n.id}
                            className={`notification-item ${isUnread ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className={`notification-item-icon ${n.priority === 'urgent' ? 'urgent' : n.priority === 'warning' ? 'warning' : 'info'}`}>
                              {n.type === 'COD_RISK' ? (
                                <ShieldAlert size={16} />
                              ) : n.type === 'LOW_STOCK' ? (
                                <Package size={16} />
                              ) : n.type === 'NDR_ALERT' ? (
                                <Truck size={16} />
                              ) : (
                                <Sparkles size={16} />
                              )}
                            </div>
                            <div className="notification-item-body">
                              <div className="notification-item-title">
                                <span>{n.title}</span>
                                <span className="notification-item-time">{formatRelativeTime(n.time)}</span>
                              </div>
                              <div className="notification-item-msg">{n.message}</div>
                            </div>
                            {isUnread && <span className="notification-unread-indicator" />}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="notification-footer">
                    <Link
                      to="/app/overview"
                      className="notification-footer-link"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Store Telemetry →
                    </Link>
                    <button
                      type="button"
                      className="notification-footer-link"
                      onClick={fetchNotifications}
                      disabled={loadingNotifications}
                      title="Sync live store alerts"
                    >
                      <RefreshCw size={12} className={loadingNotifications ? 'spinning' : ''} style={{ display: 'inline', marginRight: '4px' }} />
                      Sync
                    </button>
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
