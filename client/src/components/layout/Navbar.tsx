import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, LogIn, UserPlus, Sparkles, LogOut, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { StatusBadge } from '@/components/common/StatusBadge';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isServerConnected, isDbConnected, apiLatencyMs } = useAppStore();
  const { user, isAuthenticated, logout, loginAsGuest, isLoading } = useAuthStore();

  const handleGuestQuickStart = async () => {
    try {
      await loginAsGuest();
      navigate('/dashboard');
    } catch {
      // Handled in store
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate">
                  TaskFlow
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hidden sm:inline-block shrink-0">
                  SaaS Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Real-Time Kanban & Guest Access
              </p>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Overview
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section: Diagnostics + Auth Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Status Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <StatusBadge
              label="API"
              status={isServerConnected ? 'connected' : 'disconnected'}
              detail={apiLatencyMs ? `${apiLatencyMs}ms` : null}
            />
            <StatusBadge
              label="DB"
              status={isDbConnected ? 'connected' : 'disconnected'}
            />
          </div>

          {/* Quick Dashboard link for mobile if authenticated */}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors md:hidden"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            </Link>
          )}

          {/* Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs text-slate-950 shadow-md ring-2 ring-slate-800 shrink-0"
                  style={{ backgroundColor: user.avatarColor || '#06b6d4' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white max-w-[100px] md:max-w-[140px] truncate">
                      {user.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        user.isGuest
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {user.isGuest ? 'Guest' : 'Member'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleGuestQuickStart}
                disabled={isLoading}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Try Demo</span>
              </button>

              <Link
                to="/login"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
