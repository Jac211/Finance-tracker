import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, Account, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS } from '../types';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import { useToast } from '../components/UI/Toast';
import { filterTransactions } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  onAdd: (t: Transaction) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onImport: (ts: Transaction[]) => void;
}

const PAGE_SIZE = 15;

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

interface TransactionFormProps {
  initial?: Partial<Transaction>;
  accounts: Account[];
  onSubmit: (t: Transaction) => void;
  onClose: () => void;
}

function TransactionForm({ initial, accounts, onSubmit, onClose }: TransactionFormProps) {
  const [form, setForm] = useState({
    type: initial?.type || 'expense',
    accountId: initial?.accountId || accounts[0]?.id || '',
    amount: initial?.amount?.toString() || '',
    category: initial?.category || 'Food & Dining',
    description: initial?.description || '',
    date: initial?.date || new Date().toISOString().split('T')[0],
    notes: initial?.notes || '',
  });

  const categories = form.type === 'income' ? INCOME_CATEGORIES : form.type === 'expense' ? EXPENSE_CATEGORIES : ['Transfer'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onSubmit({
      id: initial?.id || generateId(),
      type: form.type as Transaction['type'],
      accountId: form.accountId,
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description,
      date: form.date,
      notes: form.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
        {(['expense', 'income', 'transfer'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setForm(f => ({
              ...f,
              type,
              category: type === 'income' ? 'Salary' : type === 'transfer' ? 'Transfer' : 'Food & Dining',
            }))}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              form.type === type
                ? type === 'income' ? 'bg-emerald-600 text-white'
                : type === 'expense' ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Account */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Account</label>
          <select
            value={form.accountId}
            onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What was this for?"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes (optional)</label>
          <input
            type="text"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Additional notes"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit">{initial?.id ? 'Save Changes' : 'Add Transaction'}</Button>
      </div>
    </form>
  );
}

export function Transactions({ transactions, accounts, onAdd, onUpdate, onDelete, onImport }: TransactionsProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const accountMap = new Map(accounts.map(a => [a.id, a]));

  const filtered = useMemo(() => {
    return filterTransactions(transactions, {
      search,
      category: filterCategory,
      type: filterType,
      accountId: filterAccount,
      startDate: filterStart,
      endDate: filterEnd,
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filterCategory, filterType, filterAccount, filterStart, filterEnd]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = (t: Transaction) => {
    onAdd(t);
    setShowAddModal(false);
    showToast('Transaction added successfully');
  };

  const handleUpdate = (t: Transaction) => {
    onUpdate(t.id, t);
    setEditTransaction(null);
    showToast('Transaction updated');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    showToast('Transaction deleted', 'error');
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const imported: Transaction[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
          if (!row.amount || !row.description) continue;
          imported.push({
            id: generateId(),
            accountId: accounts[0]?.id || '',
            type: (row.type as Transaction['type']) || 'expense',
            amount: Math.abs(parseFloat(row.amount) || 0),
            category: row.category || 'Other',
            description: row.description,
            date: row.date || new Date().toISOString().split('T')[0],
            notes: row.notes,
          });
        }
        if (imported.length > 0) {
          onImport(imported);
          showToast(`Imported ${imported.length} transactions`);
        } else {
          showToast('No valid transactions found in CSV', 'error');
        }
      } catch {
        showToast('Failed to parse CSV file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Transactions</h2>
          <p className="text-sm text-slate-400 mt-0.5">{filtered.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer">
              <Upload size={15} />
              <span className="hidden sm:inline">Import CSV</span>
            </span>
          </label>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(f => !f)}>
              <Filter size={15} />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-700/50 animate-fade-in">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={e => { setFilterType(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Account</label>
                <select
                  value={filterAccount}
                  onChange={e => { setFilterAccount(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date Range</label>
                <div className="flex gap-1">
                  <input
                    type="date"
                    value={filterStart}
                    onChange={e => setFilterStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="date"
                    value={filterEnd}
                    onChange={e => setFilterEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transactions List */}
      <Card>
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Search size={40} className="mb-3 opacity-40" />
            <p className="font-medium">No transactions found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {paginated.map(t => {
              const account = accountMap.get(t.accountId);
              const color = CATEGORY_COLORS[t.category] || '#6b7280';
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 md:px-6 py-3.5 hover:bg-slate-700/20 transition-colors group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ backgroundColor: color + '20', color }}
                  >
                    {t.category.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.description}</p>
                      <Badge color={color} size="sm">{t.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{formatDate(t.date)}</span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-500">{account?.name || 'Unknown'}</span>
                      {t.notes && (
                        <>
                          <span className="text-xs text-slate-600">·</span>
                          <span className="text-xs text-slate-500 italic">{t.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-sm font-semibold ${
                      t.type === 'income' ? 'text-emerald-400' : t.type === 'transfer' ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditTransaction(t)}
                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages} ({filtered.length} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Transaction" size="lg">
        <TransactionForm accounts={accounts} onSubmit={handleAdd} onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTransaction} onClose={() => setEditTransaction(null)} title="Edit Transaction" size="lg">
        {editTransaction && (
          <TransactionForm initial={editTransaction} accounts={accounts} onSubmit={handleUpdate} onClose={() => setEditTransaction(null)} />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); setDeleteId(null); }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
