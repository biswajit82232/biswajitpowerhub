import { cn } from '@/lib/utils';

/**
 * Accessible range slider with a brand-gradient fill track.
 */
export function RangeSlider({ value, min, max, step = 1, onChange, className, id, ariaLabel }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn('bph-range w-full cursor-pointer', className)}
      style={{
        background: `linear-gradient(to right, #A1002A 0%, #DE0039 ${pct}%, #E2E8F0 ${pct}%, #E2E8F0 100%)`,
      }}
    />
  );
}
