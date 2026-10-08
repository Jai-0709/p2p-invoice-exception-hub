// ============================================================
// Utility Functions – Formatting, Dates, Currency
// ============================================================

import { format, differenceInDays, parseISO, isAfter } from 'date-fns';
import { AgeingBucket, ExceptionPriority, RiskLevel } from '../types';

export const DEMO_TODAY = new Date('2026-10-08');

// ── Currency ─────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'GBP'): string {
  const symbols: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };
  const sym = symbols[currency] ?? currency;
  return `${sym}${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Date ──────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm');
  } catch {
    return dateStr;
  }
}

export function calcAgeingDays(dateStr: string): number {
  try {
    return differenceInDays(DEMO_TODAY, parseISO(dateStr));
  } catch {
    return 0;
  }
}

export function getAgeingBucket(days: number): AgeingBucket {
  if (days <= 7) return '0-7 days';
  if (days <= 15) return '8-15 days';
  if (days <= 30) return '16-30 days';
  if (days <= 60) return '31-60 days';
  return '60+ days';
}

export function isSLABreached(dueDateStr: string): boolean {
  try {
    return isAfter(DEMO_TODAY, parseISO(dueDateStr));
  } catch {
    return false;
  }
}

// ── SLA days by priority ──────────────────────────────────────
export const SLA_DAYS: Record<ExceptionPriority, number> = {
  Critical: 2,
  High: 5,
  Medium: 10,
  Low: 30,
};

// ── Priority badge colours ────────────────────────────────────
export const PRIORITY_COLORS: Record<ExceptionPriority, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

// ── Truncation ────────────────────────────────────────────────
export function truncate(str: string, max = 40): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '…';
}

// ── Number formatting ─────────────────────────────────────────
export function formatNumber(n: number): string {
  return n.toLocaleString('en-GB');
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── Risk score colour ─────────────────────────────────────────
export function riskScoreColor(score: number): string {
  if (score >= 85) return '#ef4444';
  if (score >= 65) return '#f97316';
  if (score >= 40) return '#eab308';
  return '#22c55e';
}

// ── Status badge colour ───────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  Open: '#3b82f6',
  'Under Review': '#8b5cf6',
  Assigned: '#f59e0b',
  'Pending Approval': '#f97316',
  Resolved: '#22c55e',
  Rejected: '#ef4444',
  Reopened: '#06b6d4',
};

export const AGEING_COLORS: Record<AgeingBucket, string> = {
  '0-7 days': '#22c55e',
  '8-15 days': '#84cc16',
  '16-30 days': '#eab308',
  '31-60 days': '#f97316',
  '60+ days': '#ef4444',
};
