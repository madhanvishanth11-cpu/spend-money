import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  Wallet,
  BarChart3,
  Target,
  Settings,
  TrendingUp,
  LogOut,
  User
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add-transaction', label: 'Add Transaction', icon: PlusCircle, highlight: true },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'accounts', label: 'Accounts', icon: Wallet },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const { activeScreen, setActiveScreen, setEditingTransaction } = useFinance();
  const { user, signOut } = useAuth();

  const handleNav = (id) => {
    if (id === 'add-transaction') {
      setEditingTransaction(null);
    }
    setActiveScreen(id);
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-5 shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-1 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
            SpendWise
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Cloud
            </span>
          </span>
          <p className="text-xs text-slate-500 font-medium">Personal Finance</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="space-y-1.5 flex-1" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs ring-1 ring-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              } ${item.highlight && !isActive ? 'text-emerald-700 hover:bg-emerald-50/50' : ''}`}
            >
              <Icon
                className={`w-4.5 h-4.5 transition-colors ${
                  isActive ? 'text-emerald-700 stroke-[2.2]' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session Footer & Logout */}
      <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
              {displayName.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
