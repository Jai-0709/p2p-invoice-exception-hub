// ============================================================
// App.tsx – Root Router
// ============================================================

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useExceptionStore } from './store/exceptionStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExceptionQueuePage } from './pages/ExceptionQueuePage';
import { ExceptionDetailPage } from './pages/ExceptionDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AppShell } from './components/layout/AppShell';

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ── App ───────────────────────────────────────────────────────
function App() {
  const { isAuthenticated } = useAuthStore();
  const { loadAll, loadKPIs } = useExceptionStore();

  // Preload data on auth
  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
      loadKPIs();
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-normal)',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/exceptions" element={<ExceptionQueuePage />} />
                  <Route path="/exceptions/:id" element={<ExceptionDetailPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={
                    <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                      <h2 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>Page Not Found</h2>
                      <p>The page you're looking for doesn't exist.</p>
                      <a href="/dashboard" style={{ display: 'inline-block', marginTop: 16, color: 'var(--text-link)' }}>← Back to Dashboard</a>
                    </div>
                  } />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
