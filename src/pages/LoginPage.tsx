// ============================================================
// Login Page
// ============================================================

import React, { useState } from 'react';
import { Shield, Zap, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MOCK_USERS } from '../data/users';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginError, clearError } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      setLoading(false);
    }, 600);
  };

  const fillDemo = (u: typeof MOCK_USERS[0]) => {
    setEmail(u.email);
    setPassword(u.password);
    clearError();
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Zap size={24} color="white" />
          </div>
          <div>
            <div className="login-title">P2P Exception Hub</div>
            <div className="login-subtitle">Harbour &amp; Pine Retail · SAP S/4HANA</div>
          </div>
        </div>

        {loginError && (
          <div className="error-banner" style={{ marginBottom: 16 }}>
            <Shield size={16} />
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="your.name@harbourpine.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo-hint">
          <div className="login-demo-title">⚡ Instant Persona Login · Click any profile to enter</div>
          {MOCK_USERS.map((u) => (
            <div key={u.id} className="login-demo-row" onClick={() => login(u.email, u.password)} title={`Log in as ${u.name}`}>
              <div className="avatar avatar-sm" style={{ marginRight: 10, flexShrink: 0 }}>{u.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="login-demo-name">{u.name}</div>
                <div className="login-demo-cred">{u.role} · {u.department}</div>
              </div>
              <span className="badge badge-status-open" style={{ fontSize: 10, padding: '2px 8px', flexShrink: 0 }}>Enter →</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
          🔒 Demo environment · No real SAP connection · Data is mocked
        </p>
      </div>
    </div>
  );
};
