import React, { useState } from 'react';
import {
  Wallet,
  Building2,
  Banknote,
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Check,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/formatters';
import { Header } from '../components/Header';

export const Accounts = () => {
  const { accounts, saveAccount, deleteAccount, transactions } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const openModal = (account = null) => {
    if (account) {
      setEditingAcc(account);
      setName(account.name);
      setType(account.type);
      setBalance(String(account.balance));
      setInstitution(account.institution);
      setAccountNumber(account.accountNumber);
    } else {
      setEditingAcc(null);
      setName('');
      setType('bank');
      setBalance('');
      setInstitution('');
      setAccountNumber('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAcc(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveAccount({
      ...(editingAcc ? { id: editingAcc.id } : {}),
      name: name.trim(),
      type,
      balance: parseFloat(balance || 0),
      institution: institution.trim() || (type === 'cash' ? 'Cash' : 'Other Institution'),
      accountNumber: accountNumber.trim() || '•••• 0000',
      color: type === 'bank' ? 'emerald' : type === 'wallet' ? 'indigo' : 'amber'
    });

    closeModal();
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5 text-emerald-700" />;
      case 'wallet':
        return <Smartphone className="w-5 h-5 text-indigo-600" />;
      case 'cash':
        return <Banknote className="w-5 h-5 text-amber-600" />;
      default:
        return <Wallet className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Accounts & Wallets"
        subtitle="Manage bank accounts, digital UPI wallets, and physical cash reserves"
      />

      {/* Overview Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-200/90 font-medium">
            Aggregated Liquid Balance
          </span>
          <div className="text-3xl font-extrabold tracking-tight mt-1">
            {formatINR(totalBalance)}
          </div>
          <p className="text-xs text-emerald-100/70 mt-1">
            Distributed across {accounts.length} active financial holding accounts
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const txCount = transactions.filter((t) => t.accountId === acc.id).length;

          return (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getAccountIcon(acc.type)}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {acc.type}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 text-base">{acc.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{acc.institution} • {acc.accountNumber}</p>
                </div>

                <div className="mt-5">
                  <span className="text-xs text-slate-400 font-medium">Available Balance</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{formatINR(acc.balance)}</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{txCount} transactions</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(acc)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit account"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingAcc ? 'Edit Account' : 'Add New Account'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter account details and starting balance
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HDFC Salary, ICICI Savings, Paytm Wallet"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Account Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="cash">Cash in Hand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Balance (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Bank / Provider Name
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. State Bank of India, Axis Bank"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Account Identifier / Last 4 Digits
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. •••• 9876 or Phone number"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
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
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
