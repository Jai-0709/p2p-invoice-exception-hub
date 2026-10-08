// ============================================================
// Service – Exception Repository
// Central data access layer – replace mock arrays with OData
// calls in production without changing any UI components
// ============================================================

import { Exception, ExceptionFilters, ExceptionStatus, DashboardKPIs } from '../types';
import { MOCK_EXCEPTIONS } from '../data/exceptions';
import { MOCK_COMMENTS } from '../data/auditLog';
import { MOCK_AUDIT_ENTRIES } from '../data/auditLog';
import { MOCK_USERS } from '../data/users';

let _exceptions: Exception[] = [...MOCK_EXCEPTIONS];

// ── Read ──────────────────────────────────────────────────────
export function getAllExceptions(): Exception[] {
  return [..._exceptions];
}

export function getExceptionById(id: string): Exception | undefined {
  return _exceptions.find((e) => e.id === id);
}

export function filterExceptions(filters: ExceptionFilters): {
  data: Exception[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  let result = [..._exceptions];

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.documentReference.toLowerCase().includes(q) ||
        e.material.toLowerCase().includes(q) ||
        e.exceptionType.toLowerCase().includes(q) ||
        e.supplierId.toLowerCase().includes(q) ||
        e.poId.toLowerCase().includes(q) ||
        e.invoiceId.toLowerCase().includes(q)
    );
  }

  if (filters.status) result = result.filter((e) => e.status === filters.status);
  if (filters.priority) result = result.filter((e) => e.priority === filters.priority);
  if (filters.supplierId) result = result.filter((e) => e.supplierId === filters.supplierId);
  if (filters.exceptionType) result = result.filter((e) => e.exceptionType === filters.exceptionType);
  if (filters.ownerId) result = result.filter((e) => e.ownerId === filters.ownerId);
  if (filters.ageingBucket) result = result.filter((e) => e.ageingBucket === filters.ageingBucket);

  // Sort
  const dir = filters.sortDirection === 'asc' ? 1 : -1;
  result.sort((a, b) => {
    const aVal = a[filters.sortField];
    const bVal = b[filters.sortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal ?? '').localeCompare(String(bVal ?? '')) * dir;
  });

  const total = result.length;
  const totalPages = Math.ceil(total / filters.pageSize);
  const start = (filters.page - 1) * filters.pageSize;
  const data = result.slice(start, start + filters.pageSize);

  return { data, total, page: filters.page, pageSize: filters.pageSize, totalPages };
}

// ── Write ─────────────────────────────────────────────────────
export function updateException(id: string, patch: Partial<Exception>): Exception | null {
  const idx = _exceptions.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  _exceptions[idx] = { ..._exceptions[idx], ...patch, updatedDate: new Date().toISOString() };
  return _exceptions[idx];
}

export function changeStatus(
  id: string,
  newStatus: ExceptionStatus,
  userId: string,
  note?: string
): Exception | null {
  const exc = getExceptionById(id);
  if (!exc) return null;

  const patch: Partial<Exception> = { status: newStatus };
  if (newStatus === 'Resolved') {
    patch.resolvedDate = new Date().toISOString();
    patch.resolutionNote = note;
    patch.financialExposure = 0;
  }

  // Add audit entry
  MOCK_AUDIT_ENTRIES.push({
    id: `AUD-${Date.now()}`,
    exceptionId: id,
    userId,
    action: newStatus === 'Resolved' ? 'Resolved' : 'Status Changed',
    description: `Status changed from ${exc.status} to ${newStatus}${note ? '. Note: ' + note : ''}.`,
    timestamp: new Date().toISOString(),
    previousValue: exc.status,
    newValue: newStatus,
  });

  return updateException(id, patch);
}

