import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Calendar,
  Wallet,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  Tag,
  FileText
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS
} from '../services/mockData';
import { Header } from '../components/Header';

export const AddTransaction = () => {
  const {
    accounts,
    addTransaction,
    updateTransaction,
    editingTransaction,
    setEditingTransaction,
    setActiveScreen
  } = useFinance();

  const isEditing = !!editingTransaction;

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-fill if editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setTitle(editingTransaction.title || '');
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setCategory(editingTransaction.category || EXPENSE_CATEGORIES[0]);
      setAccountId(editingTransaction.accountId || accounts[0]?.id || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'upi');
      setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
      setNotes(editingTransaction.notes || '');
    }
  }, [editingTransaction, accounts]);

  // Adjust category default when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const payload = {
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      accountId: accountId || accounts[0]?.id,
      paymentMethod,
      date,
      notes: notes.trim()
    };

    if (isEditing) {
      updateTransaction({
        ...payload,
        id: editingTransaction.id
      });
      setSuccessMsg('Transaction updated successfully');
    } else {
      addTransaction(payload);
      setSuccessMsg('Transaction logged successfully');
    }

    setTimeout(() => {
      setSuccessMsg('');
      setEditingTransaction(null);
      setActiveScreen('transactions');
    }, 900);
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Header
        title={isEditing ? 'Edit Transaction' : 'Record Transaction'}
        subtitle={isEditing ? 'Modify recorded entry details' : 'Log a new personal expense or income credit'}
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Type Toggle: Expense vs Income */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense (Debit)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Income (Credit)</span>
            </button>
          </div>
        </div>

        {/* Amount Input with INR symbol */}
        <div>
          <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Amount (INR) *
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold text-lg">
              ₹
            </div>
            <input
              id="tx-amount"
              type="number"
              step="any"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Title / Description */}
        <div>
          <label htmlFor="tx-title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Description / Payee *
          </label>
          <input
            id="tx-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Swiggy order, Metro smartcard recharge, Freelance client"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="relative">
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        {/* Account & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tx-account" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Account
            </label>
            <select
              id="tx-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-method" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <select
              id="tx-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label htmlFor="tx-notes" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Notes / Reference (Optional)
          </label>
          <input
            id="tx-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Transaction ID, splitting with colleagues, receipt note"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setActiveScreen('transactions');
            }}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            {isEditing ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};
