import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header, MobileNav } from './components/Layout/Header';
import { ToastProvider } from './components/UI/Toast';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Accounts } from './pages/Accounts';
import { Reports } from './pages/Reports';
import { useFinanceData } from './hooks/useFinanceData';
import { Page, ThemeMode } from './types';
import useLocalStorage from './hooks/useLocalStorage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [theme, setTheme] = useLocalStorage<ThemeMode>('ft-theme', 'dark');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const financeData = useFinanceData();

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ToastProvider>
      <div className={`min-h-screen ${theme === 'light' ? 'light bg-slate-100' : 'bg-slate-950'}`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              currentPage={currentPage}
              theme={theme}
              onToggleTheme={toggleTheme}
              onMenuOpen={() => setMobileNavOpen(true)}
            />
            <main className="flex-1 overflow-y-auto">
              {currentPage === 'dashboard' && (
                <Dashboard
                  accounts={financeData.accounts}
                  transactions={financeData.transactions}
                  budgets={financeData.budgets}
                />
              )}
              {currentPage === 'transactions' && (
                <Transactions
                  accounts={financeData.accounts}
                  transactions={financeData.transactions}
                  onAdd={financeData.addTransaction}
                  onUpdate={financeData.updateTransaction}
                  onDelete={financeData.deleteTransaction}
                  onImport={financeData.importTransactions}
                />
              )}
              {currentPage === 'budgets' && (
                <Budgets
                  budgets={financeData.budgets}
                  transactions={financeData.transactions}
                  onAdd={financeData.addBudget}
                  onUpdate={financeData.updateBudget}
                  onDelete={financeData.deleteBudget}
                />
              )}
              {currentPage === 'accounts' && (
                <Accounts
                  accounts={financeData.accounts}
                  transactions={financeData.transactions}
                  onAdd={financeData.addAccount}
                  onUpdate={financeData.updateAccount}
                  onDelete={financeData.deleteAccount}
                />
              )}
              {currentPage === 'reports' && (
                <Reports
                  accounts={financeData.accounts}
                  transactions={financeData.transactions}
                  budgets={financeData.budgets}
                />
              )}
            </main>
          </div>
        </div>
        <MobileNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}
