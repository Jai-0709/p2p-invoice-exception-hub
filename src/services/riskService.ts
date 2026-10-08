// ============================================================
// Service – Risk Scoring
// Rule-based, transparent scoring (0–100)
// Factors: financial value, ageing, exception severity, SLA
// ============================================================

import { Exception, ExceptionPriority, ExceptionType, RiskLevel } from '../types';

// ── Severity weights per exception type ──────────────────────
const TYPE_SEVERITY: Record<ExceptionType, number> = {
  'Duplicate Invoice': 30,
  'Goods Receipt Missing': 28,
  'Incorrect Company Code': 26,
  'PO/Invoice Price Mismatch': 24,
  'PO/Invoice Quantity Mismatch': 22,
  'Tax/Amount Mismatch': 20,
  'Payment Block': 16,
  'Approval Pending': 12,
  'Supplier Master Data Missing': 18,
};

// ── Score components (max 100 total) ─────────────────────────
// Financial value: max 35 pts
// Ageing:          max 25 pts
// Exception type:  max 30 pts
// SLA breach:      max 10 pts

export function computeRiskScore(exception: Exception): number {
  let score = 0;

  // 1. Financial value (35 pts)
  const amt = exception.financialExposure;
  if (amt >= 100000) score += 35;
  else if (amt >= 50000) score += 28;
  else if (amt >= 20000) score += 20;
  else if (amt >= 10000) score += 12;
  else if (amt >= 5000) score += 6;
  else score += 2;

  // 2. Ageing (25 pts)
  const days = exception.ageingDays;
  if (days >= 60) score += 25;
  else if (days >= 30) score += 18;
  else if (days >= 15) score += 12;
  else if (days >= 8) score += 7;
  else score += 2;

  // 3. Exception type severity (30 pts)
  score += TYPE_SEVERITY[exception.exceptionType] ?? 10;

  // 4. SLA breach (10 pts)
  if (exception.slaBreached) score += 10;

  return Math.min(score, 100);
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function priorityFromScore(score: number): ExceptionPriority {
  if (score >= 85) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function getRiskScoreBreakdown(exception: Exception): Record<string, number> {
  const amt = exception.financialExposure;
  let financial = 0;
  if (amt >= 100000) financial = 35;
  else if (amt >= 50000) financial = 28;
  else if (amt >= 20000) financial = 20;
  else if (amt >= 10000) financial = 12;
  else if (amt >= 5000) financial = 6;
  else financial = 2;

  const days = exception.ageingDays;
  let ageing = 0;
  if (days >= 60) ageing = 25;
  else if (days >= 30) ageing = 18;
  else if (days >= 15) ageing = 12;
  else if (days >= 8) ageing = 7;
  else ageing = 2;

  const severity = TYPE_SEVERITY[exception.exceptionType] ?? 10;
  const sla = exception.slaBreached ? 10 : 0;

  return {
    'Financial Value (max 35)': financial,
    'Ageing (max 25)': ageing,
    'Exception Severity (max 30)': severity,
    'SLA Breach (max 10)': sla,
  };
}
