import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

function StarIcon({ size, className }) {
  return <Star style={{ width: size, height: size }} className={className} strokeWidth={1.5} />;
}

function DisplayStar({ index, value, size }) {
  const filled = value >= index;
  const half = !filled && value >= index - 0.5;

  if (half) {
    return (
      <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <StarIcon size={size} className="fill-slate-200 text-slate-200" />
        <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
          <StarIcon size={size} className="fill-amber-400 text-amber-400" />
        </span>
      </span>
    );
  }

  return (
    <StarIcon
      size={size}
      className={filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
    />
  );
}

/** Display-only star rating (supports half stars). */
export function Stars({ value = 0, size = 16, className }) {
  const display = Math.round(value * 10) / 10;

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={`${display} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <DisplayStar key={n} index={n} value={value} size={size} />
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
          <StarIcon
            size={size}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-300'}
          />
        </button>
      ))}
    </div>
  );
}
