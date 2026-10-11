import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { AddTransaction } from './pages/AddTransaction';
import { TransactionHistory } from './pages/TransactionHistory';
import { Accounts } from './pages/Accounts';
import { Reports } from './pages/Reports';
import { Budgets } from './pages/Budgets';
import { Settings } from './pages/Settings';

const MainContent = () => {
  const { activeScreen } = useFinance();

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
        {renderScreen()}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}

export default App;
