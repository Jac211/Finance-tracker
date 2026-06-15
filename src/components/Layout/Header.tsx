import React from 'react';
import { Sun, Moon, Menu, TrendingUp } from 'lucide-react';
import { Page, ThemeMode } from '../../types';

interface HeaderProps {
  currentPage: Page;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onMenuOpen: () => void;
}

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  budgets: 'Budgets',
  accounts: 'Accounts',
  reports: 'Reports',
};

export function Header({ currentPage, theme, onToggleTheme, onMenuOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuOpen}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">FinanceTrack</span>
          </div>
          <h2 className="hidden md:block text-lg font-semibold text-white">
            {pageTitles[currentPage]}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

// Mobile nav drawer
interface MobileNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

import { LayoutDashboard, ArrowLeftRight, PieChart, Wallet, BarChart3 } from 'lucide-react';

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
  { id: 'budgets', label: 'Budgets', icon: <PieChart size={18} /> },
  { id: 'accounts', label: 'Accounts', icon: <Wallet size={18} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
];

export function MobileNav({ currentPage, onNavigate, isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700/50 p-4 animate-slide-in">
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">FinanceTrack</h1>
            <p className="text-xs text-slate-500">Personal Finance</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${currentPage === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
