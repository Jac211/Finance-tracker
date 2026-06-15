import React from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, PiggyBank,
  ArrowUpRight, ArrowDownRight, CreditCard
} from 'lucide-react';
import { Account, Transaction, Budget, CATEGORY_COLORS } from '../types';
import { Card, CardHeader } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { SpendingDonut } from '../components/Charts/SpendingDonut';
import { IncomeExpenseBar } from '../components/Charts/IncomeExpenseBar';
import {
  getTotalBalance,
  getMonthlyIncome,
  getMonthlyExpenses,
  getSavingsRate,
  getSpendingByCategory,
  getLast6MonthsData,
  getRecentTransactions,
} from '../utils/calculations';
import { formatCurrency, formatShortDate } from '../utils/formatters';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
}

interface SummaryCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

function SummaryCard({ title, value, change, positive, icon, iconBg }: SummaryCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-white mt-1.5">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ accounts, transactions, budgets: _budgets }: DashboardProps) {
  const totalBalance = getTotalBalance(accounts);
  const monthlyIncome = getMonthlyIncome(transactions);
  const monthlyExpenses = getMonthlyExpenses(transactions);
  const savingsRate = getSavingsRate(monthlyIncome, monthlyExpenses);
  const spendingByCategory = getSpendingByCategory(transactions);
  const last6Months = getLast6MonthsData(transactions);
  const recentTransactions = getRecentTransactions(transactions, 8);

  const accountMap = new Map(accounts.map(a => [a.id, a]));

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          icon={<DollarSign size={20} className="text-indigo-400" />}
          iconBg="bg-indigo-900/50"
        />
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={<TrendingUp size={20} className="text-emerald-400" />}
          iconBg="bg-emerald-900/50"
          positive
          change="This month"
        />
        <SummaryCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon={<TrendingDown size={20} className="text-red-400" />}
          iconBg="bg-red-900/50"
          positive={false}
          change="This month"
        />
        <SummaryCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={<PiggyBank size={20} className="text-amber-400" />}
          iconBg="bg-amber-900/50"
          positive={savingsRate >= 20}
          change={savingsRate >= 20 ? 'On track' : 'Below goal'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
          <CardHeader
            title="Spending by Category"
            subtitle="Current month"
            icon={<PiggyBank size={16} className="text-indigo-400" />}
          />
          <div className="p-6">
            <SpendingDonut data={spendingByCategory} />
          </div>
        </Card>

        {/* Income vs Expenses */}
        <Card>
          <CardHeader
            title="Income vs Expenses"
            subtitle="Last 6 months"
            icon={<TrendingUp size={16} className="text-emerald-400" />}
          />
          <div className="p-6">
            <IncomeExpenseBar data={last6Months} />
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Transactions"
              subtitle="Latest activity"
              icon={<ArrowUpRight size={16} className="text-slate-400" />}
            />
            <div className="divide-y divide-slate-700/50">
              {recentTransactions.map(t => {
                const account = accountMap.get(t.accountId);
                return (
                  <div key={t.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-700/20 transition-colors">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{
                        backgroundColor: (CATEGORY_COLORS[t.category] || '#6b7280') + '20',
                        color: CATEGORY_COLORS[t.category] || '#6b7280',
                      }}
                    >
                      {t.category.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{formatShortDate(t.date)}</span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-500 truncate">{account?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={t.type === 'income' ? 'income' : t.type === 'transfer' ? 'transfer' : 'expense'} size="sm">
                        {t.type}
                      </Badge>
                      <span className={`text-sm font-semibold ${
                        t.type === 'income' ? 'text-emerald-400' : t.type === 'transfer' ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Accounts Summary */}
        <div>
          <Card>
            <CardHeader
              title="Accounts"
              subtitle="All accounts"
              icon={<CreditCard size={16} className="text-slate-400" />}
            />
            <div className="p-4 space-y-3">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: account.color + '30', border: `1px solid ${account.color}40` }}
                    >
                      <CreditCard size={14} style={{ color: account.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{account.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${account.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
