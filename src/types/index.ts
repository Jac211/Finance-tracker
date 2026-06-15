export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'investment';
  balance: number;
  currency: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  date: string; // ISO
  notes?: string;
  tags?: string[];
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly';
  color: string;
}

export type Page = 'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'reports';

export type ThemeMode = 'dark' | 'light';

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Education',
  'Personal Care',
  'Travel',
  'Insurance',
  'Savings',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Other Income',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Housing': '#6366f1',
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Healthcare': '#ef4444',
  'Entertainment': '#8b5cf6',
  'Shopping': '#ec4899',
  'Utilities': '#14b8a6',
  'Education': '#0ea5e9',
  'Personal Care': '#f97316',
  'Travel': '#06b6d4',
  'Insurance': '#84cc16',
  'Savings': '#10b981',
  'Other': '#6b7280',
  'Salary': '#10b981',
  'Freelance': '#3b82f6',
  'Investment': '#8b5cf6',
  'Business': '#f59e0b',
  'Gift': '#ec4899',
  'Other Income': '#6b7280',
};
