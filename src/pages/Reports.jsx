import React, { useMemo } from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/formatters';
import { Header } from '../components/Header';

export const Reports = () => {
  const { transactions, categories, totalIncome, totalExpenses, netSavings } = useFinance();

  // Category-wise expense breakdown (excluding transfers)
  const categoryExpenses = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = t.category?.name || categories.find((c) => c.id === t.category_id)?.name || 'Uncategorized';
        map[catName] = (map[catName] || 0) + Number(t.amount || 0);
      });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, totalExpenses]);

  // Payment method breakdown
  const paymentMethodExpenses = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const method = (t.payment_method || 'other').toLowerCase();
        map[method] = (map[method] || 0) + Number(t.amount || 0);
      });

    return Object.entries(map).map(([method, amount]) => ({
      method,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
    }));
  }, [transactions, totalExpenses]);

  // Color generator for category progress bars
  const colors = [
    'bg-emerald-600',
    'bg-teal-500',
    'bg-sky-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-slate-400'
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Financial Reports & Analytics"
        subtitle="Calculated spending habits and category breakdowns from your database"
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Inflow Recorded
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {formatINR(totalIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all income deposits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Outflow Recorded
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {formatINR(totalExpenses)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all debit expenditures</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Surplus (Savings)
          </span>
          <div className={`text-2xl font-bold mt-2 ${netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatINR(netSavings)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0}% retained
          </p>
        </div>
      </div>

      {/* Two Column Layout: Categories & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Expenses by Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">Where your money was allocated</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {categoryExpenses.length} categories
            </span>
          </div>

          {categoryExpenses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No expenses logged yet in database.</p>
          ) : (
            <div className="space-y-4">
              {categoryExpenses.map((cat, idx) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                      {cat.category}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {formatINR(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Spending by Payment Channel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Share of UPI, Cards, Net Banking & Cash</p>
              </div>
            </div>

            {paymentMethodExpenses.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No transactions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {paymentMethodExpenses.map((pm) => {
                  const getLabel = (m) => {
                    if (m === 'upi') return { name: 'UPI (GPay / PhonePe / Paytm)', icon: Smartphone };
                    if (m === 'card') return { name: 'Debit & Credit Cards', icon: CreditCard };
                    if (m === 'bank transfer' || m === 'bank-transfer') return { name: 'Net Banking / IMPS', icon: Building2 };
                    if (m === 'cash') return { name: 'Physical Cash', icon: Banknote };
                    return { name: 'Other Methods', icon: Building2 };
                  };
                  const info = getLabel(pm.method);
                  const Icon = info.icon;

                  return (
                    <div
                      key={pm.method}
                      className="p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{info.name}</p>
                          <p className="text-[11px] text-slate-400">{pm.percentage}% of total expenses</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatINR(pm.amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
            💡 Calculated directly from user-isolated database records in Supabase.
          </div>
        </div>
      </div>
    </div>
  );
};
