// ============================================================
// Mock Data – Comments & Audit Trail
// ============================================================

import { Comment, AuditEntry } from '../types';

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'CMT-001',
    exceptionId: 'EXC-100001',
    userId: 'USR-002',
    text: 'Contacted Greenford Utilities warehouse team. They confirmed only 20 units were dispatched. Awaiting formal credit note from supplier. Estimated 3-5 business days.',
    timestamp: '2026-09-12T10:32:00Z',
    edited: false,
  },
  {
    id: 'CMT-002',
    exceptionId: 'EXC-100001',
    userId: 'USR-001',
    text: 'Escalated to procurement. Please track supplier response and update by 20-Sep. This is blocking payment run.',
    timestamp: '2026-09-14T14:15:00Z',
    edited: false,
  },
  {
    id: 'CMT-003',
    exceptionId: 'EXC-100001',
    userId: 'USR-002',
    text: 'Received email from Robert Green (Greenford Utilities) confirming credit note is being prepared. Reference: GU-CN-2026-0089.',
    timestamp: '2026-09-20T09:45:00Z',
    edited: false,
  },
  {
    id: 'CMT-004',
    exceptionId: 'EXC-100002',
    userId: 'USR-001',
    text: 'Raised price discrepancy with Fiona Clarke at Apex Industrial. She confirmed the price increase was communicated informally but no PO amendment was raised. Requesting formal documentation.',
    timestamp: '2026-08-25T11:20:00Z',
    edited: false,
  },
  {
    id: 'CMT-005',
    exceptionId: 'EXC-100002',
    userId: 'USR-003',
    text: 'PO amendment PR-4500002A raised and approved to reflect new pricing for Hydraulic Pump HYD-3 @ £1,620. Control Unit price remains disputed. Do not release payment until both lines confirmed.',
    timestamp: '2026-09-10T15:30:00Z',
    edited: false,
  },
  {
    id: 'CMT-006',
    exceptionId: 'EXC-100003',
    userId: 'USR-001',
    text: 'No GR found for PO-4500003 (Nordic Freight). Escalating to Plant Manager at 1107. This is 82 days old and SLA severely breached.',
    timestamp: '2026-10-01T08:00:00Z',
    edited: false,
  },
  {
    id: 'CMT-007',
    exceptionId: 'EXC-100005',
    userId: 'USR-001',
    text: 'Confirmed company code mismatch with Finance. Reversal document raised: REV-2026-0941. Pending Finance Controller approval to re-post under CC 2000.',
    timestamp: '2026-09-25T10:10:00Z',
    edited: false,
  },
  {
    id: 'CMT-008',
    exceptionId: 'EXC-100006',
    userId: 'USR-001',
    text: 'Duplicate confirmed against INV-9100007 (paid 31-Jul-2026, £18,720). Rejected INV-9100006 and notified Dalton Packaging. Exception resolved.',
    timestamp: '2026-10-01T16:00:00Z',
    edited: false,
  },
  {
    id: 'CMT-009',
    exceptionId: 'EXC-100007',
    userId: 'USR-004',
    text: 'Three-way match reviewed and confirmed accurate. Approving invoice for payment. Payment block Z to be removed.',
    timestamp: '2026-10-06T09:00:00Z',
    edited: false,
  },
  {
    id: 'CMT-010',
    exceptionId: 'EXC-100009',
    userId: 'USR-002',
    text: 'Contacted Robert Green re incorrect VAT rate. He acknowledged the error and is issuing a corrected invoice GU-CORR-2026-0077 at 20% VAT.',
    timestamp: '2026-09-15T11:00:00Z',
    edited: false,
  },
];

