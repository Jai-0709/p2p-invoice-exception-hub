// ============================================================
// Analytics Page
// ============================================================

import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { MOCK_EXCEPTIONS } from '../data/exceptions';
import { MOCK_SUPPLIERS } from '../data/suppliers';
import { formatCurrency, PRIORITY_COLORS, STATUS_COLORS, AGEING_COLORS } from '../utils/formatting';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--border-normal)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-md)' }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</div>}
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          {p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// Derived analytics from MOCK data
const byType = (() => {
  const map: Record<string, number> = {};
  MOCK_EXCEPTIONS.forEach(e => { map[e.exceptionType] = (map[e.exceptionType] ?? 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 14) + '…' : name, value })).sort((a, b) => b.value - a.value);
})();

const bySupplierExposure = (() => {
  const map: Record<string, number> = {};
  MOCK_EXCEPTIONS.forEach(e => {
    const s = MOCK_SUPPLIERS.find(s => s.id === e.supplierId);
    const n = s?.name ?? e.supplierId;
    map[n] = (map[n] ?? 0) + e.financialExposure;
  });
  return Object.entries(map).map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 12) + '…' : name, value })).sort((a, b) => b.value - a.value);
})();

const byStatus = Object.entries(
  MOCK_EXCEPTIONS.reduce((acc, e) => { acc[e.status] = (acc[e.status] ?? 0) + 1; return acc; }, {} as Record<string, number>)
).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] ?? '#888' }));

const byPriority = Object.entries(
  MOCK_EXCEPTIONS.reduce((acc, e) => { acc[e.priority] = (acc[e.priority] ?? 0) + 1; return acc; }, {} as Record<string, number>)
).map(([name, value]) => ({ name, value, color: PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] ?? '#888' }));

const byAgeing = Object.entries(
  MOCK_EXCEPTIONS.reduce((acc, e) => { acc[e.ageingBucket] = (acc[e.ageingBucket] ?? 0) + 1; return acc; }, {} as Record<string, number>)
).map(([name, value]) => ({ name, value, color: AGEING_COLORS[name as keyof typeof AGEING_COLORS] ?? '#888' }))
  .sort((a, b) => {
    const order = ['0-7 days', '8-15 days', '16-30 days', '31-60 days', '60+ days'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

const monthlyResolution = [
  { month: 'Apr', opened: 12, resolved: 8, avgDays: 18 },
  { month: 'May', opened: 15, resolved: 11, avgDays: 22 },
  { month: 'Jun', opened: 18, resolved: 14, avgDays: 19 },
  { month: 'Jul', opened: 22, resolved: 17, avgDays: 25 },
  { month: 'Aug', opened: 19, resolved: 16, avgDays: 21 },
  { month: 'Sep', opened: 14, resolved: 12, avgDays: 17 },
  { month: 'Oct', opened: 10, resolved: 2, avgDays: 30 },
];

const slaData = [
  { name: 'Within SLA', value: 3, color: '#22c55e' },
  { name: 'SLA Breached', value: 7, color: '#ef4444' },
];

export const AnalyticsPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics &amp; Reporting</h1>
          <div className="page-subtitle">P2P Invoice Exception Analysis · Harbour &amp; Pine Retail · Oct 2026</div>
        </div>
      </div>

      {/* Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title"><TrendingUp size={16} /> Monthly Exception Trend</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyResolution} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="opened" name="Opened" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title"><Clock size={16} /> Avg Resolution Time (Days)</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyResolution} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgDays" name="Avg Days" fill="#2563eb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title"><BarChart3 size={16} /> Exceptions by Type</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byType} layout="vertical" margin={{ top: 0, right: 15, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={80} style={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" fill="#8b5cf6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title"><DollarSign size={16} /> Exposure by Supplier</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bySupplierExposure} layout="vertical" margin={{ top: 0, right: 15, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={75} style={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Exposure" fill="#f97316" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">By Status</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                {byStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">By Priority</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byPriority} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                {byPriority.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><span className="card-title"><Clock size={16} /> Ageing Distribution</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byAgeing} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[4,4,0,0]}>
                {byAgeing.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">SLA Compliance</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={slaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {slaData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
