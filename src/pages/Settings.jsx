import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  Sliders,
  Bell,
  Smartphone,
  HardDrive,
  Info,
  Check,
  Database,
  ExternalLink,
  User,
  LogOut
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { isSupabaseConfigured } from '../services/supabase';

export const Settings = () => {
  const { transactions, accounts, profile, refreshData } = useFinance();
  const { user, signOut } = useAuth();
  const [syncDone, setSyncDone] = useState(false);

  const handleRefresh = async () => {
    await refreshData();
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Header
        title="Preferences & Settings"
        subtitle="Manage cloud database sync, user profile, and localization"
      />

      {syncDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Financial records synced with Supabase cloud.</span>
        </div>
      )}

      {/* User Account Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" />
          <span>User Profile</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.display_name || user?.user_metadata?.display_name || 'Authenticated User'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase Cloud Database</h3>
              <p className="text-xs text-slate-500 mt-0.5">PostgreSQL backend with Row Level Security (RLS)</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            {isSupabaseConfigured ? 'Connected' : 'Credentials Needed'}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-2">
          <p>
            Row Level Security is active. Your records ({transactions.length} transactions, {accounts.length} accounts)
            are securely isolated to your authenticated user ID.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Force Sync / Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* General Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Currency & Localization
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Currency Denomination</p>
            <p className="text-xs text-slate-500 mt-0.5">Primary currency for transaction logging</p>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
            INR (₹) - Indian Rupee
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">Number Formatting Style</p>
            <p className="text-xs text-slate-500 mt-0.5">Indian Lakhs and Crores grouping (en-IN)</p>
          </div>
          <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
            1,00,000.00
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">Supported Rails</p>
            <p className="text-xs text-slate-500 mt-0.5">Active payment instruments</p>
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Cash, UPI, Debit / Credit Cards, Net Banking / IMPS
          </div>
        </div>
      </div>
    </div>
  );
};
