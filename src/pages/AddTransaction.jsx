import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Check,
  Calendar,
  Wallet,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Header } from '../components/Header';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
  { id: 'card', label: 'Debit / Credit Card' },
  { id: 'bank transfer', label: 'Net Banking / IMPS' },
  { id: 'cash', label: 'Cash' },
  { id: 'other', label: 'Other' }
];

export const AddTransaction = () => {
  const {
    accounts,
    categories,
    addTransaction,
    updateTransaction,
    editingTransaction,
    setEditingTransaction,
    setActiveScreen
  } = useFinance();

  const isEditing = !!editingTransaction;

  const [type, setType] = useState('expense'); // 'expense' | 'income' | 'transfer'
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter categories by selected transaction type
  const availableCategories = categories.filter((c) => c.transaction_type === type);

  // Set default account & category when available
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
      if (accounts.length > 1) {
        setDestinationAccountId(accounts[1].id);
      }
    }
  }, [accounts, accountId]);

  useEffect(() => {
    if (availableCategories.length > 0 && (!categoryId || !availableCategories.find(c => c.id === categoryId))) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId]);

  // Pre-fill if editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setDescription(editingTransaction.description || editingTransaction.title || '');
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setAccountId(editingTransaction.account_id || editingTransaction.accountId || '');
      setCategoryId(editingTransaction.category_id || '');
      setPaymentMethod(editingTransaction.payment_method || editingTransaction.paymentMethod || 'UPI');
      setTransactionDate(editingTransaction.transaction_date || editingTransaction.date || new Date().toISOString().split('T')[0]);
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim() && type !== 'transfer') {
      setFormError('Please enter a description / payee.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!accountId) {
      setFormError('Please select an account.');
      return;
    }

    if (type === 'transfer' && accountId === destinationAccountId) {
      setFormError('Source and destination accounts must be different.');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        await updateTransaction(editingTransaction.id, {
          account_id: accountId,
          category_id: type === 'transfer' ? null : categoryId,
          type,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          description: description.trim(),
          transaction_date: transactionDate,
        });
        setSuccessMsg('Transaction updated in database successfully.');
      } else {
        await addTransaction({
          account_id: accountId,
          destination_account_id: destinationAccountId,
          category_id: type === 'transfer' ? null : categoryId,
          type,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          description: description.trim() || (type === 'transfer' ? 'Account Transfer' : ''),
          transaction_date: transactionDate,
        });
        setSuccessMsg(type === 'transfer' ? 'Transfer completed successfully.' : 'Transaction logged successfully.');
      }

      setTimeout(() => {
        setSuccessMsg('');
        setEditingTransaction(null);
        setActiveScreen('transactions');
      }, 700);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Header
        title={isEditing ? 'Edit Transaction' : 'Record Transaction'}
        subtitle={isEditing ? 'Modify recorded database entry' : 'Log an expense, income credit, or transfer'}
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Type Toggle: Expense vs Income vs Transfer */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              disabled={isEditing && editingTransaction.type === 'transfer'}
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              disabled={isEditing && editingTransaction.type === 'transfer'}
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Income</span>
            </button>

            <button
              type="button"
              disabled={isEditing}
              onClick={() => setType('transfer')}
              className={`py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                type === 'transfer'
                  ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transfer</span>
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
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Description / Payee */}
        <div>
          <label htmlFor="tx-desc" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {type === 'transfer' ? 'Transfer Note (Optional)' : 'Description / Payee *'}
          </label>
          <input
            id="tx-desc"
            type="text"
            required={type !== 'transfer'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'transfer' ? 'e.g. Monthly rent advance or savings transfer' : 'e.g. Grocery store, electricity bill, client payment'}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Category & Date Grid (Category hidden on Transfers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {type !== 'transfer' ? (
            <div>
              <label htmlFor="tx-cat" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                id="tx-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="tx-dest-acc" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Destination Account *
              </label>
              <select
                id="tx-dest-acc"
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                    {acc.name} ({acc.account_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        {/* Account & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tx-src-acc" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {type === 'transfer' ? 'Source Account *' : 'Account *'}
            </label>
            <select
              id="tx-src-acc"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.account_type})
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={submitting}
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
            disabled={submitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : type === 'transfer' ? 'Execute Transfer' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};
