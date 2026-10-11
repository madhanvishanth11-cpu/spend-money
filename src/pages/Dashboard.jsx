import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  TrendingUp,
  Receipt,
  ArrowRight,
  CreditCard,
  Building2,
  Banknote,
  Smartphone
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { MONTHLY_TREND } from '../services/mockData';
import { Header } from '../components/Header';

export const Dashboard = () => {
  const {
    totalBalance,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    transactions,
    accounts,
    setActiveScreen,
    setEditingTransaction
  } = useFinance();

  const recentTransactions = transactions.slice(0, 5);

  const getMethodBadge = (method) => {
    switch (method) {
      case 'upi':
        return <span className="inline-flex items-center gap-1 text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-medium border border-sky-100"><Smartphone className="w-3 h-3" /> UPI</span>;
      case 'card':
        return <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium border border-purple-100"><CreditCard className="w-3 h-3" /> Card</span>;
      case 'bank-transfer':
        return <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200"><Building2 className="w-3 h-3" /> Bank</span>;
      case 'cash':
        return <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-200"><Banknote className="w-3 h-3" /> Cash</span>;
      default:
        return null;
    }
  };

  // Find max value in monthly trend for scaling chart
  const maxMonthlyVal = Math.max(...MONTHLY_TREND.map(m => Math.max(m.income, m.expenses)));

  return (
    <div className="space-y-6">
      <Header
        title="Financial Overview"
        subtitle="Track income, expenses, and current cashflow"
      />

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Net Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {formatINR(totalBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Across {accounts.length} linked accounts
            </p>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-emerald-700">
              {formatINR(totalIncome)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Recorded income & transfers</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {formatINR(totalExpenses)}
            </div>
            <p className="text-xs text-slate-500 mt-1">All debit expenditures</p>
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatINR(netSavings)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <span className={`font-semibold ${savingsRate >= 20 ? 'text-emerald-700' : 'text-amber-600'}`}>
                {savingsRate}%
              </span>{' '}
              savings rate this month
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Monthly Trend & Quick Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Inflow vs Outflow Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Cashflow Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Comparison between income and expenditure</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-300 inline-block"></span>
                Expenses
              </span>
            </div>
          </div>

          {/* Pure CSS Bar Chart with Clean Tooltips/Heights */}
          <div className="pt-4 pb-2">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-6 border-b border-slate-100 pb-2">
              {MONTHLY_TREND.map((item) => {
                const incHeight = Math.round((item.income / maxMonthlyVal) * 100);
                const expHeight = Math.round((item.expenses / maxMonthlyVal) * 100);

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incHeight}%` }}
                        className="w-1/2 max-w-[20px] bg-emerald-600/90 hover:bg-emerald-600 rounded-t-sm transition-all relative"
                        title={`Income: ${formatINR(item.income)}`}
                      ></div>
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expHeight}%` }}
                        className="w-1/2 max-w-[20px] bg-slate-300 hover:bg-slate-400 rounded-t-sm transition-all"
                        title={`Expense: ${formatINR(item.expenses)}`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 truncate max-w-full text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>₹0</span>
              <span>Mid ₹{Math.round(maxMonthlyVal / 2000) * 1000}</span>
              <span>Max ₹{maxMonthlyVal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Linked Accounts Mini Summary */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Accounts & Wallets</h2>
              <button
                onClick={() => setActiveScreen('accounts')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {acc.type === 'bank' ? 'BK' : acc.type === 'wallet' ? 'WL' : 'CS'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{acc.name}</p>
                      <p className="text-[11px] text-slate-500">{acc.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{formatINR(acc.balance)}</p>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">{acc.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveScreen('accounts')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              + Link or Adjust Account
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest account activity</p>
          </div>
          <button
            onClick={() => setActiveScreen('transactions')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View all ({transactions.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No transactions recorded yet.
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const account = accounts.find(a => a.id === tx.accountId);
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4.5 h-4.5" />
                      ) : (
                        <ArrowUpRight className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{formatDate(tx.date)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 truncate">{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:block">
                      {getMethodBadge(tx.paymentMethod)}
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatINR(tx.amount)}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        {account?.name || 'Account'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingTransaction(tx);
                        setActiveScreen('add-transaction');
                      }}
                      className="text-xs text-slate-400 hover:text-emerald-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                      title="Edit transaction"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
