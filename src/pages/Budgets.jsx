import React, { useState } from 'react';
import {
  Target,
  Plus,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../services/mockData';
import { Header } from '../components/Header';

export const Budgets = () => {
  const { budgets, transactions, saveBudget, deleteBudget } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [allocated, setAllocated] = useState('');

  // Calculate actual spending per budget category
  const budgetStatusList = budgets.map((b) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const percentage = b.allocated > 0 ? Math.round((spent / b.allocated) * 100) : 0;
    const remaining = b.allocated - spent;

    return {
      ...b,
      spent,
      percentage,
      remaining,
      isOver: remaining < 0
    };
  });

  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocated), 0);
  const totalSpentInBudgets = budgetStatusList.reduce((sum, b) => sum + b.spent, 0);

  const openModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setCategory(budget.category);
      setAllocated(String(budget.allocated));
    } else {
      setEditingBudget(null);
      setCategory(EXPENSE_CATEGORIES[0]);
      setAllocated('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!allocated || Number(allocated) <= 0) return;

    saveBudget({
      ...(editingBudget ? { id: editingBudget.id } : {}),
      category,
      allocated: parseFloat(allocated),
      period: 'monthly'
    });

    closeModal();
  };

  return (
    <div className="space-y-6">
      <Header
        title="Monthly Budgets & Limits"
        subtitle="Set spending ceilings per category to stay financially disciplined"
      />

      {/* Aggregate Budget Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Budget Utilization
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatINR(totalSpentInBudgets)}{' '}
              <span className="text-sm font-normal text-slate-500">
                / {formatINR(totalAllocated)}
              </span>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Category Budget</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalSpentInBudgets > totalAllocated
                  ? 'bg-rose-500'
                  : totalSpentInBudgets / totalAllocated > 0.8
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{
                width: `${Math.min(
                  Math.round((totalSpentInBudgets / (totalAllocated || 1)) * 100),
                  100
                )}%`
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              {Math.round((totalSpentInBudgets / (totalAllocated || 1)) * 100)}% utilized
            </span>
            <span>
              {totalAllocated - totalSpentInBudgets >= 0
                ? `${formatINR(totalAllocated - totalSpentInBudgets)} remaining`
                : `${formatINR(Math.abs(totalAllocated - totalSpentInBudgets))} over budget`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetStatusList.map((b) => {
          const isWarning = b.percentage >= 80 && !b.isOver;
          const isOver = b.isOver;

          return (
            <div
              key={b.id}
              className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all ${
                isOver
                  ? 'border-rose-200 ring-1 ring-rose-200'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {b.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(b)}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                      title="Edit budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Spent: <strong className="text-slate-900">{formatINR(b.spent)}</strong></span>
                    <span className="text-slate-500">Limit: <strong className="text-slate-900">{formatINR(b.allocated)}</strong></span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {isOver ? (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exceeded by {formatINR(Math.abs(b.remaining))}
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> {b.percentage}% (Nearing limit)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {formatINR(b.remaining)} left
                  </span>
                )}
                <span className="text-slate-400 font-medium">{b.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingBudget ? 'Update Budget' : 'Set Category Budget'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate a monthly spending ceiling
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Expense Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Monthly Limit (INR) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={allocated}
                    onChange={(e) => setAllocated(e.target.value)}
                    placeholder="10000"
                    className="w-full pl-8 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
