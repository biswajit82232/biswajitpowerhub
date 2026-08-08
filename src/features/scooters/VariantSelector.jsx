import { Check } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getScooterVariants } from '@/lib/scooterVariants';

export function VariantSelector({ scooter, selectedId, onChange }) {
  const variants = getScooterVariants(scooter);
  if (variants.length < 2) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Choose your variant
      </p>
      <div className="grid grid-cols-2 gap-2">
        {variants.map((variant) => {
          const selected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onChange(variant.id)}
              className={`relative rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                selected
                  ? 'bg-brand-50 ring-2 ring-brand-500'
                  : 'bg-surface ring-1 ring-line hover:ring-brand-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-heading">{variant.name}</span>
                {selected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={3} />
                )}
              </div>
              <p className="mt-0.5 font-display text-base font-extrabold leading-tight text-heading">
                {formatINR(variant.price)}
              </p>
              {variant.range && (
                <p className="mt-0.5 text-[11px] leading-tight text-muted">
                  Up to {variant.range} km
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
