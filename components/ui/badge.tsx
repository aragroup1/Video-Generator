import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'gradient-brand text-white shadow-lg shadow-purple-500/30',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    outline: 'text-slate-700 border-2 border-slate-200',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
