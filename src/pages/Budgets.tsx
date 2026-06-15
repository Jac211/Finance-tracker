import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { Budget, Transaction, EXPENSE_CATEGORIES, CATEGORY_COLORS } from '../types';
import { Card, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import { useToast } from '../components/UI/Toast';
import { getBudgetProgress } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAdd: (budget: Budget) => void;
  onUpdate: (id: string, updates: Partial<Budget>) => void;
  onDelete: (id: string) => void;
}

const PALETTE = [
  '#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#0ea5e9', '#f97316', '#10b981',
  '#84cc16', '#06b6d4',
];

interface BudgetFormData {
  category: string;
  amount: string;
  color: string;
}

function BudgetModal({
  isOpen,
  onClose,
  onSave,
  initial,
  existingCategories,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BudgetFormData) => void;
  initial?: Budget;
  existingCategories: string[];
}) {
  const availableCategories = initial
    ? EXPENSE_CATEGORIES
    : EXPENSE_CATEGORIES.filter(c => !existingCategories.includes(c));

  const [form, setForm] = useState<BudgetFormData>({
    category: initial?.category ?? (availableCategories[0] || ''),
    amount: initial ? String(initial.amount) : '',
    color: initial?.color ?? (CATEGORY_COLORS[availableCategories[0]] || PALETTE[0]),
  });

  const set = (key: keyof BudgetFormData, value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'category') {
        next.color = CATEGORY_COLORS[value] || PALETTE[0];
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.amount || isNaN(Number(form.amount))) return;
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Budget' : 'New Budget'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            disabled={!!initial}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {(initial ? EXPENSE_CATEGORIES : availableCategories).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Budget ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0.00"
            required
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Color</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => set('color', color)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  outline: form.color === color ? `3px solid white` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {initial ? 'Save Changes' : 'Add Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function Budgets({ budgets, transactions, onAdd, onUpdate, onDelete }: BudgetsProps) {
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [deleteBudget, setDeleteBudget] = useState<Budget | null>(null);

  const progress = getBudgetProgress(budgets, transactions);
  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = progress.reduce((s, p) => s + p.spent, 0);
  const overBudgetCount = progress.filter(p => p.overBudget).length;

  const handleAdd = (data: BudgetFormData) => {
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      category: data.category,
      amount: Number(data.amount),
      period: 'monthly',
      color: data.color,
    });
    setShowAdd(false);
    showToast('Budget created');
  };

  const handleEdit = (data: BudgetFormData) => {
    if (!editBudget) return;
    onUpdate(editBudget.id, { amount: Number(data.amount), color: data.color });
    setEditBudget(null);
    showToast('Budget updated');
  };

  const handleDelete = () => {
    if (!deleteBudget) return;
    onDelete(deleteBudget.id);
    setDeleteBudget(null);
    showToast('Budget deleted');
  };

  const existingCategories = budgets.map(b => b.category);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-200">Monthly Budgets</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track spending against your budget goals</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus size={15} /> New Budget
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 shadow-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total Budgeted</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalBudgeted)}</p>
          <p className="text-xs text-slate-500 mt-1">per month</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 shadow-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total Spent</p>
          <p className={`text-2xl font-bold mt-1 ${totalSpent > totalBudgeted ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-xs text-slate-500 mt-1">this month</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 shadow-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${totalBudgeted - totalSpent < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {formatCurrency(Math.abs(totalBudgeted - totalSpent))}
          </p>
          <p className={`text-xs mt-1 ${overBudgetCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
            {overBudgetCount > 0 ? `${overBudgetCount} over budget` : 'all within budget'}
          </p>
        </div>
      </div>

      {/* Budget List */}
      <Card>
        <CardHeader
          title="Budget Breakdown"
          subtitle="Current month spending"
          icon={<Target size={16} className="text-indigo-400" />}
        />
        {budgets.length === 0 ? (
          <div className="p-12 text-center">
            <Target size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No budgets set</p>
            <p className="text-slate-500 text-sm mt-1">Create a budget to start tracking your spending</p>
            <Button className="mt-4" onClick={() => setShowAdd(true)}>
              <Plus size={15} /> Add First Budget
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {progress.map(({ budget, spent, percentage, remaining, overBudget }) => (
              <div key={budget.id} className="p-5 hover:bg-slate-700/10 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: budget.color + '20', color: budget.color }}
                    >
                      {budget.category.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{budget.category}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {overBudget ? (
                          <AlertTriangle size={11} className="text-red-400" />
                        ) : (
                          <CheckCircle size={11} className="text-emerald-400" />
                        )}
                        <span className={`text-xs font-medium ${overBudget ? 'text-red-400' : 'text-slate-400'}`}>
                          {overBudget ? `$${(spent - budget.amount).toFixed(2)} over` : `${formatCurrency(remaining)} left`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-200">{formatCurrency(spent)}</p>
                      <p className="text-xs text-slate-500">of {formatCurrency(budget.amount)}</p>
                    </div>
                    <span
                      className="text-sm font-bold min-w-[3rem] text-right"
                      style={{ color: overBudget ? '#f87171' : budget.color }}
                    >
                      {formatPercent(spent, budget.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditBudget(budget)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteBudget(budget)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: overBudget ? '#ef4444' : budget.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <BudgetModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        existingCategories={existingCategories}
      />
      {editBudget && (
        <BudgetModal
          isOpen={!!editBudget}
          onClose={() => setEditBudget(null)}
          onSave={handleEdit}
          initial={editBudget}
          existingCategories={existingCategories}
        />
      )}
      <ConfirmModal
        isOpen={!!deleteBudget}
        onClose={() => setDeleteBudget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Remove the ${deleteBudget?.category} budget? This won't affect your transactions.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
