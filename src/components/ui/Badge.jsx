import { cn } from '@/lib/utils';

const TONES = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  accent: 'bg-accent-50 text-accent-700 ring-accent-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 ring-amber-100',
  danger: 'bg-red-50 text-red-600 ring-red-100',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  hot: 'bg-red-50 text-red-600 ring-red-100',
  warm: 'bg-amber-50 text-amber-700 ring-amber-100',
  cold: 'bg-sky-50 text-sky-700 ring-sky-100',
};

export function Badge({ children, tone = 'brand', className, icon: Icon }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        TONES[tone] || TONES.brand,
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />}
      {children}
    </span>
  );
}
