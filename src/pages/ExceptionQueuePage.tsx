// ============================================================
// Exception Queue Page
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  AlertTriangle, RefreshCw, X,
} from 'lucide-react';
import { useExceptionStore } from '../store/exceptionStore';
import { MOCK_SUPPLIERS } from '../data/suppliers';
import { MOCK_USERS } from '../data/users';
import { formatCurrency, formatDate, STATUS_COLORS } from '../utils/formatting';
import { ExceptionStatus, ExceptionPriority, ExceptionType, AgeingBucket } from '../types';

const EXCEPTION_TYPES: ExceptionType[] = [
  'PO/Invoice Quantity Mismatch',
  'PO/Invoice Price Mismatch',
  'Goods Receipt Missing',
  'Supplier Master Data Missing',
  'Approval Pending',
  'Duplicate Invoice',
  'Incorrect Company Code',
  'Payment Block',
  'Tax/Amount Mismatch',
];

const STATUSES: ExceptionStatus[] = ['Open', 'Under Review', 'Assigned', 'Pending Approval', 'Resolved', 'Rejected', 'Reopened'];
const PRIORITIES: ExceptionPriority[] = ['Critical', 'High', 'Medium', 'Low'];
const AGEING_BUCKETS: AgeingBucket[] = ['0-7 days', '8-15 days', '16-30 days', '31-60 days', '60+ days'];

