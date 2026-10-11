import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Wallet,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const MobileNav = () => {
  const { activeScreen, setActiveScreen, setEditingTransaction } = useFinance();
  const { signOut } = useAuth();

  const handleNav = (screen) => {
    if (screen === 'add-transaction') {
      setEditingTransaction(null);
    }
    setActiveScreen(screen);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 px-3 py-2 flex items-center justify-around shadow-lg shadow-slate-900/5">
      <button
        onClick={() => handleNav('dashboard')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          activeScreen === 'dashboard' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => handleNav('transactions')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          activeScreen === 'transactions' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <Receipt className="w-5 h-5" />
        <span>History</span>
      </button>

      {/* Floating Add Action */}
      <button
        onClick={() => handleNav('add-transaction')}
        className="flex flex-col items-center justify-center -mt-6 w-12 h-12 rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
        aria-label="Add transaction"
      >
        <PlusCircle className="w-6 h-6 stroke-[2.2]" />
      </button>

      <button
        onClick={() => handleNav('accounts')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          activeScreen === 'accounts' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <Wallet className="w-5 h-5" />
        <span>Accounts</span>
      </button>

      <button
        onClick={() => handleNav('reports')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
          activeScreen === 'reports' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span>Reports</span>
      </button>
    </div>
  );
};
