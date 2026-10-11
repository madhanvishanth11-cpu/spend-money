import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldAlert,
  Sliders,
  Bell,
  Smartphone,
  HardDrive,
  Info,
  Check
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Header } from '../components/Header';

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
        subtitle="Manage prototype settings, currency formatting, and demo state"
      />

      {resetDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Demo financial state restored to initial default sample data.</span>
        </div>
      )}

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

      {/* Phase 1 Notice & Storage Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Architecture & Persistence Notice</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              SpendWise is currently running in <strong>Phase 1 (Frontend Demonstration & State Prototype)</strong>.
              All created transactions, accounts, and budgets are kept in browser local storage and local demo memory.
              Permanent server-side relational database persistence and cloud synchronization are scheduled for Phase 2.
            </p>
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
