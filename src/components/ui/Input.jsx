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
      {required && <span className="ml-0.5 text-brand-700">*</span>}
    </label>
  );
}

export function Field({ label, htmlFor, required, error, hint, children, className }) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id, error, hint) {
  if (error && id) return `${id}-error`;
  if (hint && id) return `${id}-hint`;
  return undefined;
}

export const Input = forwardRef(function Input({ className, error, hint, id, ...props }, ref) {
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(fieldBase, 'h-12', error && 'ring-red-400 focus:ring-red-500', className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, hint, id, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(fieldBase, 'py-3 resize-none', error && 'ring-red-400 focus:ring-red-500', className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, error, hint, id, ...props }, ref) {
  return (
    <select
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(fieldBase, 'h-12 appearance-none pr-10', error && 'ring-red-400', className)}
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
