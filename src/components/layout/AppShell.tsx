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
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useExceptionStore } from '../../store/exceptionStore';
import { MOCK_USERS } from '../../data/users';
import { formatCurrency, formatDateTime } from '../../utils/formatting';

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
  const { currentUser, login, logout } = useAuthStore();
  const { kpis } = useExceptionStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => logout()} title="Click to log out">
            <div className="avatar">{currentUser?.avatar}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser?.name}</div>
              <div className="sidebar-user-role">{currentUser?.role}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-error)', fontSize: 11, fontWeight: 600 }}>
              <LogOut size={13} />
              <span>Exit</span>
            </div>
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
              <>
                <div
                  className="notification-backdrop"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="notification-panel">
                  <div className="notification-panel-header" style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Notifications</span>
                      {unreadNotifs > 0 && (
                        <span style={{
                          background: '#eff6ff',
                          color: 'var(--brand-secondary)',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: 999,
                          border: '1px solid #bfdbfe',
                        }}>
                          {unreadNotifs} unread
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                      style={{ padding: '4px 6px', height: 'auto', minWidth: 'unset', color: 'var(--text-muted)' }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="notification-panel-body" style={{ overflowY: 'auto' }}>
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{formatDateTime(n.time)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile & Quick Logout */}
          <div className="relative">
            <button
              id="profile-btn"
              className="topbar-avatar-btn"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              title={`${currentUser?.name} (${currentUser?.role}) – Click to log out`}
              aria-label="User profile and logout menu"
            >
              <div className="avatar">{currentUser?.avatar}</div>
            </button>

            {profileOpen && (
              <>
                <div
                  className="notification-backdrop"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="profile-dropdown-card">
                  <div className="profile-dropdown-header">
                    <div className="avatar avatar-lg">{currentUser?.avatar}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="profile-dropdown-name truncate">{currentUser?.name}</div>
                      <div className="profile-dropdown-role truncate">{currentUser?.role}</div>
                      <div className="profile-dropdown-email truncate">{currentUser?.email}</div>
                    </div>
                  </div>

                  <div className="profile-dropdown-actions">
                    <button
                      id="profile-logout-btn"
                      className="btn btn-danger btn-sm w-full"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      style={{ justifyContent: 'center', gap: 6, fontWeight: 600, padding: '8px 12px' }}
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>

                  <div className="profile-dropdown-switch-label">Switch Persona:</div>
                  <div className="profile-dropdown-personas">
                    {MOCK_USERS.filter(u => u.id !== currentUser?.id).map(u => (
                      <button
                        key={u.id}
                        className="profile-persona-btn"
                        onClick={() => {
                          login(u.email, u.password);
                          setProfileOpen(false);
                        }}
                      >
                        <div className="avatar avatar-sm">{u.avatar}</div>
                        <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                          <div className="profile-persona-name truncate">{u.name}</div>
                          <div className="profile-persona-role truncate">{u.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
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
      <main className="main-content" onClick={() => { notifOpen && setNotifOpen(false); profileOpen && setProfileOpen(false); }}>
        {children}
      </main>
    </div>
  );
};
