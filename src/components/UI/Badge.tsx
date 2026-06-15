import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'default' | 'income' | 'expense' | 'transfer';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-slate-700 text-slate-300',
  income: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/50',
  expense: 'bg-red-900/50 text-red-400 border border-red-800/50',
  transfer: 'bg-blue-900/50 text-blue-400 border border-blue-800/50',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, color, variant = 'default', size = 'md' }: BadgeProps) {
  if (color) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
        style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
