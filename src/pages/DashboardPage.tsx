// ============================================================
// Dashboard Page
// ============================================================

import React, { useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  AlertTriangle, TrendingUp, Clock, DollarSign,
  CheckCircle, Zap, Target, RefreshCw, Activity,
} from 'lucide-react';
import { useExceptionStore } from '../store/exceptionStore';
import { useAuthStore } from '../store/authStore';
import { MOCK_EXCEPTIONS } from '../data/exceptions';
import { MOCK_SUPPLIERS } from '../data/suppliers';
import { formatCurrency, formatPct, STATUS_COLORS, PRIORITY_COLORS, AGEING_COLORS } from '../utils/formatting';
import { useNavigate } from 'react-router-dom';

// ── Static chart data ─────────────────────────────────────────
const TREND_DATA = [
  { month: 'Apr', open: 12, resolved: 8, critical: 3 },
  { month: 'May', open: 15, resolved: 11, critical: 5 },
  { month: 'Jun', open: 18, resolved: 14, critical: 4 },
  { month: 'Jul', open: 22, resolved: 17, critical: 7 },
  { month: 'Aug', open: 19, resolved: 16, critical: 6 },
  { month: 'Sep', open: 14, resolved: 12, critical: 4 },
  { month: 'Oct', open: 10, resolved: 2, critical: 3 },
];

const STATUS_DATA = [
  { name: 'Open', value: 3, color: STATUS_COLORS['Open'] },
  { name: 'Under Review', value: 1, color: STATUS_COLORS['Under Review'] },
  { name: 'Assigned', value: 2, color: STATUS_COLORS['Assigned'] },
  { name: 'Pending Approval', value: 2, color: STATUS_COLORS['Pending Approval'] },
  { name: 'Resolved', value: 2, color: STATUS_COLORS['Resolved'] },
];

const PRIORITY_DATA = [
  { name: 'Critical', value: 3, color: PRIORITY_COLORS['Critical'] },
  { name: 'High', value: 3, color: PRIORITY_COLORS['High'] },
  { name: 'Medium', value: 2, color: PRIORITY_COLORS['Medium'] },
  { name: 'Low', value: 1, color: PRIORITY_COLORS['Low'] },
];

const AGEING_DATA = [
  { bucket: '0–7d', count: 1, color: AGEING_COLORS['0-7 days'] },
  { bucket: '8–15d', count: 1, color: AGEING_COLORS['8-15 days'] },
  { bucket: '16–30d', count: 1, color: AGEING_COLORS['16-30 days'] },
  { bucket: '31–60d', count: 2, color: AGEING_COLORS['31-60 days'] },
  { bucket: '60+d', count: 5, color: AGEING_COLORS['60+ days'] },
];

