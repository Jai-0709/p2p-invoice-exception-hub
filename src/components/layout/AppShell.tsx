// ============================================================
// Layout – AppShell (Sidebar + TopBar + Content)
// ============================================================

import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Bell,
  LogOut,
  Zap,
  Menu,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useExceptionStore } from '../../store/exceptionStore';
import { formatCurrency, formatDateTime } from '../../utils/formatting';
import { SettingsModal } from '../modals/SettingsModal';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exceptions', label: 'Exception Queue', icon: AlertTriangle },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const NOTIFICATIONS = [
  { id: 'N1', title: 'SLA Breach – EXC-100003', message: 'Nordic Freight exception is 82 days overdue. Immediate action required.', time: '2026-10-08T05:00:00Z', severity: 'error', unread: true },
  { id: 'N2', title: 'Approval Pending – EXC-100007', message: 'Invoice MER-2026-0944 awaiting Finance Controller approval. Due 30-Oct.', time: '2026-10-06T09:00:00Z', severity: 'warning', unread: true },
  { id: 'N3', title: 'Comment on EXC-100005', message: 'Sarah Mitchell added a comment on the company code exception.', time: '2026-09-25T10:10:00Z', severity: 'info', unread: false },
  { id: 'N4', title: 'Resolved – EXC-100006', message: 'Duplicate invoice exception resolved. Dalton Packaging notified.', time: '2026-10-01T16:00:00Z', severity: 'success', unread: false },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuthStore();
  const { kpis } = useExceptionStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const criticalCount = kpis?.criticalExceptions ?? 3;
  const unreadNotifs = NOTIFICATIONS.filter(n => n.unread).length;

  const breadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return [{ label: 'Home' }, { label: 'Dashboard', active: true }];
    if (path === '/exceptions') return [{ label: 'Home' }, { label: 'Exception Queue', active: true }];
    if (path.startsWith('/exceptions/')) return [{ label: 'Home' }, { label: 'Exception Queue', to: '/exceptions' }, { label: 'Exception Detail', active: true }];
    if (path === '/analytics') return [{ label: 'Home' }, { label: 'Analytics', active: true }];
    if (path === '/settings') return [{ label: 'Home' }, { label: 'Settings', active: true }];
    return [{ label: 'Home' }, { label: path, active: true }];
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">P2P Exception Hub</span>
            <span className="sidebar-logo-sub">Harbour &amp; Pine Retail</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Navigation</span>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              {label}
              {to === '/exceptions' && criticalCount > 0 && (
                <span className="sidebar-item-badge">{criticalCount}</span>
              )}
            </NavLink>
          ))}

          <span className="sidebar-section-label" style={{ marginTop: 12 }}>System</span>
          <button
            id="sidebar-settings-btn"
            className={`sidebar-item ${settingsOpen || location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => {
              setSettingsOpen(true);
              setSidebarOpen(false);
            }}
            title="Settings"
          >
            <Settings size={16} />
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => logout()}>
            <div className="avatar">{currentUser?.avatar}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser?.name}</div>
              <div className="sidebar-user-role">{currentUser?.role}</div>
            </div>
            <LogOut size={14} color="var(--text-muted)" />
          </div>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="topbar">
        <button
          className="topbar-icon-btn topbar-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          id="sidebar-toggle"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="topbar-breadcrumb">
          {breadcrumbs().map((bc, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={12} className="topbar-breadcrumb-sep" />}
              {bc.to ? (
                <button
                  className="topbar-breadcrumb-item"
                  onClick={() => navigate(bc.to!)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'var(--text-muted)', padding: 0 }}
                >
                  {bc.label}
                </button>
              ) : (
                <span className={`topbar-breadcrumb-item ${bc.active ? 'active' : ''}`}>
                  {bc.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="topbar-actions">
          {/* Environment tag */}
          <span className="topbar-demo-pill" style={{
            background: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            letterSpacing: '0.8px',
          }}>
            DEMO
          </span>

          {/* Notifications */}
          <div className="relative">
            <button
              id="notif-btn"
              className="topbar-icon-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Notifications"
            >
              <Bell size={15} />
              {unreadNotifs > 0 && <span className="notification-dot" />}
            </button>

            {notifOpen && (
              <div className="notification-panel">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Notifications</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unreadNotifs} unread</span>
                </div>
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.unread ? 'unread' : ''}`}
                    onClick={() => setNotifOpen(false)}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                      background: n.severity === 'error' ? 'var(--color-error)' :
                        n.severity === 'warning' ? 'var(--color-warning)' :
                        n.severity === 'success' ? 'var(--color-success)' : 'var(--color-info)',
                    }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{formatDateTime(n.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="avatar" title={currentUser?.name}>{currentUser?.avatar}</div>
        </div>
      </header>

      {/* Click-away for mobile sidebar */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content" onClick={() => notifOpen && setNotifOpen(false)}>
        {children}
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
