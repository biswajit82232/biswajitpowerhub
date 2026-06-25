import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, GitCompare } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { ScooterImage } from '@/components/common/ScooterImage';
import { Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { cn, formatINR } from '@/lib/utils';
import { emiFrom } from '@/lib/finance';
import { useFinance } from '@/context/FinanceSettingsContext';
import { EMI_DISCLAIMER, EMI_DISCLAIMER_NOTE } from '@/config/finance';
import { trackEvent, EVENT } from '@/lib/tracking';
import {
  formatPriceRange,
  formatRangeRange,
  formatVariantSpec,
  getStartingPrice,
} from '@/lib/scooterVariants';

const MAX_SLOTS = 3;
const LABEL_W = '8.75rem';

function compareRows(settings) {
  return [
    { label: 'Price', get: (s) => formatPriceRange(s, formatINR) },
    { label: 'EMI from', get: (s) => `${formatINR(emiFrom({ price: getStartingPrice(s), settings }))}/mo*` },
    { label: 'Range', get: (s) => formatRangeRange(s) },
    { label: 'Top speed', get: (s) => `${s.topSpeed} km/h` },
    { label: 'Battery', get: (s) => formatVariantSpec(s, 'batteryCapacity') },
    { label: 'Battery type', get: (s) => formatVariantSpec(s, 'batteryType') },
    { label: 'Battery warranty', get: (s) => formatVariantSpec(s, 'batteryWarranty') },
    { label: 'Charging time', get: (s) => s.chargingTime },
    { label: 'Motor', get: (s) => s.motor },
    { label: 'Weight', get: (s) => s.weight },
    { label: 'Load capacity', get: (s) => s.loadCapacity },
    { label: 'Warranty', get: (s) => s.warranty },
  ];
}

function stickyLabelClass(even) {
  return cn(
    'sticky left-0 z-20 border-r border-line shadow-[4px_0_8px_-4px_rgba(15,23,42,0.14)]',
    even ? 'bg-surface-alt' : 'bg-surface',
  );
}

function CompactSlot({ scooter, options, onChange, onRemove, canRemove }) {
  return (
    <div className="relative flex min-w-[9.5rem] items-center gap-2 p-2 sm:min-w-[10.5rem] sm:p-2.5">
      <ScooterImage
        src={scooter.images?.[0]}
        hue={scooter.hue}
        name={scooter.name}
        alt=""
        className="h-11 w-14 shrink-0 rounded-lg sm:h-12 sm:w-[3.25rem]"
      />
      <div className="min-w-0 flex-1">
        <Select
          value={scooter.id}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 px-2 text-xs font-semibold"
          aria-label={`Change ${scooter.name}`}
        >
          {options.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <p className="mt-0.5 truncate text-[11px] font-bold text-heading sm:text-xs">
          {formatPriceRange(scooter, formatINR)}
        </p>
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-full p-1 text-muted ring-1 ring-line transition hover:bg-surface-alt hover:text-heading"
          aria-label={`Remove ${scooter.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function CompactAddSlot({ options, onAdd }) {
  return (
    <div className="flex min-w-[9.5rem] items-center gap-2 border-l border-dashed border-line p-2 sm:min-w-[10.5rem] sm:p-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 ring-1 ring-brand-100">
        <Plus className="h-4 w-4" />
      </span>
      <Select onChange={(e) => onAdd(e.target.value)} value="" className="h-8 min-w-0 flex-1 px-2 text-xs">
        <option value="" disabled>
          Add model
        </option>
        {options.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
    </div>
  );
}

function CompareGrid({ chosen, rows, available, onSwap, onRemove, onAdd, optionsFor }) {
  const showAdd = chosen.length < MAX_SLOTS && available.length > 0;
  const colCount = chosen.length + (showAdd ? 1 : 0);
  const gridCols = `${LABEL_W} repeat(${colCount}, minmax(9.5rem, 1fr))`;

  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line shadow-soft">
      <p className="border-b border-line bg-surface-alt px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted sm:hidden">
        Swipe to compare →
      </p>

      <div className="isolate overflow-x-auto overscroll-x-contain">
        <div
          className="grid min-w-max border-collapse"
          style={{ gridTemplateColumns: gridCols }}
        >
          {/* Header row — scrolls with columns; only spec labels stick below */}
          <div
            className={cn(
              'sticky left-0 z-30 border-b border-r border-line bg-surface-alt px-3 py-2.5',
              'text-[10px] font-bold uppercase tracking-wide text-muted shadow-[4px_0_8px_-4px_rgba(15,23,42,0.14)]',
            )}
          >
            Models
          </div>

          {chosen.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'border-b border-line bg-surface-alt',
                i < chosen.length - 1 || showAdd ? 'border-r border-line' : '',
              )}
            >
              <CompactSlot
                scooter={s}
                options={optionsFor(s.id)}
                onChange={(id) => onSwap(s.id, id)}
                onRemove={() => onRemove(s.id)}
                canRemove={chosen.length > 1}
              />
            </div>
          ))}

          {showAdd && (
            <div className="border-b border-line bg-surface-alt">
              <CompactAddSlot options={available} onAdd={onAdd} />
            </div>
          )}

          {/* Spec rows */}
          {rows.map((row, ri) => {
            const even = ri % 2 === 1;
            return (
              <div key={row.label} className="contents">
                <div
                  className={cn(
                    stickyLabelClass(even),
                    'border-b border-line px-3 py-3 text-xs font-semibold text-heading sm:text-sm',
                    ri === rows.length - 1 && 'border-b-0',
                  )}
                >
                  {row.label}
                </div>

                {chosen.map((s, ci) => (
                  <div
                    key={s.id}
                    className={cn(
                      'border-b border-line px-3 py-3 text-xs leading-snug text-body sm:text-sm',
                      even ? 'bg-surface-alt' : 'bg-surface',
                      ci < chosen.length - 1 || showAdd ? 'border-r border-line' : '',
                      ri === rows.length - 1 && 'border-b-0',
                    )}
                  >
                    {row.get(s)}
                  </div>
                ))}

                {showAdd && (
                  <div
                    className={cn(
                      'border-b border-line px-3 py-3',
                      even ? 'bg-surface-alt' : 'bg-surface',
                      ri === rows.length - 1 && 'border-b-0',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Compare() {
  const { data: scooters, loading } = useAsync(() => getScooters(), []);
  const { settings } = useFinance();
  const rows = useMemo(() => compareRows(settings), [settings]);
  const [selected, setSelected] = useState([]);
  const tracked = useRef(false);

  useEffect(() => {
    if (scooters?.length && selected.length === 0) {
      setSelected(scooters.slice(0, 2).map((s) => s.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scooters]);

  useEffect(() => {
    if (selected.length >= 2 && !tracked.current) {
      tracked.current = true;
      trackEvent(EVENT.COMPARE_USED, { ids: selected });
    }
  }, [selected]);

  const chosen = useMemo(
    () => selected.map((id) => scooters?.find((s) => s.id === id)).filter(Boolean),
    [selected, scooters],
  );

  const available = scooters?.filter((s) => !selected.includes(s.id)) || [];

  const addSlot = (id) => {
    if (!id || selected.includes(id) || selected.length >= MAX_SLOTS) return;
    setSelected((s) => [...s, id]);
  };

  const remove = (id) => setSelected((s) => s.filter((x) => x !== id));

  const swap = (oldId, newId) => {
    if (!newId || oldId === newId) return;
    setSelected((s) => s.map((id) => (id === oldId ? newId : id)));
  };

  const optionsFor = (currentId) =>
    scooters?.filter((s) => !selected.includes(s.id) || s.id === currentId) || [];

  return (
    <>
      <SEO title="Compare Scooters" description="Compare electric scooter models side by side." path="/compare" />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-8 sm:py-10">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              <GitCompare className="h-3.5 w-3.5" /> Compare
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">Compare models</h1>
            <p className="mt-2 max-w-xl text-sm text-body sm:mt-3">
              Pick up to three scooters — compact view below, swipe on mobile to read specs.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-6 sm:py-8">
        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[9rem] shrink-0">
                <ScooterCardSkeleton />
              </div>
            ))}
          </div>
        ) : chosen.length === 0 ? (
          <EmptyState icon={GitCompare} title="Pick scooters to compare" description="Add models below to begin." />
        ) : chosen.length === 1 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {chosen.map((s) => (
                <div key={s.id} className="rounded-xl ring-1 ring-line">
                  <CompactSlot
                    scooter={s}
                    options={optionsFor(s.id)}
                    onChange={(id) => swap(s.id, id)}
                    onRemove={() => remove(s.id)}
                    canRemove={false}
                  />
                </div>
              ))}
              {available.length > 0 && (
                <div className="rounded-xl ring-1 ring-dashed ring-line">
                  <CompactAddSlot options={available} onAdd={addSlot} />
                </div>
              )}
            </div>
            <p className="rounded-xl bg-brand-50 px-4 py-3 text-center text-sm text-brand-800 ring-1 ring-brand-100">
              Add one more model to compare specs side by side.
            </p>
          </div>
        ) : (
          <Reveal>
            <CompareGrid
              chosen={chosen}
              rows={rows}
              available={available}
              onSwap={swap}
              onRemove={remove}
              onAdd={addSlot}
              optionsFor={optionsFor}
            />
            <p className="mt-4 text-xs text-muted">
              {EMI_DISCLAIMER} {EMI_DISCLAIMER_NOTE}
            </p>
          </Reveal>
        )}
      </div>
    </>
  );
}
