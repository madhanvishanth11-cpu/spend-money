import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './pages/Dashboard';
import { AddTransaction } from './pages/AddTransaction';
import { TransactionHistory } from './pages/TransactionHistory';
import { Accounts } from './pages/Accounts';
import { Reports } from './pages/Reports';
import { Budgets } from './pages/Budgets';
import { Settings } from './pages/Settings';

const MainContent = () => {
  const { activeScreen, loading } = useFinance();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-transaction':
        return <AddTransaction />;
      case 'transactions':
        return <TransactionHistory />;
      case 'accounts':
        return <Accounts />;
      case 'reports':
        return <Reports />;
      case 'budgets':
        return <Budgets />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500">Loading your financial records...</p>
          </div>
        ) : (
          renderScreen()
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

const ProtectedRoot = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600">Connecting to SpendWise...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ProtectedRoot />
    </AuthProvider>
  );
}

export default App;