export const ExceptionQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    filteredResult, filters, loadAll, applyFilters, doExport, isLoading, error, clearError,
  } = useExceptionStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Apply URL params if present
    const urlStatus = searchParams.get('status') as ExceptionStatus | null;
    const urlPriority = searchParams.get('priority') as ExceptionPriority | null;
    applyFilters({
      status: urlStatus ?? '',
      priority: urlPriority ?? '',
    });
    loadAll();
  }, []);

  const handleSort = (field: string) => {
    applyFilters({
      sortField: field as any,
      sortDirection: filters.sortField === field && filters.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1,
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortField !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return filters.sortDirection === 'asc'
      ? <ChevronUp size={12} />
      : <ChevronDown size={12} />;
  };

  const resetFilters = () => {
    applyFilters({ search: '', status: '', priority: '', supplierId: '', exceptionType: '', ownerId: '', ageingBucket: '', page: 1 });
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority ||
    filters.supplierId || filters.exceptionType || filters.ownerId || filters.ageingBucket;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exception Queue</h1>
          <div className="page-subtitle">
            {filteredResult.total} exception{filteredResult.total !== 1 ? 's' : ''} · Sorted by Risk Score (highest first)
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => { loadAll(); }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => doExport('csv')}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => doExport('json')}>
            <Download size={13} /> Export JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={15} />
          {error}
          <button className="btn btn-ghost btn-sm" onClick={clearError} style={{ marginLeft: 'auto' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={14} className="search-bar-icon" />
          <input
            id="exception-search"
            type="text"
            className="form-input"
            placeholder="Search ID, supplier, material, document…"
            value={filters.search}
            onChange={(e) => applyFilters({ search: e.target.value, page: 1 })}
          />
        </div>

        <button
          id="filter-toggle"
          className={`btn btn-secondary btn-sm ${showFilters ? 'btn-primary' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={13} /> Filters {hasActiveFilters ? '●' : ''}
        </button>

        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            <X size={13} /> Clear
          </button>
        )}

        {/* Quick status filters */}
        <div className="queue-quick-status">
          {(['', 'Open', 'Under Review', 'Assigned', 'Pending Approval', 'Resolved'] as const).map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filters.status === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => applyFilters({ status: s as any, page: 1 })}
              style={{ fontSize: 11, padding: '3px 10px', whiteSpace: 'nowrap' }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
          padding: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          marginBottom: 16,
        }}>
          <div>
            <label className="form-label">Priority</label>
            <select className="form-select" value={filters.priority}
              onChange={(e) => applyFilters({ priority: e.target.value as any, page: 1 })}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Exception Type</label>
            <select className="form-select" value={filters.exceptionType}
              onChange={(e) => applyFilters({ exceptionType: e.target.value as any, page: 1 })}>
              <option value="">All Types</option>
              {EXCEPTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Supplier</label>
            <select className="form-select" value={filters.supplierId}
              onChange={(e) => applyFilters({ supplierId: e.target.value, page: 1 })}>
              <option value="">All Suppliers</option>
              {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Owner</label>
            <select className="form-select" value={filters.ownerId}
              onChange={(e) => applyFilters({ ownerId: e.target.value, page: 1 })}>
              <option value="">All Owners</option>
              {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Ageing</label>
            <select className="form-select" value={filters.ageingBucket}
              onChange={(e) => applyFilters({ ageingBucket: e.target.value as any, page: 1 })}>
              <option value="">All Ageing</option>
              {AGEING_BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Page Size</label>
            <select className="form-select" value={filters.pageSize}
              onChange={(e) => applyFilters({ pageSize: Number(e.target.value), page: 1 })}>
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner spinner-lg" />
            <span>Loading exceptions…</span>
          </div>
        ) : (
          <>
            <div className="table-wrapper desktop-only-table">
              <table>
                <thead>
                  <tr>
                    <th>Exception ID</th>
                    <th>Supplier</th>
                    <th>Document / Invoice</th>
                    <th>PO</th>
                    <th>Exception Type</th>
                    <th>CC</th>
                    <th className={`sortable ${filters.sortField === 'financialExposure' ? 'sorted' : ''}`}
                      onClick={() => handleSort('financialExposure')}>
                      Amount <span className="sort-icon"><SortIcon field="financialExposure" /></span>
                    </th>
                    <th>Priority</th>
                    <th className={`sortable ${filters.sortField === 'riskScore' ? 'sorted' : ''}`}
                      onClick={() => handleSort('riskScore')}>
                      Risk <span className="sort-icon"><SortIcon field="riskScore" /></span>
                    </th>
                    <th className={`sortable ${filters.sortField === 'ageingDays' ? 'sorted' : ''}`}
                      onClick={() => handleSort('ageingDays')}>
                      Ageing <span className="sort-icon"><SortIcon field="ageingDays" /></span>
                    </th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResult.data.length === 0 ? (
                    <tr>
                      <td colSpan={14}>
                        <div className="table-empty">
                          <div className="table-empty-icon">📋</div>
                          <div>No exceptions match your filters</div>
                          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={resetFilters}>Clear filters</button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResult.data.map((exc) => {
                    const supplier = MOCK_SUPPLIERS.find(s => s.id === exc.supplierId);
                    const owner = MOCK_USERS.find(u => u.id === exc.ownerId);
                    const statusClass = exc.status.replace(/ /g, '-').toLowerCase();

                    return (
                      <tr key={exc.id} onClick={() => navigate(`/exceptions/${exc.id}`)}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-link)', fontWeight: 600 }}>
                            {exc.id}
                          </span>
                        </td>
                        <td style={{ maxWidth: 140 }}>
                          <span className="truncate" style={{ display: 'block', maxWidth: 130, fontSize: 12 }}>
                            {supplier?.name ?? exc.supplierId}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, fontFamily: 'monospace' }}>{exc.documentReference}</td>
                        <td style={{ fontSize: 11, fontFamily: 'monospace' }}>{exc.poId}</td>
                        <td style={{ maxWidth: 160 }}>
                          <span className="truncate" style={{ display: 'block', maxWidth: 150, fontSize: 11 }}>
                            {exc.exceptionType}
                          </span>
                        </td>
                        <td><span style={{ fontSize: 11, fontWeight: 600 }}>{exc.companyCode}</span></td>
                        <td style={{ fontWeight: 600, fontSize: 12 }}>
                          {exc.financialExposure > 0 ? formatCurrency(exc.financialExposure, exc.currency) : '—'}
                        </td>
                        <td>
                          <span className={`badge badge-priority-${exc.priority.toLowerCase()}`}>
                            {exc.priority}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 32,
                              height: 6,
                              background: 'var(--bg-surface)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${exc.riskScore}%`,
                                height: '100%',
                                background: exc.riskScore >= 85 ? '#ef4444' : exc.riskScore >= 65 ? '#f97316' : exc.riskScore >= 40 ? '#eab308' : '#22c55e',
                                borderRadius: 3,
                              }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600 }}>{exc.riskScore}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: exc.ageingDays > 60 ? '#dc2626' : exc.ageingDays > 30 ? '#ea580c' : exc.ageingDays > 15 ? '#d97706' : 'var(--text-primary)',
                          }}>
                            {exc.ageingDays}d
                          </span>
                        </td>
                        <td style={{ fontSize: 11 }}>{owner?.name ?? <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                        <td>
                          <span className={`badge badge-status-${statusClass}`}>
                            <span className="badge-dot" style={{ background: STATUS_COLORS[exc.status] }} />
                            {exc.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 11 }}>{formatDate(exc.createdDate)}</td>
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

            {/* Mobile-Friendly Cards View */}
            <div className="mobile-only-cards" style={{ padding: 12 }}>
              {filteredResult.data.length === 0 ? (
                <div className="table-empty">
                  <div className="table-empty-icon">📋</div>
                  <div>No exceptions match your filters</div>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={resetFilters}>Clear filters</button>
                </div>
              ) : (
                filteredResult.data.map((exc) => {
                  const supplier = MOCK_SUPPLIERS.find(s => s.id === exc.supplierId);
                  return (
                    <div
                      key={exc.id}
                      className="mobile-record-card"
                      onClick={() => navigate(`/exceptions/${exc.id}`)}
                    >
                      <div className="mobile-record-header">
                        <span className="mobile-record-id">{exc.id}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span className={`badge badge-priority-${exc.priority.toLowerCase()}`}>
                            {exc.priority}
                          </span>
                          <span className={`badge badge-status-${exc.status.replace(/ /g, '-').toLowerCase()}`}>
                            {exc.status}
                          </span>
                        </div>
                      </div>

                      <div className="mobile-record-title">{exc.exceptionType}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span>🏢 {supplier?.name ?? exc.supplierId}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>PO: {exc.poId}</span>
                      </div>

                      <div className="mobile-record-footer">
                        <div className="mobile-record-exposure">
                          <span style={{ color: 'var(--text-muted)', fontSize: 11, marginRight: 4 }}>Exposure:</span>
                          <strong>{exc.financialExposure > 0 ? formatCurrency(exc.financialExposure, exc.currency) : '£0.00'}</strong>
                        </div>
                        <div className="mobile-record-meta">
                          <span style={{ fontSize: 11, color: exc.ageingDays > 30 ? 'var(--color-error)' : 'var(--text-muted)' }}>
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
                })
              )}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">
                Showing {((filters.page - 1) * filters.pageSize) + 1}–
                {Math.min(filters.page * filters.pageSize, filteredResult.total)} of {filteredResult.total} exceptions
              </span>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => applyFilters({ page: filters.page - 1 })}
                  disabled={filters.page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: filteredResult.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${filters.page === p ? 'active' : ''}`}
                    onClick={() => applyFilters({ page: p })}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={() => applyFilters({ page: filters.page + 1 })}
                  disabled={filters.page >= filteredResult.totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
