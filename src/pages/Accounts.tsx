import { useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, CreditCard, PiggyBank, Briefcase, Banknote } from 'lucide-react';
import { Account, Transaction } from '../types';
import { Card, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import { Badge } from '../components/UI/Badge';
import { useToast } from '../components/UI/Toast';
import { formatCurrency } from '../utils/formatters';

interface AccountsProps {
  accounts: Account[];
  transactions: Transaction[];
  onAdd: (account: Account) => void;
  onUpdate: (id: string, updates: Partial<Account>) => void;
  onDelete: (id: string) => void;
}

type AccountType = Account['type'];

const ACCOUNT_ICONS: Record<AccountType, React.ReactNode> = {
  checking: <Wallet size={18} />,
  savings: <PiggyBank size={18} />,
  credit: <CreditCard size={18} />,
  cash: <Banknote size={18} />,
  investment: <Briefcase size={18} />,
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit Card',
  cash: 'Cash',
  investment: 'Investment',
};

const PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#84cc16',
  '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899',
  '#14b8a6', '#f97316', '#06b6d4', '#a78bfa',
];

interface AccountFormData {
  name: string;
  type: AccountType;
  balance: string;
  currency: string;
  color: string;
}

function AccountModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => void;
  initial?: Account;
}) {
  const [form, setForm] = useState<AccountFormData>({
    name: initial?.name ?? '',
    type: initial?.type ?? 'checking',
    balance: initial ? String(initial.balance) : '',
    currency: initial?.currency ?? 'USD',
    color: initial?.color ?? PALETTE[0],
  });

  const set = <K extends keyof AccountFormData>(key: K, value: AccountFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.balance === '' || isNaN(Number(form.balance))) return;
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Account' : 'New Account'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Main Checking"
            required
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Type</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value as AccountType)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map(t => (
              <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Balance ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.balance}
              onChange={e => set('balance', e.target.value)}
              placeholder="0.00"
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
            <select
              value={form.currency}
              onChange={e => set('currency', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
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
                  outline: form.color === color ? '3px solid white' : 'none',
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
            {initial ? 'Save Changes' : 'Add Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function Accounts({ accounts, transactions, onAdd, onUpdate, onDelete }: AccountsProps) {
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0);

  const getAccountTransactionCount = (accountId: string) =>
    transactions.filter(t => t.accountId === accountId).length;

  const handleAdd = (data: AccountFormData) => {
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      type: data.type,
      balance: Number(data.balance),
      currency: data.currency,
      color: data.color,
    });
    setShowAdd(false);
    showToast('Account added');
  };

  const handleEdit = (data: AccountFormData) => {
    if (!editAccount) return;
    onUpdate(editAccount.id, {
      name: data.name,
      type: data.type,
      balance: Number(data.balance),
      currency: data.currency,
      color: data.color,
    });
    setEditAccount(null);
    showToast('Account updated');
  };

  const handleDelete = () => {
    if (!deleteAccount) return;
    onDelete(deleteAccount.id);
    setDeleteAccount(null);
    showToast('Account deleted');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-200">Accounts</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your financial accounts</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus size={15} /> Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 shadow-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Net Worth</p>
          <p className={`text-2xl font-bold mt-1 ${totalBalance < 0 ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{accounts.length} accounts</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 shadow-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total Assets</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalAssets)}</p>
          <p className="text-xs text-slate-500 mt-1">positive balances</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-4 shadow-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(Math.abs(totalLiabilities))}</p>
          <p className="text-xs text-slate-500 mt-1">credit card debt</p>
        </div>
      </div>

      {/* Accounts Grid */}
      <Card>
        <CardHeader
          title="All Accounts"
          subtitle="Your financial accounts"
          icon={<Wallet size={16} className="text-indigo-400" />}
        />
        {accounts.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No accounts yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first account to get started</p>
            <Button className="mt-4" onClick={() => setShowAdd(true)}>
              <Plus size={15} /> Add Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {accounts.map(account => {
              const txCount = getAccountTransactionCount(account.id);
              return (
                <div
                  key={account.id}
                  className="rounded-xl border border-slate-700/50 p-5 relative overflow-hidden group"
                  style={{ backgroundColor: account.color + '08' }}
                >
                  {/* Background accent */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10"
                    style={{ backgroundColor: account.color }}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="p-2.5 rounded-xl"
                        style={{ backgroundColor: account.color + '20', color: account.color }}
                      >
                        {ACCOUNT_ICONS[account.type]}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditAccount(account)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteAccount(account)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-300">{account.name}</p>
                    <p className={`text-2xl font-bold mt-1 ${account.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge color={account.color}>{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
                      <span className="text-xs text-slate-500">{txCount} transactions</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modals */}
      <AccountModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
      />
      {editAccount && (
        <AccountModal
          isOpen={!!editAccount}
          onClose={() => setEditAccount(null)}
          onSave={handleEdit}
          initial={editAccount}
        />
      )}
      <ConfirmModal
        isOpen={!!deleteAccount}
        onClose={() => setDeleteAccount(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        message={`Delete "${deleteAccount?.name}"? Existing transactions linked to this account will remain.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
