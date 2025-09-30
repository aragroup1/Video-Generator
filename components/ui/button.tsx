import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'gradient-brand text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40',
      destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
      outline: 'border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 hover:border-purple-300',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-700',
      link: 'text-purple-600 underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-11 px-6 py-2',
      sm: 'h-9 rounded-lg px-4 text-sm',
      lg: 'h-12 rounded-xl px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
