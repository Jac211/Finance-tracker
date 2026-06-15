import { Account, Transaction, Budget, CATEGORY_COLORS } from '../types';
import { subDays, subMonths, format } from 'date-fns';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const sampleAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    type: 'checking',
    balance: 8450.32,
    currency: 'USD',
    color: '#6366f1',
  },
  {
    id: 'acc-2',
    name: 'High-Yield Savings',
    type: 'savings',
    balance: 24750.00,
    currency: 'USD',
    color: '#10b981',
  },
  {
    id: 'acc-3',
    name: 'Visa Credit Card',
    type: 'credit',
    balance: -1820.45,
    currency: 'USD',
    color: '#f59e0b',
  },
  {
    id: 'acc-4',
    name: 'Cash Wallet',
    type: 'cash',
    balance: 245.00,
    currency: 'USD',
    color: '#84cc16',
  },
  {
    id: 'acc-5',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 42800.00,
    currency: 'USD',
    color: '#8b5cf6',
  },
];

export const sampleBudgets: Budget[] = [
  { id: 'bud-1', category: 'Housing', amount: 2000, period: 'monthly', color: CATEGORY_COLORS['Housing'] },
  { id: 'bud-2', category: 'Food & Dining', amount: 600, period: 'monthly', color: CATEGORY_COLORS['Food & Dining'] },
  { id: 'bud-3', category: 'Transportation', amount: 400, period: 'monthly', color: CATEGORY_COLORS['Transportation'] },
  { id: 'bud-4', category: 'Healthcare', amount: 200, period: 'monthly', color: CATEGORY_COLORS['Healthcare'] },
  { id: 'bud-5', category: 'Entertainment', amount: 300, period: 'monthly', color: CATEGORY_COLORS['Entertainment'] },
  { id: 'bud-6', category: 'Shopping', amount: 400, period: 'monthly', color: CATEGORY_COLORS['Shopping'] },
  { id: 'bud-7', category: 'Utilities', amount: 250, period: 'monthly', color: CATEGORY_COLORS['Utilities'] },
  { id: 'bud-8', category: 'Personal Care', amount: 150, period: 'monthly', color: CATEGORY_COLORS['Personal Care'] },
];

function makeTransaction(
  overrides: Partial<Transaction> & { date: string }
): Transaction {
  return {
    id: generateId(),
    accountId: 'acc-1',
    type: 'expense',
    amount: 0,
    category: 'Other',
    description: '',
    ...overrides,
  };
}

const today = new Date();

