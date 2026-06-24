import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { cn } from '@/lib/utils';

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-50 text-accent-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-500',
  slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({ icon: Icon, label, value, prefix = '', suffix = '', tone = 'brand', hint }) {
  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-line shadow-soft">
      <div className="flex items-center justify-between">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', TONES[tone])}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold text-heading">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="mt-1 text-sm font-medium text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted/80">{hint}</p>}
    </div>
  );
}
