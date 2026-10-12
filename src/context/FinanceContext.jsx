import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as db from '../services/db';
import * as bankService from '../services/bankService';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const { user, isSupabaseConfigured } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [bankConnections, setBankConnections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Fetch all user data whenever user logs in
  const fetchData = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setBankConnections([]);
      setCategories([]);
      setTransactions([]);
      setBudgets([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [fetchedProfile, fetchedAccounts, fetchedConnections, fetchedCategories, fetchedTransactions, fetchedBudgets] =
        await Promise.all([
          db.getProfile(user.id),
          db.getAccounts(),
          bankService.getBankConnections(),
          db.getCategories(),
          db.getTransactions(),
          db.getBudgets(),
        ]);

      setProfile(fetchedProfile);
      setAccounts(fetchedAccounts);
      setBankConnections(fetchedConnections);
      setCategories(fetchedCategories);
      setTransactions(fetchedTransactions);
      setBudgets(fetchedBudgets);
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
      setError(err.message || 'Failed to load financial records');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Account Balances:
  // Each account balance = opening_balance + sum(inflows) - sum(outflows)
  // Transfers:
  // - Outgoing transfer from account decreases balance
  // - Incoming transfer to account increases balance
  const computedAccounts = useMemo(() => {
    return accounts.map((acc) => {
      const opening = Number(acc.opening_balance || 0);

      const accTransactions = transactions.filter((t) => t.account_id === acc.id);

      const netDelta = accTransactions.reduce((sum, tx) => {
        const amt = Number(tx.amount || 0);
        if (tx.type === 'income') {
          return sum + amt;
        } else if (tx.type === 'expense') {
          return sum - amt;
        } else if (tx.type === 'transfer') {
          // Explicit transfer_side: incoming credits the account, outgoing debits
          const isIncoming = tx.transfer_side === 'incoming' || tx.description?.toLowerCase().includes('from');
          return isIncoming ? sum + amt : sum - amt;
        }
        return sum;
      }, 0);

      return {
        ...acc,
        balance: opening + netDelta,
      };
    });
  }, [accounts, transactions]);

  // Aggregated Net Financial Metrics
  // Excludes transfers from overall income/expense totals to prevent double-counting
  const totalBalance = useMemo(() => {
    return computedAccounts.reduce((sum, a) => sum + a.balance, 0);
  }, [computedAccounts]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Monthly Cashflow Trend based on real database records
  const monthlyTrend = useMemo(() => {
    const monthMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${months[d.getMonth()]}${i === 0 ? ' (Current)' : ''}`;
      monthMap[key] = { month: label, income: 0, expenses: 0 };
    }

    transactions.forEach((tx) => {
      const ym = (tx.transaction_date || '').slice(0, 7);
      if (monthMap[ym]) {
        if (tx.type === 'income') {
          monthMap[ym].income += Number(tx.amount || 0);
        } else if (tx.type === 'expense') {
          monthMap[ym].expenses += Number(tx.amount || 0);
        }
      }
    });

    return Object.values(monthMap);
  }, [transactions]);

  // Data Actions
  const addTransaction = async (txData) => {
    const created = await db.createTransaction(txData);
    await fetchData();
    return created;
  };

  const updateTransaction = async (id, txData) => {
    const updated = await db.updateTransaction(id, txData);
    await fetchData();
    return updated;
  };

  const deleteTransaction = async (id, transferGroupId = null) => {
    await db.deleteTransaction(id, transferGroupId);
    await fetchData();
  };

  const saveAccount = async (accountData) => {
    if (accountData.id) {
      await db.updateAccount(accountData.id, accountData);
    } else {
      await db.createAccount(accountData);
    }
    await fetchData();
  };

  const deleteAccount = async (id) => {
    await db.deleteAccount(id);
    await fetchData();
  };

  const saveBudget = async (budgetData) => {
    await db.saveBudget(budgetData);
    await fetchData();
  };

  const deleteBudget = async (id) => {
    await db.deleteBudget(id);
    await fetchData();
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts: computedAccounts,
        rawAccounts: accounts,
        bankConnections,
        categories,
        transactions,
        budgets,
        profile,
        loading,
        error,
        activeScreen,
        setActiveScreen,
        editingTransaction,
        setEditingTransaction,
        totalBalance,
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
        monthlyTrend,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveAccount,
        deleteAccount,
        saveBudget,
        deleteBudget,
        syncBankConnection: async (id) => {
          await bankService.syncBankConnection(id);
          await fetchData();
        },
        disconnectBankConnection: async (id) => {
          await bankService.disconnectBankConnection(id);
          await fetchData();
        },
        refreshData: fetchData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
