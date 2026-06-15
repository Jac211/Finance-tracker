import useLocalStorage from './useLocalStorage';
import { Account, Transaction, Budget } from '../types';
import { sampleAccounts, sampleBudgets, generateSampleTransactions } from '../utils/sampleData';

export function useFinanceData() {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('ft-accounts', sampleAccounts);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('ft-transactions', generateSampleTransactions());
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('ft-budgets', sampleBudgets);

  const addAccount = (account: Account) => {
    setAccounts(prev => [...prev, account]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const importTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => {
      const existing = new Set(prev.map(t => t.id));
      const toAdd = newTransactions.filter(t => !existing.has(t.id));
      return [...toAdd, ...prev];
    });
  };

  return {
    accounts,
    transactions,
    budgets,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    importTransactions,
  };
}
