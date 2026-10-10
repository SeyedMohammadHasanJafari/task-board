import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono tracking-wider">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isGuestQuery = location.search.includes('guest=true');
    return (
      <Navigate
        to={isGuestQuery ? `/login${location.search}` : '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};
