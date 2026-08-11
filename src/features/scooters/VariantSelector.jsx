import { Check } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getCheapestVariant, getScooterVariants } from '@/lib/scooterVariants';

export function VariantSelector({ scooter, selectedId, onChange }) {
  const variants = getScooterVariants(scooter);
  if (variants.length < 2) return null;

  const cheapest = getCheapestVariant(scooter);
  const minPrice = cheapest?.price ?? null;
  const startingName = cheapest?.name || 'starting pack';
  const ranges = variants.map((v) => v.range).filter((r) => typeof r === 'number');
  const maxRange = ranges.length ? Math.max(...ranges) : null;

  return (
    <div className="mt-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">
        Choose your battery
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {variants.map((variant) => {
          const selected = variant.id === selectedId;
          const priceDelta =
            minPrice != null && variant.price != null && variant.price > minPrice
              ? variant.price - minPrice
              : null;
          const isBestRange = maxRange != null && variant.range === maxRange;
          const isStarting = cheapest && variant.id === cheapest.id;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onChange(variant.id)}
              aria-pressed={selected}
              className={`relative rounded-2xl px-4 py-4 text-left transition-all duration-200 ${
                selected
                  ? 'bg-brand-50 shadow-soft ring-2 ring-brand-500'
                  : 'bg-surface ring-1 ring-line hover:ring-brand-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-display text-sm font-bold text-heading sm:text-base">
                    {variant.name}
                  </span>
                  {isBestRange && (
                    <span className="ml-2 inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 ring-1 ring-sky-100">
                      Max range
                    </span>
                  )}
                </div>
                {selected && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </div>

              <p className="mt-2 font-display text-2xl font-extrabold leading-none text-heading">
                {formatINR(variant.price)}
              </p>
              {priceDelta != null ? (
                <p className="mt-1 text-xs font-semibold text-brand-700">
                  +{formatINR(priceDelta)} vs {startingName}
                </p>
              ) : isStarting ? (
                <p className="mt-1 text-xs font-medium text-muted">Starting pack</p>
              ) : null}

              {variant.range != null && (
                <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-heading ring-1 ring-brand-100">
                  Up to {variant.range} km
                  <span className="ml-1 font-medium text-muted">per charge</span>
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
