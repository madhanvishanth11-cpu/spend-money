import React, { useState } from 'react';
import {
  TrendingUp,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export const AuthScreen = () => {
  const { signIn, signUp, resetPassword, authError, setAuthError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);
    setAuthError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        const data = await signUp(email, password, displayName);
        if (data?.session) {
          setNotice({ type: 'success', message: 'Account created! Welcome to SpendWise.' });
        } else {
          setNotice({
            type: 'info',
            message: 'Account created! Please check your email to confirm your account (if email confirmation is enabled in Supabase).'
          });
        }
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setNotice({
          type: 'success',
          message: 'Password reset link sent to your email address.'
        });
      }
    } catch (err) {
      // error is already recorded in authError
    } finally {
      setIsLoading(false);
    }
  };

  // If Supabase is not configured yet, show guidance
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Supabase Configuration Required</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              SpendWise Phase 2 requires your Supabase Publishable Key to connect to your database.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">Add credentials to <code className="text-emerald-700">.env.local</code>:</p>
            <div className="font-mono text-[11px] bg-slate-100 p-3 rounded-lg border border-slate-200 text-slate-800 space-y-1">
              <div>VITE_SUPABASE_URL=https://iklrcgxxteuyoxwykxhd.supabase.co</div>
              <div>VITE_SUPABASE_PUBLISHABLE_KEY=&lt;your-key&gt;</div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Find your key under <strong>Project Settings ➔ API ➔ anon public</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-3">
          <TrendingUp className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          SpendWise
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Personal Finance & Wealth Tracker
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login' && 'Sign in to your account'}
              {mode === 'signup' && 'Create your private account'}
              {mode === 'forgot' && 'Reset your password'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login' && 'Secure personal cloud storage with Supabase'}
              {mode === 'signup' && 'Your financial records are strictly isolated to you'}
              {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {notice && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                notice.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-sky-50 border border-sky-200 text-sky-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{notice.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Madhan Vishanth"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
            {mode === 'login' && (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setNotice(null);
                    setAuthError(null);
                  }}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Create one now
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setNotice(null);
                    setAuthError(null);
                  }}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setNotice(null);
                    setAuthError(null);
                  }}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Back to login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