export function generateSampleTransactions(): Transaction[] {
  const transactions: Transaction[] = [];

  // Generate 6 months of transactions
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const monthDate = subMonths(today, monthOffset);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monthly salary
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'income',
      amount: 7500,
      category: 'Salary',
      description: 'Monthly Salary',
      date: format(new Date(year, month, 1), 'yyyy-MM-dd'),
    }));

    // Rent
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'expense',
      amount: 1850,
      category: 'Housing',
      description: 'Monthly Rent',
      date: format(new Date(year, month, 1), 'yyyy-MM-dd'),
    }));

    // Utilities
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'expense',
      amount: Math.round((180 + Math.random() * 60) * 100) / 100,
      category: 'Utilities',
      description: 'Electric & Gas Bill',
      date: format(new Date(year, month, 5), 'yyyy-MM-dd'),
    }));

    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'expense',
      amount: 59.99,
      category: 'Utilities',
      description: 'Internet Bill',
      date: format(new Date(year, month, 5), 'yyyy-MM-dd'),
    }));

    // Insurance
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'expense',
      amount: 142,
      category: 'Insurance',
      description: 'Car Insurance',
      date: format(new Date(year, month, 10), 'yyyy-MM-dd'),
    }));

    // Food - weekly groceries
    for (let week = 0; week < 4; week++) {
      const day = Math.min(7 + week * 7, daysInMonth);
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-3',
        type: 'expense',
        amount: Math.round((80 + Math.random() * 60) * 100) / 100,
        category: 'Food & Dining',
        description: 'Grocery Shopping',
        date: format(new Date(year, month, day), 'yyyy-MM-dd'),
      }));
    }

    // Dining out
    const diningCount = Math.floor(4 + Math.random() * 4);
    for (let d = 0; d < diningCount; d++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const restaurants = ['Restaurant Dinner', 'Coffee Shop', 'Lunch Out', 'Pizza Night', 'Sushi Bar', 'Thai Food'];
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-3',
        type: 'expense',
        amount: Math.round((15 + Math.random() * 65) * 100) / 100,
        category: 'Food & Dining',
        description: restaurants[Math.floor(Math.random() * restaurants.length)],
        date: format(new Date(year, month, day), 'yyyy-MM-dd'),
      }));
    }

    // Transportation
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'expense',
      amount: Math.round((60 + Math.random() * 40) * 100) / 100,
      category: 'Transportation',
      description: 'Gas Station',
      date: format(new Date(year, month, 8), 'yyyy-MM-dd'),
    }));
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'expense',
      amount: Math.round((50 + Math.random() * 30) * 100) / 100,
      category: 'Transportation',
      description: 'Gas Station',
      date: format(new Date(year, month, 22), 'yyyy-MM-dd'),
    }));

    // Occasional Uber/Lyft
    if (Math.random() > 0.4) {
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-3',
        type: 'expense',
        amount: Math.round((12 + Math.random() * 28) * 100) / 100,
        category: 'Transportation',
        description: 'Uber Ride',
        date: format(new Date(year, month, Math.floor(Math.random() * daysInMonth) + 1), 'yyyy-MM-dd'),
      }));
    }

    // Entertainment / Subscriptions
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-3',
      type: 'expense',
      amount: 15.99,
      category: 'Entertainment',
      description: 'Netflix Subscription',
      date: format(new Date(year, month, 15), 'yyyy-MM-dd'),
    }));
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-3',
      type: 'expense',
      amount: 9.99,
      category: 'Entertainment',
      description: 'Spotify Premium',
      date: format(new Date(year, month, 15), 'yyyy-MM-dd'),
    }));

    if (Math.random() > 0.5) {
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-3',
        type: 'expense',
        amount: Math.round((30 + Math.random() * 80) * 100) / 100,
        category: 'Entertainment',
        description: 'Movie / Event',
        date: format(new Date(year, month, Math.floor(Math.random() * daysInMonth) + 1), 'yyyy-MM-dd'),
      }));
    }

    // Shopping
    const shoppingCount = Math.floor(1 + Math.random() * 4);
    const shoppingItems = ['Amazon Purchase', 'Clothing Store', 'Electronics', 'Home Decor', 'Books', 'Online Shopping'];
    for (let s = 0; s < shoppingCount; s++) {
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-3',
        type: 'expense',
        amount: Math.round((20 + Math.random() * 180) * 100) / 100,
        category: 'Shopping',
        description: shoppingItems[Math.floor(Math.random() * shoppingItems.length)],
        date: format(new Date(year, month, Math.floor(Math.random() * daysInMonth) + 1), 'yyyy-MM-dd'),
      }));
    }

    // Healthcare (occasional)
    if (Math.random() > 0.5) {
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-1',
        type: 'expense',
        amount: Math.round((20 + Math.random() * 150) * 100) / 100,
        category: 'Healthcare',
        description: Math.random() > 0.5 ? 'Doctor Visit' : 'Pharmacy',
        date: format(new Date(year, month, Math.floor(Math.random() * daysInMonth) + 1), 'yyyy-MM-dd'),
      }));
    }

    // Personal Care
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-4',
      type: 'expense',
      amount: Math.round((40 + Math.random() * 60) * 100) / 100,
      category: 'Personal Care',
      description: 'Haircut & Grooming',
      date: format(new Date(year, month, Math.floor(Math.random() * daysInMonth) + 1), 'yyyy-MM-dd'),
    }));

    // Savings transfer
    transactions.push(makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'transfer',
      amount: 1000,
      category: 'Savings',
      description: 'Transfer to Savings',
      date: format(new Date(year, month, 28), 'yyyy-MM-dd'),
    }));

    // Occasional freelance income
    if (Math.random() > 0.6) {
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-1',
        type: 'income',
        amount: Math.round((500 + Math.random() * 1500) * 100) / 100,
        category: 'Freelance',
        description: 'Freelance Project Payment',
        date: format(new Date(year, month, Math.floor(daysInMonth / 2)), 'yyyy-MM-dd'),
      }));
    }

    // Occasional investment returns
    if (Math.random() > 0.5) {
      transactions.push(makeTransaction({
        id: generateId(),
        accountId: 'acc-5',
        type: 'income',
        amount: Math.round((100 + Math.random() * 400) * 100) / 100,
        category: 'Investment',
        description: 'Dividend Income',
        date: format(new Date(year, month, Math.floor(Math.random() * daysInMonth) + 1), 'yyyy-MM-dd'),
      }));
    }
  }

  // Add some very recent transactions
  transactions.push(
    makeTransaction({
      id: generateId(),
      accountId: 'acc-3',
      type: 'expense',
      amount: 42.50,
      category: 'Food & Dining',
      description: 'Dinner at Olive Garden',
      date: format(subDays(today, 1), 'yyyy-MM-dd'),
    }),
    makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'expense',
      amount: 89.99,
      category: 'Shopping',
      description: 'Amazon - Household Items',
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
    }),
    makeTransaction({
      id: generateId(),
      accountId: 'acc-1',
      type: 'income',
      amount: 7500,
      category: 'Salary',
      description: 'Monthly Salary',
      date: format(subDays(today, 3), 'yyyy-MM-dd'),
    }),
    makeTransaction({
      id: generateId(),
      accountId: 'acc-4',
      type: 'expense',
      amount: 8.50,
      category: 'Food & Dining',
      description: 'Coffee & Pastry',
      date: format(today, 'yyyy-MM-dd'),
    })
  );

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
