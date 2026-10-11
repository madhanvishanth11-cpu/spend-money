import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldAlert,
  Sliders,
  Bell,
  Smartphone,
  HardDrive,
  Info,
  Check,
  Database,
  ExternalLink
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Header } from '../components/Header';
import { isSupabaseConfigured } from '../services/supabase';

export const Settings = () => {
  const { resetDemoData, transactions, accounts } = useFinance();
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all transactions and accounts to default sample demo state?')) {
      resetDemoData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Header
        title="Preferences & Settings"
        subtitle="Manage database connectivity, localization, and demo data state"
      />

      {resetDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Demo financial state restored to initial default sample data.</span>
        </div>
      )}

      {/* Supabase Connection Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase Cloud Database</h3>
              <p className="text-xs text-slate-500 mt-0.5">PostgreSQL backend for cloud synchronization</p>
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
            {isSupabaseConfigured
              ? 'Your project is connected to Supabase cloud database.'
              : 'Add your Supabase Project URL and Anon Key in `.env` to enable full cloud database persistence.'}
          </p>
          <div className="font-mono text-[11px] bg-slate-100 p-2.5 rounded-lg border border-slate-200 space-y-1 text-slate-800">
            <div>VITE_SUPABASE_URL=https://&lt;project-ref&gt;.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=&lt;your-anon-public-key&gt;</div>
          </div>
          <p className="text-[11px] text-slate-500">
            SQL schema file ready at <code className="text-emerald-700 font-semibold">supabase-schema.sql</code>.
          </p>
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
            <p className="text-sm font-semibold text-slate-900">Payment Rails</p>
            <p className="text-xs text-slate-500 mt-0.5">Active payment instruments</p>
          </div>
          <div className="text-xs text-slate-600 font-medium">
            UPI, Debit/Credit Cards, Net Banking, Cash
          </div>
        </div>
      </div>

      {/* Demo State Reset */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Reset Demo Data</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Discard all newly added custom transactions and restore initial sample entries
              ({transactions.length} transactions, {accounts.length} accounts currently in memory).
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo to Sample Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
