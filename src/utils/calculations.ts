import { Transaction, Account, Budget } from '../types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, format } from 'date-fns';

export function getTotalBalance(accounts: Account[]): number {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}

export function getMonthlyIncome(transactions: Transaction[], date = new Date()): number {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return transactions
    .filter(t => t.type === 'income' && isWithinInterval(parseISO(t.date), { start, end }))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyExpenses(transactions: Transaction[], date = new Date()): number {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return transactions
    .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start, end }))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  return Math.max(0, ((income - expenses) / income) * 100);
}

export function getSpendingByCategory(transactions: Transaction[], date = new Date()): Record<string, number> {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const filtered = transactions.filter(
    t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start, end })
  );
  const result: Record<string, number> = {};
  for (const t of filtered) {
    result[t.category] = (result[t.category] || 0) + t.amount;
  }
  return result;
}

export function getLast6MonthsData(transactions: Transaction[]) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const income = getMonthlyIncome(transactions, date);
    const expenses = getMonthlyExpenses(transactions, date);
    months.push({
      month: format(date, 'MMM yy'),
      income,
      expenses,
      savings: income - expenses,
    });
  }
  return months;
}

export function getBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  date = new Date()
): Array<{ budget: Budget; spent: number; percentage: number; remaining: number; overBudget: boolean }> {
  const spending = getSpendingByCategory(transactions, date);
  return budgets.map(budget => {
    const spent = spending[budget.category] || 0;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    return {
      budget,
      spent,
      percentage,
      remaining: budget.amount - spent,
      overBudget: spent > budget.amount,
    };
  });
}

export function getRecentTransactions(transactions: Transaction[], limit = 10): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function filterTransactions(
  transactions: Transaction[],
  filters: {
    search?: string;
    category?: string;
    type?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }
): Transaction[] {
  return transactions.filter(t => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.accountId && filters.accountId !== 'all' && t.accountId !== filters.accountId) return false;
    if (filters.startDate && t.date < filters.startDate) return false;
    if (filters.endDate && t.date > filters.endDate) return false;
    return true;
  });
}

export function getCategoryTrend(
  transactions: Transaction[],
  category: string,
  months = 6
): Array<{ month: string; amount: number }> {
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(new Date(), months - 1 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const amount = transactions
      .filter(t => t.category === category && t.type === 'expense' && isWithinInterval(parseISO(t.date), { start, end }))
      .reduce((sum, t) => sum + t.amount, 0);
    return { month: format(date, 'MMM'), amount };
  });
}
