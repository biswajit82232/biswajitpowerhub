import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, GitCompare } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { ScooterImage } from '@/components/common/ScooterImage';
import { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { formatINR } from '@/lib/utils';
import { emiFrom } from '@/lib/finance';
import { useFinance } from '@/context/FinanceSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

function compareRows(settings) {
  return [
    { label: 'Price', get: (s) => formatINR(s.price) },
    { label: 'EMI from', get: (s) => `${formatINR(emiFrom({ price: s.price, settings }))}/mo*` },
    { label: 'Range', get: (s) => `${s.range} km` },
    { label: 'Top speed', get: (s) => `${s.topSpeed} km/h` },
    { label: 'Battery', get: (s) => s.batteryCapacity },
    { label: 'Battery type', get: (s) => s.batteryType },
    { label: 'Charging time', get: (s) => s.chargingTime },
    { label: 'Motor', get: (s) => s.motor },
    { label: 'Weight', get: (s) => s.weight },
    { label: 'Load capacity', get: (s) => s.loadCapacity },
    { label: 'Warranty', get: (s) => s.warranty },
  ];
}

export default function Compare() {
  const { data: scooters } = useAsync(() => getScooters(), []);
  const { settings } = useFinance();
  const rows = useMemo(() => compareRows(settings), [settings]);
  const [selected, setSelected] = useState([]);
  const tracked = useRef(false);

  useEffect(() => {
    if (scooters && scooters.length && selected.length === 0) {
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
    [selected, scooters]
  );

  const available = scooters?.filter((s) => !selected.includes(s.id)) || [];

  const addSlot = (id) => id && setSelected((s) => [...s, id].slice(0, 3));
  const remove = (id) => setSelected((s) => s.filter((x) => x !== id));

  return (
    <>
      <SEO title="Compare Scooters" description="Compare electric scooter models side by side." path="/compare" />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-12">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              <GitCompare className="h-3.5 w-3.5" /> Compare
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">Compare models</h1>
            <p className="mt-3 max-w-xl text-body">Put up to three scooters head-to-head and find your match.</p>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-10">
        {chosen.length === 0 ? (
          <EmptyState icon={GitCompare} title="Pick scooters to compare" description="Add models below to begin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-bg" />
                  {chosen.map((s) => (
                    <th key={s.id} className="p-3 align-top">
                      <div className="relative rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft">
                        <button
                          onClick={() => remove(s.id)}
                          className="absolute right-2 top-2 rounded-full bg-slate-100 p-1 text-muted transition hover:bg-slate-200"
                          aria-label={`Remove ${s.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <ScooterImage src={s.images?.[0]} hue={s.hue} name={s.name} alt={s.name} className="aspect-[4/3] w-full rounded-xl" />
                        <p className="mt-3 break-words font-display text-base font-bold text-heading">{s.name}</p>
                        <Button to={`/scooters/${s.id}`} variant="secondary" size="sm" className="mt-2 w-full">
                          View
                        </Button>
                      </div>
                    </th>
                  ))}
                  {chosen.length < 3 && available.length > 0 && (
                    <th className="p-3 align-top">
                      <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface/50 p-4">
                        <Plus className="h-6 w-6 text-brand-400" />
                        <Select onChange={(e) => addSlot(e.target.value)} value="" className="w-40">
                          <option value="" disabled>
                            Add model
                          </option>
                          {available.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 ? 'bg-surface-alt/40' : ''}>
                    <td className="sticky left-0 z-10 min-w-[7rem] bg-inherit px-3 py-3.5 text-sm font-semibold text-heading sm:min-w-[8.5rem]">
                      {row.label}
                    </td>
                    {chosen.map((s) => (
                      <td key={s.id} className="min-w-[8.5rem] break-words px-4 py-3.5 text-left text-sm text-body sm:text-center">
                        {row.get(s)}
                      </td>
                    ))}
                    {chosen.length < 3 && available.length > 0 && <td />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
