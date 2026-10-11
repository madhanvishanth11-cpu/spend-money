import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Trash2,
  Edit2,
  SlidersHorizontal,
  X,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Header } from '../components/Header';

export const TransactionHistory = () => {
  const {
    transactions,
    accounts,
    categories,
    deleteTransaction,
    setEditingTransaction,
    setActiveScreen
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | expense | income | transfer
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const desc = tx.description || '';
      const matchesSearch = desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory =
        categoryFilter === 'all' || tx.category_id === categoryFilter;
      const matchesAccount =
        accountFilter === 'all' || tx.account_id === accountFilter;
      const matchesMethod =
        paymentMethodFilter === 'all' ||
        tx.payment_method?.toLowerCase() === paymentMethodFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesAccount &&
        matchesMethod
      );
    });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    accountFilter,
    paymentMethodFilter
  ]);

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setActiveScreen('add-transaction');
  };

  const handleDelete = async (tx) => {
    setDeleting(true);
    try {
      await deleteTransaction(tx.id, tx.transfer_group_id);
      setConfirmDeleteId(null);
    } catch (err) {
      alert('Error deleting transaction: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setAccountFilter('all');
    setPaymentMethodFilter('all');
  };

  const hasActiveFilters =
    searchQuery ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    accountFilter !== 'all' ||
    paymentMethodFilter !== 'all';

  const getMethodBadge = (method) => {
    const m = (method || '').toLowerCase();
    if (m === 'upi') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-medium border border-sky-100">
          <Smartphone className="w-3 h-3" /> UPI
        </span>
      );
    }
    if (m === 'card') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium border border-purple-100">
          <CreditCard className="w-3 h-3" /> Card
        </span>
      );
    }
    if (m === 'bank transfer' || m === 'bank-transfer') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">
          <Building2 className="w-3 h-3" /> Bank
        </span>
      );
    }
    if (m === 'cash') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-200">
          <Banknote className="w-3 h-3" /> Cash
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium border border-slate-200">
        Other
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Header
        title="Transaction History"
        subtitle={`Viewing ${filteredTransactions.length} of ${transactions.length} recorded transactions`}
      />

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by payee, description, or notes..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('transfer')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'transfer'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transfers
            </button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Account
            </label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="card">Card</option>
              <option value="bank transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">Filters applied</span>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No matching transactions</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {transactions.length === 0
                ? 'Your personal ledger is empty. Record your first transaction to get started.'
                : 'Try adjusting your search query or clear the applied filters.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const account = accounts.find((a) => a.id === tx.account_id) || tx.account;
              const category = categories.find((c) => c.id === tx.category_id) || tx.category;
              const isDeleting = confirmDeleteId === tx.id;
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : isTransfer
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : isTransfer ? (
                        <ArrowLeftRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                        {tx.description}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-medium">
                          {formatDate(tx.transaction_date)}
                        </span>
                        {category && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              {category.name}
                            </span>
                          </>
                        )}
                        {account && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">
                              {account.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount, Badge, and Action Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-3">
                      {getMethodBadge(tx.payment_method)}
                      <span
                        className={`text-base font-bold ${
                          tx.type === 'income'
                            ? 'text-emerald-700'
                            : isTransfer
                            ? 'text-sky-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄'}{' '}
                        {formatINR(tx.amount)}
                      </span>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 ml-2">
                      {isDeleting ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg border border-rose-200">
                          <button
                            disabled={deleting}
                            onClick={() => handleDelete(tx)}
                            className="px-2 py-1 text-xs font-bold text-white bg-rose-600 rounded hover:bg-rose-700 transition-colors"
                          >
                            {deleting ? '...' : 'Confirm'}
                          </button>
                          <button
                            disabled={deleting}
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          {!isTransfer && (
                            <button
                              onClick={() => handleEdit(tx)}
                              aria-label={`Edit ${tx.description}`}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDeleteId(tx.id)}
                            aria-label={`Delete ${tx.description}`}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
