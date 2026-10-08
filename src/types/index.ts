// ============================================================
// P2P Invoice Exception Resolution – Type Definitions
// SAP S/4HANA OData-compatible shape
// ============================================================

export type ExceptionStatus =
  | 'Open'
  | 'Under Review'
  | 'Assigned'
  | 'Pending Approval'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export type ExceptionPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ExceptionType =
  | 'PO/Invoice Quantity Mismatch'
  | 'PO/Invoice Price Mismatch'
  | 'Goods Receipt Missing'
  | 'Supplier Master Data Missing'
  | 'Approval Pending'
  | 'Duplicate Invoice'
  | 'Incorrect Company Code'
  | 'Payment Block'
  | 'Tax/Amount Mismatch';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type AgeingBucket =
  | '0-7 days'
  | '8-15 days'
  | '16-30 days'
  | '31-60 days'
  | '60+ days';

export type UserRole =
  | 'AP Clerk'
  | 'AP Manager'
  | 'Procurement Manager'
  | 'Finance Controller'
  | 'Admin';

export type AuditAction =
  | 'Created'
  | 'Viewed'
  | 'Assigned'
  | 'Status Changed'
  | 'Comment Added'
  | 'Approved'
  | 'Rejected'
  | 'Resolved'
  | 'Reopened'
  | 'AI Recommendation Accepted'
  | 'AI Recommendation Rejected'
  | 'AI Recommendation Edited'
  | 'Exported';

export type P2PStage =
  | 'Purchase Requisition'
  | 'Purchase Order'
  | 'Goods Receipt'
  | 'Invoice Receipt'
  | 'Three-Way Matching'
  | 'Exception Detection'
  | 'Investigation'
  | 'Assignment / Approval'
  | 'Resolution'
  | 'Payment';

// ── User / Auth ──────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string; // initials
  password: string; // hashed in prod; plaintext for demo only
}

// ── Supplier ─────────────────────────────────────────────────
export interface Supplier {
  id: string;                 // SAP BP number
  name: string;
  accountGroup: string;
  country: string;
  city: string;
  paymentTerms: string;
  currency: string;
  taxNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bankAccount: string;
  rating: 'A' | 'B' | 'C' | 'D';
  masterDataComplete: boolean;
  createdDate: string;
}

// ── Purchase Order ────────────────────────────────────────────
export interface POLineItem {
  lineNumber: number;
  material: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  deliveryDate: string;
  plantCode: string;
  storageLocation: string;
  costCentre: string;
}

export interface PurchaseOrder {
  id: string;                 // PO number
  supplierId: string;
  companyCode: string;
  plant: string;
  documentDate: string;
  deliveryDate: string;
  status: 'Open' | 'Partially Delivered' | 'Closed' | 'Cancelled';
  currency: string;
  totalAmount: number;
  lineItems: POLineItem[];
  createdBy: string;
  approvedBy: string;
}

// ── Goods Receipt ─────────────────────────────────────────────
export interface GRLineItem {
  lineNumber: number;
  material: string;
  materialDescription: string;
  quantityReceived: number;
  unit: string;
  receiptDate: string;
  batchNumber: string;
  storageLocation: string;
  qualityStatus: 'Passed' | 'Failed' | 'Pending';
}

export interface GoodsReceipt {
  id: string;                 // GR / MIGO document number
  poId: string;
  supplierId: string;
  companyCode: string;
  plant: string;
  postingDate: string;
  deliveryNote: string;
  status: 'Posted' | 'Reversed' | 'Partial';
  lineItems: GRLineItem[];
  receivedBy: string;
}

// ── Invoice ───────────────────────────────────────────────────
export interface InvoiceLineItem {
  lineNumber: number;
  material: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
}

export interface Invoice {
  id: string;                 // SAP document number
  supplierInvoiceNumber: string;
  supplierId: string;
  poId: string;
  grId?: string;
  companyCode: string;
  invoiceDate: string;
  postingDate: string;
  dueDate: string;
  currency: string;
  grossAmount: number;
  netAmount: number;
  taxAmount: number;
  paymentTerms: string;
  paymentBlock?: string;
  status: 'Open' | 'Parked' | 'Posted' | 'Paid' | 'Blocked' | 'Cancelled';
  lineItems: InvoiceLineItem[];
}

