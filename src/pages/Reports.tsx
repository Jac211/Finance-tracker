import { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react';
import { Account, Transaction, Budget, CATEGORY_COLORS } from '../types';
import { Card, CardHeader } from '../components/UI/Card';
import { IncomeExpenseBar } from '../components/Charts/IncomeExpenseBar';
import { SpendingDonut } from '../components/Charts/SpendingDonut';
import { TrendLine } from '../components/Charts/TrendLine';
import {
  getLast6MonthsData,
  getSpendingByCategory,
  getBudgetProgress,
  getCategoryTrend,
  getMonthlyIncome,
  getMonthlyExpenses,
  getSavingsRate,
} from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface ReportsProps {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
}

const TOP_CATEGORIES = ['Food & Dining', 'Housing', 'Transportation', 'Entertainment', 'Shopping'];

export function Reports({ accounts: _accounts, transactions, budgets }: ReportsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(TOP_CATEGORIES[0]);

  const last6Months = getLast6MonthsData(transactions);
  const spendingByCategory = getSpendingByCategory(transactions);
  const budgetProgress = getBudgetProgress(budgets, transactions);
  const categoryTrend = getCategoryTrend(transactions, selectedCategory, 6);

  const monthlyIncome = getMonthlyIncome(transactions);
  const monthlyExpenses = getMonthlyExpenses(transactions);
  const savingsRate = getSavingsRate(monthlyIncome, monthlyExpenses);

  const totalIncome6M = last6Months.reduce((s, m) => s + m.income, 0);
  const totalExpenses6M = last6Months.reduce((s, m) => s + m.expenses, 0);
  const avgMonthlyIncome = totalIncome6M / 6;
  const avgMonthlyExpenses = totalExpenses6M / 6;

  const topSpendingCategories = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const totalCategorySpend = topSpendingCategories.reduce((s, [, v]) => s + v, 0);

  const overBudget = budgetProgress.filter(p => p.overBudget);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5">Insights into your financial health</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Avg Monthly Income',
            value: formatCurrency(avgMonthlyIncome),
            color: 'text-emerald-400',
            sub: 'Last 6 months',
          },
          {
            label: 'Avg Monthly Expenses',
            value: formatCurrency(avgMonthlyExpenses),
            color: 'text-red-400',
            sub: 'Last 6 months',
          },
          {
            label: 'Savings Rate',
            value: `${savingsRate.toFixed(1)}%`,
            color: savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400',
            sub: savingsRate >= 20 ? 'On track' : 'Below 20% goal',
          },
          {
            label: 'Over Budget',
            value: `${overBudget.length} / ${budgets.length}`,
            color: overBudget.length > 0 ? 'text-red-400' : 'text-emerald-400',
            sub: overBudget.length === 0 ? 'All within budget' : 'categories',
          },
        ].map(metric => (
          <div key={metric.label} className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 shadow-lg">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{metric.label}</p>
            <p className={`text-xl font-bold mt-1 ${metric.color}`}>{metric.value}</p>
            <p className="text-xs text-slate-500 mt-1">{metric.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Income vs Expenses"
            subtitle="Last 6 months"
            icon={<BarChart3 size={16} className="text-indigo-400" />}
          />
          <div className="p-6">
            <IncomeExpenseBar data={last6Months} />
          </div>
          <div className="px-6 pb-4 grid grid-cols-3 gap-3 border-t border-slate-700/50 pt-4">
            {[
              { label: 'Total Income', value: formatCurrency(totalIncome6M), color: 'text-emerald-400' },
              { label: 'Total Expenses', value: formatCurrency(totalExpenses6M), color: 'text-red-400' },
              { label: 'Net Savings', value: formatCurrency(totalIncome6M - totalExpenses6M), color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Spending by Category"
            subtitle="Current month"
            icon={<PieChart size={16} className="text-indigo-400" />}
          />
          <div className="p-6">
            <SpendingDonut data={spendingByCategory} />
          </div>
        </Card>
      </div>

      {/* Category Trend */}
      <Card>
        <CardHeader
          title="Category Spending Trend"
          subtitle="6-month history for selected category"
          icon={<TrendingUp size={16} className="text-indigo-400" />}
          action={
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-slate-500" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(spendingByCategory).length > 0
                  ? Object.keys(spendingByCategory)
                      .sort()
                      .map(c => <option key={c} value={c}>{c}</option>)
                  : TOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>
          }
        />
        <div className="p-6">
          <TrendLine data={categoryTrend} color={CATEGORY_COLORS[selectedCategory] || '#6366f1'} />
        </div>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader
            title="Top Spending Categories"
            subtitle="Current month"
            icon={<BarChart3 size={16} className="text-slate-400" />}
          />
          <div className="p-5 space-y-3">
            {topSpendingCategories.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No expenses this month</p>
            ) : (
              topSpendingCategories.map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[category] || '#6b7280' }}
                      />
                      <span className="text-sm text-slate-300">{category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {formatPercent(amount, totalCategorySpend)}
                      </span>
                      <span className="text-sm font-semibold text-slate-200">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(amount / totalCategorySpend) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[category] || '#6366f1',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Budget Performance */}
        <Card>
          <CardHeader
            title="Budget Performance"
            subtitle="Current month"
            icon={<TrendingUp size={16} className="text-slate-400" />}
          />
          <div className="p-5 space-y-2.5">
            {budgetProgress.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No budgets configured</p>
            ) : (
              budgetProgress.slice(0, 6).map(({ budget, spent, percentage, overBudget }) => (
                <div key={budget.id} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: overBudget ? '#ef4444' : budget.color }}
                  />
                  <span className="text-sm text-slate-400 w-28 truncate">{budget.category}</span>
                  <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: overBudget ? '#ef4444' : budget.color,
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium min-w-[3.5rem] text-right ${overBudget ? 'text-red-400' : 'text-slate-400'}`}>
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
