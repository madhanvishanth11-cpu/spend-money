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
  CreditCard,
  AlertCircle,
  Link2,
  RefreshCw,
  Unlink,
  ShieldCheck,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Header } from '../components/Header';
import { isBankProviderConfigured } from '../services/bankService';

export const Accounts = () => {
  const {
    accounts,
    bankConnections,
    saveAccount,
    deleteAccount,
    transactions,
    syncBankConnection,
    disconnectBankConnection
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Bank connect modal state
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [bankActionError, setBankActionError] = useState(null);
  const [bankActionSuccess, setBankActionSuccess] = useState(null);

  const openModal = (account = null) => {
    setFormError('');
    if (account) {
      setEditingAcc(account);
      setName(account.name);
      setAccountType(account.account_type);
      setOpeningBalance(String(account.opening_balance ?? 0));
    } else {
      setEditingAcc(null);
      setName('');
      setAccountType('bank');
      setOpeningBalance('0');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAcc(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Account name is required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await saveAccount({
        ...(editingAcc ? { id: editingAcc.id } : {}),
        name: name.trim(),
        account_type: accountType,
        opening_balance: parseFloat(openingBalance || 0),
      });
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account? Associated transactions will also be affected.')) {
      try {
        await deleteAccount(id);
      } catch (err) {
        alert('Error deleting account: ' + err.message);
      }
    }
  };

  const handleSync = async (conn) => {
    setBankActionError(null);
    setBankActionSuccess(null);
    setSyncingId(conn.id);
    try {
      await syncBankConnection(conn.id);
      setBankActionSuccess(`Synced transactions from ${conn.institution_name}`);
      setTimeout(() => setBankActionSuccess(null), 3000);
    } catch (err) {
      setBankActionError(err.message || 'Failed to sync with bank');
      setTimeout(() => setBankActionError(null), 4000);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (conn) => {
    if (window.confirm(`Disconnect live bank feed from ${conn.institution_name}? Your existing transactions will remain safe in your ledger.`)) {
      try {
        await disconnectBankConnection(conn.id);
        setBankActionSuccess(`Disconnected ${conn.institution_name}`);
        setTimeout(() => setBankActionSuccess(null), 3000);
      } catch (err) {
        setBankActionError(err.message || 'Failed to disconnect bank');
      }
    }
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
        subtitle="Live bank accounts, digital UPI wallets, and physical cash reserves"
      />

      {bankActionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{bankActionSuccess}</span>
        </div>
      )}

      {bankActionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 text-sm font-medium animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{bankActionError}</span>
        </div>
      )}

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
            Calculated from opening balances & transaction ledgers across {accounts.length} accounts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs border border-emerald-600/50"
          >
            <Link2 className="w-4 h-4 stroke-[2.5]" />
            <span>Connect Bank Account</span>
          </button>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Manual Account</span>
          </button>
        </div>
      </div>

      {/* Connected Indian Bank Feeds Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Automated Bank Connectivity (RBI Account Aggregator)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure, consent-driven financial data sharing regulated by the Reserve Bank of India.
            </p>
          </div>
        </div>

        {bankConnections.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">No bank accounts linked yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                  Connect your HDFC, SBI, ICICI, or Axis bank accounts via RBI-licensed Account Aggregators.
                  We never ask for or store passwords, OTPs, or PINs.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="self-start sm:self-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Link Bank Feed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankConnections.map((conn) => (
              <div
                key={conn.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-800">
                        {conn.institution_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{conn.institution_name}</h4>
                        <p className="text-xs text-slate-500 capitalize">{conn.account_type} • {conn.masked_account_number}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {conn.consent_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Bank-Reported Balance</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {conn.bank_reported_balance != null ? formatINR(conn.bank_reported_balance) : 'Pending sync'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Last Synced</span>
                      <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {conn.last_synced_at ? formatDate(conn.last_synced_at) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleSync(conn)}
                    disabled={syncingId === conn.id}
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingId === conn.id ? 'animate-spin' : ''}`} />
                    <span>{syncingId === conn.id ? 'Syncing...' : 'Sync Feed'}</span>
                  </button>

                  <button
                    onClick={() => handleDisconnect(conn)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual & Master Accounts List */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-slate-700" />
          <span>All Financial Holding Accounts</span>
        </h2>

        {accounts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-xs">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No accounts created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your primary bank, UPI wallet, or cash in hand account to start logging expenses.
            </p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Create First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc) => {
              const txCount = transactions.filter((t) => t.account_id === acc.id).length;

              return (
                <div
                  key={acc.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {getAccountIcon(acc.account_type)}
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {acc.account_type}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-bold text-slate-900 text-base">{acc.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Opening balance: {formatINR(acc.opening_balance)}
                      </p>
                    </div>

                    <div className="mt-5">
                      <span className="text-xs text-slate-400 font-medium">SpendWise Ledger Balance</span>
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
                          onClick={() => handleDelete(acc.id)}
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
        )}
      </div>

      {/* Connect Bank Account Modal with Honest Architecture Notice */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 sm:p-7 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Connect Indian Bank Account</h3>
                  <p className="text-xs text-slate-500">RBI Account Aggregator (AA) Framework</p>
                </div>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Regulatory Notice & Credentials Policy */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs space-y-2 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                Zero Credentials Policy (RBI Mandated)
              </div>
              <p className="text-emerald-900/80 leading-relaxed text-[11px]">
                SpendWise complies strictly with Reserve Bank of India regulations:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-emerald-900/80">
                <li>We <strong>never</strong> request or store your Internet Banking passwords, UPI PINs, ATM PINs, or OTPs.</li>
                <li>We <strong>never</strong> scrape bank portals. Bank data is fetched exclusively via encrypted consent artifacts managed by RBI-licensed Account Aggregators.</li>
              </ul>
            </div>

            {/* Provider Status */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Account Aggregator Gateway</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isBankProviderConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isBankProviderConfigured ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                  {isBankProviderConfigured ? 'Gateway Active' : 'Setup Required'}
                </span>
              </div>

              {!isBankProviderConfigured ? (
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="leading-relaxed">
                    Live bank syncing requires commercial API keys from an RBI-licensed Account Aggregator provider (e.g. <strong>Setu AA</strong>, <strong>Finvu</strong>, or <strong>OneMoney</strong>).
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                    <div># Backend / Edge Function configuration</div>
                    <div>SETU_AA_CLIENT_ID=your_client_id</div>
                    <div>SETU_AA_CLIENT_SECRET=your_client_secret</div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Secrets remain securely stored on your serverless backend, never exposed to client browsers.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600">
                  Your Account Aggregator gateway is operational. Click proceed to authorize your bank via OTP on the official RBI AA consent portal.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isBankProviderConfigured) {
                    alert('Bank integration setup required. Please configure an RBI Account Aggregator provider (e.g. Setu, Finvu) on your backend.');
                  } else {
                    alert('Redirecting to RBI Account Aggregator consent gateway...');
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                {isBankProviderConfigured ? 'Proceed to Bank Consent' : 'View Onboarding Guide'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingAcc ? 'Edit Account' : 'Add New Account'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter account details and baseline opening balance
            </p>

            {formError && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

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
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="cash">Cash in Hand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Opening Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
