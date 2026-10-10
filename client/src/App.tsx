import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { BoardPage } from '@/pages/BoardPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/lib/api';

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const { setConnectionStatus } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Global Health & Connectivity Ping (keeps API & DB indicators live everywhere)
  useEffect(() => {
    const pingHealth = async () => {
      const startTime = performance.now();
      try {
        const res = await api.get('/health');
        const latency = Math.round(performance.now() - startTime);
        setConnectionStatus({
          isServerConnected: true,
          isDbConnected: res.data?.database?.status === 'connected',
          apiLatencyMs: latency,
        });
      } catch {
        setConnectionStatus({
          isServerConnected: false,
          isDbConnected: false,
          apiLatencyMs: null,
        });
      }
    };

    pingHealth();
    const interval = setInterval(pingHealth, 20000); // 20s heartbeat
    return () => clearInterval(interval);
  }, [setConnectionStatus]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/:id"
              element={
                <ProtectedRoute>
                  <BoardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
