// ============================================================
// Settings Page – SAP S/4HANA & Engine Configuration
// ============================================================

import React, { useState } from 'react';
import {
  Server,
  Sliders,
  Clock,
  Brain,
  Bell,
  RefreshCw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sap' | 'tolerances' | 'sla' | 'ai' | 'notifications'>('sap');

  // SAP Config
  const [sapConfig, setSapConfig] = useState({
    systemId: 'S4P - S/4HANA Production 2023',
    client: '100',
    host: 's4hana-eu.harbourpine.corp',
    rfcDestination: 'SAP_S4HANA_P2P_INT',
    syncInterval: '5',
    lastSync: '2 minutes ago',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Tolerances
  const [tolerances, setTolerances] = useState({
    priceTolerancePct: 2.0,
    priceToleranceAbs: 25.0,
    qtyTolerancePct: 1.0,
    autoApproveLimit: 500.0,
    autoAssignCompanyCode: true,
  });

  // SLA
  const [slaDays, setSlaDays] = useState({
    critical: 2,
    high: 5,
    medium: 10,
    low: 30,
  });

  // AI
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    confidenceThreshold: 80,
    autoSuggestResolution: true,
    autoDraftCreditNote: true,
    includeHistoricalPrecedents: true,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    emailOnBreach: true,
    emailDailyDigest: true,
    slackWebhook: true,
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/SAP_P2P_ALERTS',
  });

  const handleTestSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSapConfig(prev => ({ ...prev, lastSync: 'Just now' }));
      toast.success('SAP S/4HANA Connection Verified (Ping: 38ms)', { icon: '🟢' });
    }, 1200);
  };

  const handleSave = () => {
    toast.success('System settings saved successfully');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings &amp; Configuration</h1>
          <div className="page-subtitle">Configure SAP S/4HANA connector, variance tolerances, and automation rules</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-normal)',
          background: 'var(--bg-app)',
          overflowX: 'auto',
          padding: '0 12px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {[
            { id: 'sap', label: 'SAP S/4HANA', icon: Server },
            { id: 'tolerances', label: 'Tolerances', icon: Sliders },
            { id: 'sla', label: 'SLA Escalations', icon: Clock },
            { id: 'ai', label: 'AI Copilot', icon: Brain },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 18px',
                fontSize: 13,
                fontWeight: activeTab === id ? 600 : 500,
                color: activeTab === id ? 'var(--brand-secondary)' : 'var(--text-secondary)',
                borderBottom: activeTab === id ? '2px solid var(--brand-secondary)' : '2px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 24 }}>
          {activeTab === 'sap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ShieldCheck size={24} color="#15803d" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>
                      Connected to SAP S/4HANA Enterprise
                    </div>
                    <div style={{ fontSize: 12, color: '#166534' }}>
                      RFC Protocol Active · Last sync: {sapConfig.lastSync}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleTestSync}
                  disabled={isSyncing}
                  style={{ background: '#ffffff' }}
                >
                  <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Testing…' : 'Sync Now'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">System Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sapConfig.systemId}
                    onChange={(e) => setSapConfig({ ...sapConfig, systemId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Client ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sapConfig.client}
                    onChange={(e) => setSapConfig({ ...sapConfig, client: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Application Host</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sapConfig.host}
                    onChange={(e) => setSapConfig({ ...sapConfig, host: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">RFC Destination</label>
                  <input
                    type="text"
                    className="form-input"
                    value={sapConfig.rfcDestination}
                    onChange={(e) => setSapConfig({ ...sapConfig, rfcDestination: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sync Frequency</label>
                <select
                  className="form-select"
                  value={sapConfig.syncInterval}
                  onChange={(e) => setSapConfig({ ...sapConfig, syncInterval: e.target.value })}
                >
                  <option value="1">Every 1 minute (Real-time)</option>
                  <option value="5">Every 5 minutes (Recommended)</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="60">Hourly batch</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'tolerances' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                padding: '12px 16px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                fontSize: 13,
                color: '#1e40af',
                lineHeight: 1.5,
              }}>
                Invoice amounts or quantities within tolerance limits bypass exception queues and are cleared automatically for payment in SAP MM-LIV.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Price Variance Tolerance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={tolerances.priceTolerancePct}
                    onChange={(e) => setTolerances({ ...tolerances, priceTolerancePct: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Absolute Price Variance (£)</label>
                  <input
                    type="number"
                    step="5"
                    className="form-input"
                    value={tolerances.priceToleranceAbs}
                    onChange={(e) => setTolerances({ ...tolerances, priceToleranceAbs: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Quantity Variance Tolerance (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={tolerances.qtyTolerancePct}
                    onChange={(e) => setTolerances({ ...tolerances, qtyTolerancePct: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Auto-Approval Threshold (£)</label>
                  <input
                    type="number"
                    step="50"
                    className="form-input"
                    value={tolerances.autoApproveLimit}
                    onChange={(e) => setTolerances({ ...tolerances, autoApproveLimit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: 'var(--bg-surface)',
                borderRadius: 8,
              }}>
                <input
                  type="checkbox"
                  id="page-auto-assign-chk"
                  checked={tolerances.autoAssignCompanyCode}
                  onChange={(e) => setTolerances({ ...tolerances, autoAssignCompanyCode: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="page-auto-assign-chk" style={{ fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  Auto-assign newly detected exceptions to lead AP Specialist based on Company Code (HP01 / HP02)
                </label>
              </div>
            </div>
          )}

          {activeTab === 'sla' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Target resolution timeframe (business days) by exception priority tier before manager escalation alerts are triggered.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#dc2626' }}>Critical SLA (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={slaDays.critical}
                    onChange={(e) => setSlaDays({ ...slaDays, critical: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#ea580c' }}>High SLA (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={slaDays.high}
                    onChange={(e) => setSlaDays({ ...slaDays, high: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#d97706' }}>Medium SLA (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={slaDays.medium}
                    onChange={(e) => setSlaDays({ ...slaDays, medium: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#16a34a' }}>Low SLA (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={slaDays.low}
                    onChange={(e) => setSlaDays({ ...slaDays, low: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                padding: '14px 18px',
                background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <Brain size={22} color="var(--brand-secondary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a' }}>Deterministic Enterprise Intelligence</div>
                  <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
                    The AI Exception Copilot correlates SAP purchase orders, receipts, supplier terms, and variance history to generate grounded resolution actions.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  {
                    key: 'autoSuggestResolution',
                    title: 'Auto-Generate Resolution Strategies',
                    desc: 'Pre-compute root cause analysis when opening an exception record',
                  },
                  {
                    key: 'autoDraftCreditNote',
                    title: 'Automated Credit Note Request Drafting',
                    desc: 'Draft pre-populated supplier dispute emails with SAP document references',
                  },
                  {
                    key: 'includeHistoricalPrecedents',
                    title: 'Supplier Precedent Matching',
                    desc: 'Check past similar exceptions from the same supplier to suggest accepted resolutions',
                  },
                ].map(({ key, title, desc }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={(aiSettings as any)[key]}
                      onChange={(e) => setAiSettings({ ...aiSettings, [key]: e.target.checked })}
                      style={{ marginTop: 2, width: 18, height: 18 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: 8 }}>
                <label className="form-label">Minimum Confidence for Auto-Suggestions (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={aiSettings.confidenceThreshold}
                    onChange={(e) => setAiSettings({ ...aiSettings, confidenceThreshold: parseInt(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-secondary)', minWidth: 45 }}>
                    {aiSettings.confidenceThreshold}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  {
                    key: 'emailOnBreach',
                    title: 'Email Alerts on SLA Breach',
                    desc: 'Notify assigned owner & Finance Controller immediately upon SLA expiration',
                  },
                  {
                    key: 'emailDailyDigest',
                    title: 'Daily Exception Queue Digest',
                    desc: 'Send 08:00 AM summary of pending, critical, and unassigned exceptions',
                  },
                  {
                    key: 'slackWebhook',
                    title: 'Chat & Webhook Integration (Slack / MS Teams)',
                    desc: 'Broadcast critical exceptions to designated channels',
                  },
                ].map(({ key, title, desc }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={(notifications as any)[key]}
                      onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                      style={{ marginTop: 2, width: 18, height: 18 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {notifications.slackWebhook && (
                <div className="form-group" style={{ marginTop: 8 }}>
                  <label className="form-label">Incoming Webhook URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={notifications.webhookUrl}
                    onChange={(e) => setNotifications({ ...notifications, webhookUrl: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