const SUPPLIER_EXPOSURE = (() => {
  const map: Record<string, number> = {};
  MOCK_EXCEPTIONS.forEach((e) => {
    const s = MOCK_SUPPLIERS.find((s) => s.id === e.supplierId);
    const name = s?.name ?? e.supplierId;
    map[name] = (map[name] ?? 0) + e.financialExposure;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
})();

const EXPOSURE_BY_PRIORITY = [
  { name: 'Critical', exposure: 194640, color: '#ef4444' },
  { name: 'High', exposure: 66083, color: '#f97316' },
  { name: 'Medium', exposure: 54600, color: '#eab308' },
  { name: 'Low', exposure: 0, color: '#22c55e' },
];

// ── KPI Card ──────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  variant?: 'critical' | 'high' | 'warning' | 'success' | 'info' | '';
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, sub, icon, variant = '', onClick }) => (
  <div className={`kpi-card kpi-${variant}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
    <div className="kpi-header">
      <span className="kpi-label">{label}</span>
      <div className={`kpi-icon kpi-icon-${variant || 'default'}`}>
        {icon}
      </div>
    </div>
    <div className={`kpi-value ${value.length > 8 ? 'kpi-value-sm' : ''}`}>{value}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border-normal)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      boxShadow: 'var(--shadow-md)',
    }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</div>}
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color ?? 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span>{p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { kpis, loadKPIs } = useExceptionStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { loadKPIs(); }, []);

  const k = kpis;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">
            Welcome back, {currentUser?.name} · {currentUser?.role} · Demo date: 08 Oct 2026
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => loadKPIs()}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/exceptions')}>
            <AlertTriangle size={13} /> View All Exceptions
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard label="Total Exceptions" value={String(k?.totalExceptions ?? 10)} sub="All time, current cycle" icon={<Activity size={14} />} variant="info" onClick={() => navigate('/exceptions')} />
        <KPICard label="Open Exceptions" value={String(k?.openExceptions ?? 8)} sub="Awaiting resolution" icon={<AlertTriangle size={14} />} variant="high" onClick={() => navigate('/exceptions?status=Open')} />
        <KPICard label="Critical Exceptions" value={String(k?.criticalExceptions ?? 3)} sub="Requires immediate action" icon={<Zap size={14} />} variant="critical" onClick={() => navigate('/exceptions?priority=Critical')} />
        <KPICard label="Overdue (SLA Breach)" value={String(k?.overdueExceptions ?? 7)} sub="Past SLA deadline" icon={<Clock size={14} />} variant="critical" />
        <KPICard label="Financial Exposure" value={formatCurrency(k?.totalFinancialExposure ?? 315303)} sub="Open exceptions total" icon={<DollarSign size={14} />} variant="high" />
        <KPICard label="Avg Resolution Time" value={`${k?.avgResolutionDays ?? 74}d`} sub="For resolved exceptions" icon={<TrendingUp size={14} />} variant="" />
        <KPICard label="SLA Adherence" value={formatPct(k?.slaAdherencePct ?? 30)} sub="Within SLA target" icon={<Target size={14} />} variant={k?.slaAdherencePct && k.slaAdherencePct >= 80 ? 'success' : 'critical'} />
        <KPICard label="First Pass Yield" value={formatPct(k?.firstPassYieldPct ?? 68.5)} sub="Invoices matched first time" icon={<CheckCircle size={14} />} variant="warning" />
        <KPICard label="Recurrence Rate" value={formatPct(k?.recurrenceRatePct ?? 12.3)} sub="Same supplier repeat exceptions" icon={<RefreshCw size={14} />} variant="warning" />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        {/* Exception Trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><TrendingUp size={16} /> Exception Trend (6 Months)</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Area type="monotone" dataKey="open" name="Open" stroke="#2563eb" fill="url(#gradOpen)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fill="url(#gradResolved)" strokeWidth={2} />
              <Area type="monotone" dataKey="critical" name="Critical" stroke="#ef4444" fill="url(#gradCritical)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Exceptions by Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Activity size={16} /> Exceptions by Status</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={STATUS_DATA}
                cx="50%"
                cy="46%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {STATUS_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        {/* Exceptions by Priority */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><AlertTriangle size={16} /> Exceptions by Priority</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={PRIORITY_DATA} layout="vertical" margin={{ top: 0, right: 15, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={56} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                {PRIORITY_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exposure by Priority */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><DollarSign size={16} /> Financial Exposure by Priority</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={EXPOSURE_BY_PRIORITY} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} width={44} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="exposure" name="Exposure (£)" radius={[4, 4, 0, 0]}>
                {EXPOSURE_BY_PRIORITY.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="charts-grid">
        {/* Ageing Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Clock size={16} /> Exceptions by Ageing</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={AGEING_DATA} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                {AGEING_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier Exposure */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><DollarSign size={16} /> Exposure by Supplier (Top 5)</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={SUPPLIER_EXPOSURE} layout="vertical" margin={{ top: 0, right: 15, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Exposure (£)" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Open Exceptions quick list */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title"><AlertTriangle size={16} /> Top Open Exceptions – Immediate Attention</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/exceptions')}>View All →</button>
        </div>

        {/* Desktop Table */}
        <div className="table-wrapper desktop-only-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Exception Type</th>
                <th>Supplier</th>
                <th>Exposure</th>
                <th>Priority</th>
                <th>Ageing</th>
                <th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_EXCEPTIONS.filter(e => e.status !== 'Resolved' && e.status !== 'Rejected')
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 5)
                .map((exc) => {
                  const supplier = MOCK_SUPPLIERS.find(s => s.id === exc.supplierId);
                  return (
                    <tr key={exc.id} onClick={() => navigate(`/exceptions/${exc.id}`)}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-link)' }}>{exc.id}</span></td>
                      <td style={{ maxWidth: 200 }}><span className="truncate" style={{ display: 'block', maxWidth: 200 }}>{exc.exceptionType}</span></td>
                      <td>{supplier?.name ?? exc.supplierId}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(exc.financialExposure, exc.currency)}</td>
                      <td>
                        <span className={`badge badge-priority-${exc.priority.toLowerCase()}`}>
                          {exc.priority}
                        </span>
                      </td>
                      <td style={{ color: exc.ageingDays > 30 ? 'var(--color-error)' : 'var(--text-primary)' }}>
                        {exc.ageingDays}d
                      </td>
                      <td>
                        {exc.slaBreached
                          ? <span className="badge badge-status-rejected">Breached</span>
                          : <span className="badge badge-status-resolved">On Track</span>}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Mobile-Friendly Exception Cards */}
        <div className="mobile-only-cards">
          {MOCK_EXCEPTIONS.filter(e => e.status !== 'Resolved' && e.status !== 'Rejected')
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 5)
            .map((exc) => {
              const supplier = MOCK_SUPPLIERS.find(s => s.id === exc.supplierId);
              return (
                <div
                  key={exc.id}
                  className="mobile-record-card"
                  onClick={() => navigate(`/exceptions/${exc.id}`)}
                >
                  <div className="mobile-record-header">
                    <span className="mobile-record-id">{exc.id}</span>
                    <span className={`badge badge-priority-${exc.priority.toLowerCase()}`}>
                      {exc.priority}
                    </span>
                  </div>
                  <div className="mobile-record-title">{exc.exceptionType}</div>
                  <div className="mobile-record-supplier">
                    <span>🏢 {supplier?.name ?? exc.supplierId}</span>
                  </div>
                  <div className="mobile-record-footer">
                    <div className="mobile-record-exposure">
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, marginRight: 4 }}>Exposure:</span>
                      <strong>{formatCurrency(exc.financialExposure, exc.currency)}</strong>
                    </div>
                    <div className="mobile-record-meta">
                      <span style={{ color: exc.ageingDays > 30 ? 'var(--color-error)' : 'var(--text-muted)' }}>
                        {exc.ageingDays}d
                      </span>
                      {exc.slaBreached ? (
                        <span className="badge badge-status-rejected">Breached</span>
                      ) : (
                        <span className="badge badge-status-resolved">On Track</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