// ── Three-Way Match ───────────────────────────────────────────
export interface ThreeWayMatchResult {
  exceptionId: string;
  poLineItem: POLineItem;
  grLineItem?: GRLineItem;
  invoiceLineItem: InvoiceLineItem;
  quantityMatch: boolean;
  priceMatch: boolean;
  amountMatch: boolean;
  quantityVariance: number;
  priceVariance: number;
  amountVariance: number;
  quantityVariancePct: number;
  priceVariancePct: number;
  amountVariancePct: number;
  overallStatus: 'Matched' | 'Partial Match' | 'Mismatch' | 'GR Missing';
}

// ── Exception ─────────────────────────────────────────────────
export interface Exception {
  id: string;                 // EXC-XXXXXX
  exceptionType: ExceptionType;
  status: ExceptionStatus;
  priority: ExceptionPriority;
  riskScore: number;          // 0–100
  riskLevel: RiskLevel;
  ageingDays: number;
  ageingBucket: AgeingBucket;
  financialExposure: number;
  currency: string;

  // SAP document references
  supplierId: string;
  poId: string;
  grId?: string;
  invoiceId: string;
  companyCode: string;
  plant: string;
  storageLocation: string;
  costCentre: string;
  material: string;
  documentReference: string;  // original doc reference e.g. SO-460025

  // Dates
  createdDate: string;
  updatedDate: string;
  resolvedDate?: string;
  dueDate: string;            // SLA deadline
  slaBreached: boolean;

  // Assignment
  ownerId?: string;
  assignedDate?: string;

  // Resolution
  resolutionNote?: string;
  resolutionCategory?: string;

  // P2P process stage where exception was detected
  detectedAtStage: P2PStage;

  // Recommended action (rule-based)
  recommendedAction: string;

  // AI insight (mock)
  aiSummary?: string;
  aiRecommendation?: string;
  aiEvidence?: string[];
  aiRecommendationStatus?: 'Pending' | 'Accepted' | 'Edited' | 'Rejected';
}

// ── Comment ───────────────────────────────────────────────────
export interface Comment {
  id: string;
  exceptionId: string;
  userId: string;
  text: string;
  timestamp: string;
  edited: boolean;
}

// ── Audit Trail ───────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  exceptionId: string;
  userId: string;
  action: AuditAction;
  description: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, string>;
}

// ── Notification ─────────────────────────────────────────────
export interface AppNotification {
  id: string;
  userId: string;
  exceptionId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

// ── Dashboard KPIs ────────────────────────────────────────────
export interface DashboardKPIs {
  totalExceptions: number;
  openExceptions: number;
  criticalExceptions: number;
  overdueExceptions: number;
  totalFinancialExposure: number;
  avgResolutionDays: number;
  slaAdherencePct: number;
  firstPassYieldPct: number;
  recurrenceRatePct: number;
}

// ── Filter State ──────────────────────────────────────────────
export interface ExceptionFilters {
  search: string;
  status: ExceptionStatus | '';
  priority: ExceptionPriority | '';
  supplierId: string;
  exceptionType: ExceptionType | '';
  ownerId: string;
  ageingBucket: AgeingBucket | '';
  sortField: keyof Exception;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// ── AI Service Types ──────────────────────────────────────────
export interface AIInsight {
  summary: string;
  explanation: string;
  recommendation: string;
  evidence: string[];
  confidence: number;
  generatedAt: string;
}

// ── Export ────────────────────────────────────────────────────
export interface ExportOptions {
  format: 'csv' | 'json';
  includeAuditTrail: boolean;
  includeComments: boolean;
}

// ── State Transition ──────────────────────────────────────────
export interface StatusTransition {
  from: ExceptionStatus;
  to: ExceptionStatus;
  label: string;
  requiresNote: boolean;
  requiresApproval: boolean;
  allowedRoles: UserRole[];
}
