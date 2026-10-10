import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sparkles, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck, Palette } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const COLOR_OPTIONS = [
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#14b8a6', // Teal
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginAsGuest, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState(COLOR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      await register(name, email, password, avatarColor);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    clearError();
    setGuestLoading(true);
    try {
      await loginAsGuest();
      navigate('/dashboard', { replace: true });
    } catch {
      // Error handled by store
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-2 shadow-lg shadow-purple-500/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
            <p className="text-xs text-slate-400">
              Join TaskFlow to create persistent boards and invite teammates
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  minLength={2}
                  maxLength={50}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

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
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Avatar Color Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose Avatar Color</span>
                </label>
                <div
                  className="w-4 h-4 rounded-full border border-slate-700 shadow"
                  style={{ backgroundColor: avatarColor }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 p-2 bg-slate-950/50 rounded-xl border border-slate-850">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-7 h-7 rounded-full transition-all duration-150 cursor-pointer ${
                      avatarColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-purple-600/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
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

          {/* Guest Action */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading || isLoading}
            className="w-full py-3 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-[0.98] cursor-pointer"
          >
            {guestLoading ? (
              <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Try Demo as Guest (No signup required)</span>
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline-offset-4 hover:underline"
            >
              Sign In
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
