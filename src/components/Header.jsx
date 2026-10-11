import React from 'react';
import { Plus, Bell, Search, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Header = ({ title, subtitle }) => {
  const { setActiveScreen, setEditingTransaction } = useFinance();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Demo Environment (INR)
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setActiveScreen('add-transaction');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Transaction</span>
        </button>
      </div>
    </header>
  );
};
