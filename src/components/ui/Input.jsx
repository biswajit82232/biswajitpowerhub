import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-xl bg-surface px-4 text-[0.95rem] text-heading placeholder:text-muted/70 ' +
  'ring-1 ring-line transition-all duration-200 ' +
  'focus:ring-2 focus:ring-brand-400 focus:outline-none disabled:opacity-60';

export function Label({ children, htmlFor, required, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('mb-1.5 block text-sm font-semibold text-heading', className)}
    >
      {children}
      {required && <span className="ml-0.5 text-brand-500">*</span>}
    </label>
  );
}

export function Field({ label, htmlFor, required, error, hint, children, className }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(fieldBase, 'h-12', error && 'ring-red-300 focus:ring-red-400', className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldBase, 'py-3 resize-none', error && 'ring-red-300 focus:ring-red-400', className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, error, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(fieldBase, 'h-12 appearance-none pr-10', error && 'ring-red-300', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.85rem center',
      }}
      {...props}
    >
      {children}
    </select>
  );
});
