// ============================================================
// Store – Exceptions (Zustand)
// ============================================================

import { create } from 'zustand';
import { Exception, ExceptionFilters, ExceptionStatus } from '../types';
import {
  getAllExceptions,
  filterExceptions,
  getExceptionById,
  changeStatus,
  assignException,
  addComment,
  getComments,
  getAuditEntries,
  getDashboardKPIs,
  exportToCSV,
} from '../services/exceptionService';
import { Comment, AuditEntry, DashboardKPIs } from '../types';

interface ExceptionState {
  exceptions: Exception[];
  filteredResult: { data: Exception[]; total: number; totalPages: number };
  selectedExceptionId: string | null;
  selectedException: Exception | null;
  comments: Comment[];
  auditEntries: AuditEntry[];
  kpis: DashboardKPIs | null;
  isLoading: boolean;
  error: string | null;
  filters: ExceptionFilters;

  // Actions
  loadAll: () => void;
  applyFilters: (filters: Partial<ExceptionFilters>) => void;
  selectException: (id: string) => void;
  clearSelection: () => void;
  doChangeStatus: (id: string, newStatus: ExceptionStatus, userId: string, note?: string) => void;
  doAssign: (id: string, ownerId: string, assignedBy: string) => void;
  doAddComment: (exceptionId: string, userId: string, text: string) => void;
  loadComments: (exceptionId: string) => void;
  loadAuditEntries: (exceptionId: string) => void;
  loadKPIs: () => void;
  doExport: (format: 'csv' | 'json') => void;
  clearError: () => void;
}

const DEFAULT_FILTERS: ExceptionFilters = {
  search: '',
  status: '',
  priority: '',
  supplierId: '',
  exceptionType: '',
  ownerId: '',
  ageingBucket: '',
  sortField: 'riskScore',
  sortDirection: 'desc',
  page: 1,
  pageSize: 10,
};

export const useExceptionStore = create<ExceptionState>((set, get) => ({
  exceptions: [],
  filteredResult: { data: [], total: 0, totalPages: 1 },
  selectedExceptionId: null,
  selectedException: null,
  comments: [],
  auditEntries: [],
  kpis: null,
  isLoading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  loadAll: () => {
    set({ isLoading: true });
    try {
      const all = getAllExceptions();
      const result = filterExceptions(get().filters);
      set({ exceptions: all, filteredResult: result, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load exceptions. Please refresh.', isLoading: false });
    }
  },

  applyFilters: (partial) => {
    const newFilters = { ...get().filters, ...partial, page: partial.page ?? 1 };
    const result = filterExceptions(newFilters);
    set({ filters: newFilters, filteredResult: result });
  },

  selectException: (id: string) => {
    const exc = getExceptionById(id);
    if (!exc) {
      set({ error: `Exception ${id} not found.` });
      return;
    }
    set({ selectedExceptionId: id, selectedException: exc });
    get().loadComments(id);
    get().loadAuditEntries(id);
  },

  clearSelection: () => {
    set({ selectedExceptionId: null, selectedException: null, comments: [], auditEntries: [] });
  },

  doChangeStatus: (id, newStatus, userId, note) => {
    try {
      const updated = changeStatus(id, newStatus, userId, note);
      if (!updated) { set({ error: 'Exception not found.' }); return; }
      set({ selectedException: updated });
      get().loadAll();
      get().loadAuditEntries(id);
      get().loadKPIs();
    } catch (e) {
      set({ error: 'Failed to update status. Please try again.' });
    }
  },

  doAssign: (id, ownerId, assignedBy) => {
    try {
      const updated = assignException(id, ownerId, assignedBy);
      if (!updated) { set({ error: 'Exception not found.' }); return; }
      set({ selectedException: updated });
      get().loadAll();
      get().loadAuditEntries(id);
    } catch (e) {
      set({ error: 'Failed to assign exception.' });
    }
  },

  doAddComment: (exceptionId, userId, text) => {
    if (!text.trim()) { set({ error: 'Comment cannot be empty.' }); return; }
    if (text.length > 1000) { set({ error: 'Comment must be under 1000 characters.' }); return; }
    try {
      addComment(exceptionId, userId, text);
      get().loadComments(exceptionId);
      get().loadAuditEntries(exceptionId);
    } catch (e) {
      set({ error: 'Failed to add comment.' });
    }
  },

  loadComments: (exceptionId) => {
    const comments = getComments(exceptionId);
    set({ comments });
  },

  loadAuditEntries: (exceptionId) => {
    const auditEntries = getAuditEntries(exceptionId);
    set({ auditEntries });
  },

  loadKPIs: () => {
    const kpis = getDashboardKPIs();
    set({ kpis });
  },

  doExport: (format) => {
    const { exceptions } = get();
    if (format === 'csv') {
      const csv = exportToCSV(exceptions);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `p2p-exceptions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify(exceptions, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `p2p-exceptions-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },

  clearError: () => set({ error: null }),
}));
