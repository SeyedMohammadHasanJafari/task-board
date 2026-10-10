import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsGuest, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const fromState = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const boardQuery = new URLSearchParams(location.search).get('board');
  const from = fromState 
    ? `${fromState.pathname}${fromState.search || ''}` 
    : boardQuery 
      ? `/board/${boardQuery}` 
      : '/dashboard';

  const handleGuestLogin = useCallback(async () => {
    clearError();
    setGuestLoading(true);
    try {
      await loginAsGuest();
      navigate(from, { replace: true });
    } catch {
      // Store maintains error state
    } finally {
      setGuestLoading(false);
    }
  }, [clearError, loginAsGuest, navigate, from]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('guest') === 'true' && !isAuthenticated) {
      handleGuestLogin();
    }
  }, [location.search, isAuthenticated, handleGuestLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Store maintains error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2 shadow-lg shadow-cyan-500/20">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-xs text-slate-400">
              Sign in to manage your boards or jump straight in as a guest
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Or Instant Demo
            </span>
          </div>

          {/* Guest Action Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading || isLoading}
            className="w-full py-3 px-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 active:scale-[0.98] cursor-pointer"
          >
            {guestLoading ? (
              <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Try Demo as Guest (No signup required)</span>
              </>
            )}
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline-offset-4 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Stateless JWT Bearer Authentication & Encrypted Passwords</span>
        </div>
      </div>
    </div>
  );
};
