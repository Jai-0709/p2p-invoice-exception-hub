// ============================================================
// Mock Data – Users / Auth
// In production: replace with SAP BTP IdP / OAuth 2.0
// ============================================================

import { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@harbourpine.com',
    role: 'AP Manager',
    department: 'Accounts Payable',
    avatar: 'SM',
    password: 'manager123',
  },
  {
    id: 'USR-002',
    name: 'James Okafor',
    email: 'james.okafor@harbourpine.com',
    role: 'AP Clerk',
    department: 'Accounts Payable',
    avatar: 'JO',
    password: 'clerk123',
  },
  {
    id: 'USR-003',
    name: 'Priya Sharma',
    email: 'priya.sharma@harbourpine.com',
    role: 'Procurement Manager',
    department: 'Procurement',
    avatar: 'PS',
    password: 'procure123',
  },
  {
    id: 'USR-004',
    name: 'David Chen',
    email: 'david.chen@harbourpine.com',
    role: 'Finance Controller',
    department: 'Finance',
    avatar: 'DC',
    password: 'finance123',
  },
  {
    id: 'USR-005',
    name: 'Emma Lawson',
    email: 'emma.lawson@harbourpine.com',
    role: 'AP Clerk',
    department: 'Accounts Payable',
    avatar: 'EL',
    password: 'clerk456',
  },
];