export const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
  // EXC-100001
  { id: 'AUD-001', exceptionId: 'EXC-100001', userId: 'USR-002', action: 'Created', description: 'Exception created by system during three-way match validation for invoice SO-460025.', timestamp: '2026-09-10T06:00:00Z' },
  { id: 'AUD-002', exceptionId: 'EXC-100001', userId: 'USR-001', action: 'Viewed', description: 'Exception reviewed by AP Manager Sarah Mitchell.', timestamp: '2026-09-11T09:15:00Z' },
  { id: 'AUD-003', exceptionId: 'EXC-100001', userId: 'USR-001', action: 'Assigned', description: 'Exception assigned to James Okafor (AP Clerk).', timestamp: '2026-09-12T10:00:00Z', previousValue: 'Unassigned', newValue: 'USR-002' },
  { id: 'AUD-004', exceptionId: 'EXC-100001', userId: 'USR-001', action: 'Status Changed', description: 'Status changed from Open to Under Review.', timestamp: '2026-09-12T10:05:00Z', previousValue: 'Open', newValue: 'Under Review' },
  { id: 'AUD-005', exceptionId: 'EXC-100001', userId: 'USR-002', action: 'Comment Added', description: 'James Okafor added a comment regarding supplier contact.', timestamp: '2026-09-12T10:32:00Z' },
  { id: 'AUD-006', exceptionId: 'EXC-100001', userId: 'USR-001', action: 'Comment Added', description: 'Sarah Mitchell escalated via comment.', timestamp: '2026-09-14T14:15:00Z' },
  { id: 'AUD-007', exceptionId: 'EXC-100001', userId: 'USR-002', action: 'Comment Added', description: 'Credit note reference received from supplier.', timestamp: '2026-09-20T09:45:00Z' },

  // EXC-100002
  { id: 'AUD-008', exceptionId: 'EXC-100002', userId: 'USR-002', action: 'Created', description: 'Exception created during three-way match validation for AIS-INV-2026-0892.', timestamp: '2026-08-22T06:00:00Z' },
  { id: 'AUD-009', exceptionId: 'EXC-100002', userId: 'USR-001', action: 'Assigned', description: 'Exception assigned to Sarah Mitchell (AP Manager).', timestamp: '2026-08-24T09:00:00Z' },
  { id: 'AUD-010', exceptionId: 'EXC-100002', userId: 'USR-001', action: 'Status Changed', description: 'Status changed from Open to Assigned.', timestamp: '2026-08-24T09:05:00Z', previousValue: 'Open', newValue: 'Assigned' },
  { id: 'AUD-011', exceptionId: 'EXC-100002', userId: 'USR-001', action: 'AI Recommendation Accepted', description: 'AI recommendation accepted by Sarah Mitchell.', timestamp: '2026-09-01T11:00:00Z' },

  // EXC-100003
  { id: 'AUD-012', exceptionId: 'EXC-100003', userId: 'USR-002', action: 'Created', description: 'Exception created – no GR found for invoice NFS-2026-EUR-0210.', timestamp: '2026-07-18T06:00:00Z' },

  // EXC-100006
  { id: 'AUD-013', exceptionId: 'EXC-100006', userId: 'USR-002', action: 'Created', description: 'Duplicate invoice detected. DP-2026-GL-0612 matches existing paid invoice INV-9100007.', timestamp: '2026-08-05T06:00:00Z' },
  { id: 'AUD-014', exceptionId: 'EXC-100006', userId: 'USR-001', action: 'Assigned', description: 'Assigned to Sarah Mitchell for review.', timestamp: '2026-08-06T09:00:00Z' },
  { id: 'AUD-015', exceptionId: 'EXC-100006', userId: 'USR-001', action: 'Status Changed', description: 'Status changed to Pending Approval.', timestamp: '2026-09-01T10:00:00Z', previousValue: 'Assigned', newValue: 'Pending Approval' },
  { id: 'AUD-016', exceptionId: 'EXC-100006', userId: 'USR-004', action: 'Approved', description: 'Finance Controller David Chen approved rejection of duplicate invoice.', timestamp: '2026-09-15T14:00:00Z' },
  { id: 'AUD-017', exceptionId: 'EXC-100006', userId: 'USR-001', action: 'Resolved', description: 'Exception resolved. Duplicate invoice rejected. Dalton Packaging notified.', timestamp: '2026-10-01T16:00:00Z' },
  { id: 'AUD-018', exceptionId: 'EXC-100006', userId: 'USR-001', action: 'Status Changed', description: 'Status changed to Resolved.', timestamp: '2026-10-01T16:05:00Z', previousValue: 'Pending Approval', newValue: 'Resolved' },

  // EXC-100010 (historical resolved)
  { id: 'AUD-019', exceptionId: 'EXC-100010', userId: 'USR-005', action: 'Created', description: 'Exception created during quantity verification.', timestamp: '2026-06-01T06:00:00Z' },
  { id: 'AUD-020', exceptionId: 'EXC-100010', userId: 'USR-001', action: 'Assigned', description: 'Assigned to Emma Lawson.', timestamp: '2026-06-03T09:00:00Z' },
  { id: 'AUD-021', exceptionId: 'EXC-100010', userId: 'USR-005', action: 'Resolved', description: 'Supplier credit note received and processed. Invoice adjusted. Payment released.', timestamp: '2026-08-15T10:00:00Z' },
];
