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
import { InstallPrompt } from './components/InstallPrompt';
import { Logo } from './components/Logo';

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

      {/* Mobile Top Brand Navbar */}
      <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <Logo size="sm" />
        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
          Cloud
        </span>
      </div>

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 animate-fadeIn">
        <Logo size="lg" className="animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-[#FF6A00] rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Connecting to SpendWise...</p>
        </div>
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
      <InstallPrompt />
    </AuthProvider>
  );
}

export default App;
