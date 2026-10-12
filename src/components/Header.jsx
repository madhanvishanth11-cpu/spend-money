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
        <div className="hidden sm:flex items-center text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2 animate-pulse"></span>
          Live Database (INR)
        </div>

        <button
          onClick={() => {
            const event = new CustomEvent('spendwise_open_install');
            window.dispatchEvent(event);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 transition-all active:scale-[0.98]"
          title="Install SpendWise app on your phone or computer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Install App</span>
        </button>

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
