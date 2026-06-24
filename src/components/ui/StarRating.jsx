import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Display-only star rating. */
export function Stars({ value = 0, size = 16, className }) {
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
        />
      ))}
    </div>
  );
}

/** Interactive star input. */
export function StarInput({ value, onChange, size = 28 }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="tap-target rounded-md p-1 transition-transform active:scale-90"
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-300'}
          />
        </button>
      ))}
    </div>
  );
}