export function assignException(id: string, ownerId: string, assignedBy: string): Exception | null {
  const exc = getExceptionById(id);
  if (!exc) return null;

  MOCK_AUDIT_ENTRIES.push({
    id: `AUD-${Date.now()}`,
    exceptionId: id,
    userId: assignedBy,
    action: 'Assigned',
    description: `Exception assigned to ${MOCK_USERS.find((u) => u.id === ownerId)?.name ?? ownerId}.`,
    timestamp: new Date().toISOString(),
    previousValue: exc.ownerId ?? 'Unassigned',
    newValue: ownerId,
  });

  return updateException(id, {
    ownerId,
    assignedDate: new Date().toISOString(),
    status: exc.status === 'Open' ? 'Assigned' : exc.status,
  });
}

export function addComment(exceptionId: string, userId: string, text: string): void {
  const newComment = {
    id: `CMT-${Date.now()}`,
    exceptionId,
    userId,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    edited: false,
  };
  MOCK_COMMENTS.push(newComment);

  MOCK_AUDIT_ENTRIES.push({
    id: `AUD-${Date.now()}`,
    exceptionId,
    userId,
    action: 'Comment Added',
    description: `Comment added: "${text.slice(0, 80)}${text.length > 80 ? '…' : ''}"`,
    timestamp: new Date().toISOString(),
  });
}

// ── Comments / Audit ─────────────────────────────────────────
export function getComments(exceptionId: string) {
  return MOCK_COMMENTS.filter((c) => c.exceptionId === exceptionId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function getAuditEntries(exceptionId: string) {
  return MOCK_AUDIT_ENTRIES.filter((a) => a.exceptionId === exceptionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── Dashboard KPIs ────────────────────────────────────────────
export function getDashboardKPIs(): DashboardKPIs {
  const all = _exceptions;
  const open = all.filter((e) => e.status !== 'Resolved' && e.status !== 'Rejected');
  const critical = all.filter((e) => e.priority === 'Critical' && e.status !== 'Resolved');
  const overdue = all.filter((e) => e.slaBreached && e.status !== 'Resolved' && e.status !== 'Rejected');
  const resolved = all.filter((e) => e.status === 'Resolved');

  const totalExposure = open.reduce((s, e) => s + e.financialExposure, 0);

  // Avg resolution days (only resolved)
  const avgResolution =
    resolved.length > 0
      ? resolved.reduce((s, e) => {
          const days =
            e.resolvedDate && e.createdDate
              ? Math.max(
                  0,
                  Math.round(
                    (new Date(e.resolvedDate).getTime() - new Date(e.createdDate).getTime()) /
                      86400000
                  )
                )
              : 0;
          return s + days;
        }, 0) / resolved.length
      : 0;

  const slaAdherence =
    all.length > 0
      ? ((all.length - overdue.length) / all.length) * 100
      : 100;

  return {
    totalExceptions: all.length,
    openExceptions: open.length,
    criticalExceptions: critical.length,
    overdueExceptions: overdue.length,
    totalFinancialExposure: totalExposure,
    avgResolutionDays: Math.round(avgResolution),
    slaAdherencePct: Math.round(slaAdherence * 10) / 10,
    firstPassYieldPct: 68.5,   // Historical metric (realistic demo value)
    recurrenceRatePct: 12.3,   // Historical metric
  };
}

// ── Export ────────────────────────────────────────────────────
export function exportToCSV(exceptions: Exception[]): string {
  const headers = [
    'ID', 'Exception Type', 'Status', 'Priority', 'Risk Score',
    'Supplier ID', 'PO', 'Invoice', 'Company Code', 'Material',
    'Financial Exposure', 'Currency', 'Ageing Days', 'SLA Breached',
    'Owner', 'Created Date', 'Document Reference',
  ];

  const rows = exceptions.map((e) => [
    e.id, e.exceptionType, e.status, e.priority, e.riskScore,
    e.supplierId, e.poId, e.invoiceId, e.companyCode, e.material,
    e.financialExposure, e.currency, e.ageingDays, e.slaBreached,
    e.ownerId ?? '', e.createdDate, e.documentReference,
  ]);

  return [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
}
