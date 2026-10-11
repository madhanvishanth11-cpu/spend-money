import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS
} from '../services/mockData';

const FinanceContext = createContext(null);

const STORAGE_KEY = 'spendwise_demo_state_v1';

export const FinanceProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Sync state to local storage for realistic demo experience
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    } catch {
      // ignore in demo
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    } catch {
      // ignore in demo
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
    } catch {
      // ignore in demo
    }
  }, [budgets]);

  // Financial calculations
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Add transaction
  const addTransaction = (txData) => {
    const newTx = {
      ...txData,
      id: `tx-${Date.now()}`,
      amount: Number(txData.amount)
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === txData.accountId) {
        const delta = txData.type === 'income' ? newTx.amount : -newTx.amount;
        return { ...acc, balance: acc.balance + delta };
      }
      return acc;
    }));
  };

  // Update transaction
  const updateTransaction = (updatedTx) => {
    const existing = transactions.find(t => t.id === updatedTx.id);
    if (!existing) return;

    const oldAmount = Number(existing.amount);
    const newAmount = Number(updatedTx.amount);

    setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? { ...updatedTx, amount: newAmount } : t)));

    // Revert old impact and apply new impact to accounts
    setAccounts(prev => prev.map(acc => {
      let balance = acc.balance;
      // Revert old
      if (acc.id === existing.accountId) {
        balance += (existing.type === 'income' ? -oldAmount : oldAmount);
      }
      // Apply new
      if (acc.id === updatedTx.accountId) {
        balance += (updatedTx.type === 'income' ? newAmount : -newAmount);
      }
      return { ...acc, balance };
    }));
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Revert account impact
    setAccounts(prev => prev.map(acc => {
      if (acc.id === tx.accountId) {
        const amount = Number(tx.amount);
        const delta = tx.type === 'income' ? -amount : amount;
        return { ...acc, balance: acc.balance + delta };
      }
      return acc;
    }));
  };

  // Add / Edit Account
  const saveAccount = (accountData) => {
    if (accountData.id) {
      setAccounts(prev => prev.map(a => a.id === accountData.id ? { ...a, ...accountData, balance: Number(accountData.balance) } : a));
    } else {
      const newAcc = {
        ...accountData,
        id: `acc-${Date.now()}`,
        balance: Number(accountData.balance || 0)
      };
      setAccounts(prev => [...prev, newAcc]);
    }
  };

  const deleteAccount = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Save Budget
  const saveBudget = (budgetData) => {
    if (budgetData.id) {
      setBudgets(prev => prev.map(b => b.id === budgetData.id ? { ...b, allocated: Number(budgetData.allocated) } : b));
    } else {
      const newB = {
        ...budgetData,
        id: `b-${Date.now()}`,
        allocated: Number(budgetData.allocated)
      };
      setBudgets(prev => [...prev, newB]);
    }
  };

  const deleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    localStorage.removeItem(`${STORAGE_KEY}_accounts`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_budgets`);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        budgets,
        activeScreen,
        setActiveScreen,
        editingTransaction,
        setEditingTransaction,
        totalBalance,
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveAccount,
        deleteAccount,
        saveBudget,
        deleteBudget,
        resetDemoData
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
