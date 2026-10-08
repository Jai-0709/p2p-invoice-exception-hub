// ============================================================
// Store – Auth (Zustand)
// Simulated authentication with role-based access
// In production: replace with SAP BTP OAuth2 / MSAL
// ============================================================

import { create } from 'zustand';
import { User } from '../types';
import { MOCK_USERS } from '../data/users';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loginError: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  loginError: null,

  login: (email: string, password: string): boolean => {
    // Input validation
    if (!email.trim() || !password.trim()) {
      set({ loginError: 'Email and password are required.' });
      return false;
    }

    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      set({ currentUser: user, isAuthenticated: true, loginError: null });
      return true;
    }

    set({ loginError: 'Invalid credentials. Please try again.' });
    return false;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, loginError: null });
  },

  clearError: () => set({ loginError: null }),
}));
