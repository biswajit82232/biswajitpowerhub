import { cn } from '@/lib/utils';

/**
 * Compact boolean control — checkbox chip or switch style for admin forms.
 */
export function AdminToggle({
  checked,
  onChange,
  label,
  hint,
  className,
  disabled = false,
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition',
        checked ? 'border-brand-300 bg-brand-50/60' : 'border-line bg-white hover:border-brand-200',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-brand-600 focus:ring-brand-500"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-heading">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] leading-snug text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}
