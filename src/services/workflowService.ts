// ============================================================
// Service – Workflow (Status Transition State Machine)
// Enforces valid state transitions and role permissions
// ============================================================

import { ExceptionStatus, StatusTransition, UserRole } from '../types';

export const VALID_TRANSITIONS: StatusTransition[] = [
  {
    from: 'Open',
    to: 'Under Review',
    label: 'Start Review',
    requiresNote: false,
    requiresApproval: false,
    allowedRoles: ['AP Clerk', 'AP Manager', 'Finance Controller'],
  },
  {
    from: 'Open',
    to: 'Assigned',
    label: 'Assign',
    requiresNote: false,
    requiresApproval: false,
    allowedRoles: ['AP Manager', 'Finance Controller'],
  },
  {
    from: 'Under Review',
    to: 'Assigned',
    label: 'Assign to Owner',
    requiresNote: false,
    requiresApproval: false,
    allowedRoles: ['AP Manager', 'Finance Controller'],
  },
  {
    from: 'Under Review',
    to: 'Pending Approval',
    label: 'Submit for Approval',
    requiresNote: true,
    requiresApproval: false,
    allowedRoles: ['AP Clerk', 'AP Manager'],
  },
  {
    from: 'Assigned',
    to: 'Under Review',
    label: 'Move to Review',
    requiresNote: false,
    requiresApproval: false,
    allowedRoles: ['AP Clerk', 'AP Manager'],
  },
  {
    from: 'Assigned',
    to: 'Pending Approval',
    label: 'Submit for Approval',
    requiresNote: true,
    requiresApproval: false,
    allowedRoles: ['AP Clerk', 'AP Manager'],
  },
  {
    from: 'Assigned',
    to: 'Resolved',
    label: 'Resolve',
    requiresNote: true,
    requiresApproval: false,
    allowedRoles: ['AP Manager', 'Finance Controller'],
  },
  {
    from: 'Pending Approval',
    to: 'Resolved',
    label: 'Approve & Resolve',
    requiresNote: true,
    requiresApproval: true,
    allowedRoles: ['AP Manager', 'Finance Controller'],
  },
  {
    from: 'Pending Approval',
    to: 'Rejected',
    label: 'Reject',
    requiresNote: true,
    requiresApproval: false,
    allowedRoles: ['AP Manager', 'Finance Controller'],
  },
  {
    from: 'Pending Approval',
    to: 'Assigned',
    label: 'Return to Assignee',
    requiresNote: true,
    requiresApproval: false,
    allowedRoles: ['AP Manager', 'Finance Controller'],
  },
  {
    from: 'Rejected',
    to: 'Reopened',
    label: 'Reopen',
    requiresNote: true,
    requiresApproval: false,
    allowedRoles: ['AP Manager', 'Finance Controller', 'Admin'],
  },
  {
    from: 'Reopened',
    to: 'Under Review',
    label: 'Start Review',
    requiresNote: false,
    requiresApproval: false,
    allowedRoles: ['AP Clerk', 'AP Manager'],
  },
  {
    from: 'Resolved',
    to: 'Reopened',
    label: 'Reopen',
    requiresNote: true,
    requiresApproval: false,
    allowedRoles: ['AP Manager', 'Finance Controller', 'Admin'],
  },
];

export function getAvailableTransitions(
  currentStatus: ExceptionStatus,
  userRole: UserRole
): StatusTransition[] {
  return VALID_TRANSITIONS.filter(
    (t) => t.from === currentStatus && t.allowedRoles.includes(userRole)
  );
}

export function isTransitionValid(
  from: ExceptionStatus,
  to: ExceptionStatus,
  userRole: UserRole
): boolean {
  return VALID_TRANSITIONS.some(
    (t) =>
      t.from === from &&
      t.to === to &&
      t.allowedRoles.includes(userRole)
  );
}

export function getTransition(
  from: ExceptionStatus,
  to: ExceptionStatus
): StatusTransition | undefined {
  return VALID_TRANSITIONS.find((t) => t.from === from && t.to === to);
}

// Status display order (for UI tabs/steps)
export const STATUS_ORDER: ExceptionStatus[] = [
  'Open',
  'Under Review',
  'Assigned',
  'Pending Approval',
  'Resolved',
];
