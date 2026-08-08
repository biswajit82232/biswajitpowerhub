import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Info,
  Zap,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Select } from '@/components/ui/Input';
import { RangeSlider } from '@/components/ui/RangeSlider';
import {
  simulate,
  getChargingHabit,
  getSuitability,
  getSmartInsight,
  CHARGE_EFFICIENCY,
} from '@/lib/simulator';
import { formatINR, cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';
import { trackEvent, EVENT } from '@/lib/tracking';
import { FINANCE_DEFAULTS } from '@/config/finance';
import { whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { getScooterVariants, hasVariants, withVariant } from '@/lib/scooterVariants';

function CountValue({ value, decimals = 0, prefix = '', suffix = '', duration = 700, className }) {
  const display = useCountUp(value, { active: true, decimals, duration });
  return (
    <span className={className}>
      {prefix}
      {Number(display).toLocaleString('en-IN', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

function SpendBar({ label, pct, variant = 'petrol' }) {
  const fill = useCountUp(pct, { active: true, duration: 800 });
  const isPetrol = variant === 'petrol';

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-heading">{label}</span>
        <span className="font-display text-sm font-bold tabular-nums text-muted">
          {isPetrol ? '₹100' : `≈ ₹${Math.round(fill)}`}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100 sm:h-3.5">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isPetrol
              ? 'bg-gradient-to-r from-slate-400 via-orange-400 to-orange-500'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
          )}
          animate={{ width: `${Math.min(fill, 100)}%` }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function CompareCard({ side, monthly, perKm }) {
  const isEv = side === 'ev';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 sm:p-5',
        isEv
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50/80 ring-1 ring-emerald-200/60'
          : 'bg-slate-50 ring-1 ring-slate-200/80',
      )}
    >
      {isEv && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-300/30 blur-2xl" />
      )}
      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-widest',
          isEv ? 'text-emerald-700' : 'text-slate-500',
        )}
      >
        {isEv ? 'Electric' : 'Petrol'}
      </p>
      <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
        <CountValue value={monthly} prefix="₹" />
        <span className="text-base font-semibold text-muted">/mo</span>
      </p>
      <p className="mt-1 text-sm text-muted">
        ₹<CountValue value={perKm} decimals={2} className="font-semibold text-heading" /> per km
      </p>
    </div>
  );
}

function DetailsPanel({ petrolPrice, petrolMileage, electricityRate, result }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-muted transition hover:text-heading"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <Info className="h-4 w-4" />
          Calculation details
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <dl className="grid gap-3 border-t border-slate-200/80 px-4 py-4 text-sm sm:grid-cols-2">
          {[
            ['Petrol price', `${formatINR(petrolPrice)}/L`],
            ['Electricity rate', `${formatINR(electricityRate)}/unit`],
            ['Petrol mileage', `${petrolMileage} km/L`],
            ['Real-world range', `${result.realRange} km`],
            ['Efficiency factor', `${Math.round(result.realFactor * 100)}%`],
            ['Charging efficiency', `${Math.round(CHARGE_EFFICIENCY * 100)}%`],
          ].map(([label, val]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-semibold text-heading">{val}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

const MATCH_STYLES = {
  excellent: 'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20',
  good: 'bg-teal-500/10 text-teal-800 ring-teal-500/20',
  fair: 'bg-amber-500/10 text-amber-900 ring-amber-500/20',
  stretch: 'bg-orange-500/10 text-orange-900 ring-orange-500/20',
};

export function EVSimulator({ scooters = [], settings, loading = false }) {
  const { site } = useSite();
  const petrolPrice = settings?.petrolPricePerLitre ?? FINANCE_DEFAULTS.petrolPricePerLitre;
  const petrolMileage = settings?.petrolMileageKmPerLitre ?? FINANCE_DEFAULTS.petrolMileageKmPerLitre;
  const electricityRate = settings?.electricityRatePerUnit ?? FINANCE_DEFAULTS.electricityRatePerUnit;

  const [scooterId, setScooterId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [dailyDistance, setDailyDistance] = useState(45);
  const tracked = useRef(false);

  useEffect(() => {
    if (!scooters.length) return;
    setScooterId((current) =>
      current && scooters.some((s) => s.id === current) ? current : scooters[0].id
    );
  }, [scooters]);

  const scooter = useMemo(
    () => scooters.find((s) => s.id === scooterId) ?? null,
    [scooters, scooterId]
  );

  const variants = useMemo(() => getScooterVariants(scooter), [scooter]);

  useEffect(() => {
    if (!scooter) return;
    const list = getScooterVariants(scooter);
    setVariantId((current) =>
      current && list.some((v) => v.id === current) ? current : list[0]?.id || ''
    );
  }, [scooterId, scooter]);

  const simulationScooter = useMemo(
    () => (scooter && variantId ? withVariant(scooter, variantId) : scooter),
    [scooter, variantId]
  );

  const result = useMemo(
    () =>
      simulate({
        scooter: simulationScooter,
        dailyDistance,
        electricityRate,
        petrolPricePerLitre: petrolPrice,
        petrolMileageKmPerLitre: petrolMileage,
      }),
    [simulationScooter, dailyDistance, electricityRate, petrolPrice, petrolMileage]
  );

  const charging = getChargingHabit(result.daysBetweenCharges);
  const suitability = getSuitability(dailyDistance, result.realRange);
  const insight = getSmartInsight(result);

  const onInteract = () => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent(EVENT.SIMULATOR_USED, { scooterId });
    }
  };

  const waMessage = simulationScooter
    ? `Hi, I tried your EV savings calculator — I could save around ${formatINR(result.annualSavings)}/year on the ${simulationScooter.name}${simulationScooter.selectedVariant ? ` (${simulationScooter.selectedVariant.name})` : ''} (${dailyDistance} km/day). I'd like to know more!`
    : 'Hi, I\'d like to know more about your electric scooters.';

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-200/60">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-muted">Loading simulator…</p>
      </div>
    );
  }

  if (!scooters.length) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-200/60">
        <p className="text-sm text-muted">
          Scooter data is unavailable right now. Please refresh the page or try again in a moment.
        </p>
      </div>
    );
  }

  if (!scooter) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-200/60">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-muted">Preparing simulator…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl lg:max-w-4xl">
      {/* Premium frame */}
      <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-[1px] shadow-[0_32px_64px_-24px_rgba(15,23,42,0.45)] sm:rounded-[2rem]">
        <div className="overflow-hidden rounded-[1.65rem] bg-white sm:rounded-[1.95rem]">
          {/* Inputs */}
          <div className="border-b border-slate-100 bg-slate-50/90 px-4 py-4 sm:px-6 sm:py-5">
            <div className="grid gap-4 sm:grid-cols-2" onPointerDown={onInteract}>
              <div className={hasVariants(scooter) ? '' : 'sm:col-span-2'}>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Scooter model
                </label>
                <Select
                  value={scooterId}
                  className="h-11 rounded-xl border-0 bg-white text-sm shadow-sm ring-1 ring-slate-200/80"
                  onChange={(e) => {
                    setScooterId(e.target.value);
                    onInteract();
                  }}
                >
                  {scooters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              {hasVariants(scooter) && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Battery variant
                  </label>
                  <Select
                    value={variantId}
                    className="h-11 rounded-xl border-0 bg-white text-sm shadow-sm ring-1 ring-slate-200/80"
                    onChange={(e) => {
                      setVariantId(e.target.value);
                      onInteract();
                    }}
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} · {formatINR(v.price)}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div className={hasVariants(scooter) ? 'sm:col-span-2' : ''}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">Daily travel</label>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200/60">
                    {dailyDistance} km
                  </span>
                </div>
                <RangeSlider
                  value={dailyDistance}
                  min={10}
                  max={100}
                  step={1}
                  onChange={setDailyDistance}
                  ariaLabel="Daily travel distance"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Petrol benchmark · {formatINR(petrolPrice)}/L
            </p>
          </div>

          {/* Hero savings */}
          <div className="relative overflow-hidden px-4 py-8 text-center sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/15">
                <Sparkles className="h-3.5 w-3.5" />
                That&apos;s what you keep every year
              </span>
              <p className="mt-4 font-display text-[2.5rem] font-extrabold leading-none tracking-tight sm:text-6xl">
                <CountValue
                  key={`save-${scooterId}-${dailyDistance}`}
                  value={result.annualSavings}
                  prefix="₹"
                  duration={900}
                  className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent"
                />
              </p>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                vs petrol · {simulationScooter.name}
                {simulationScooter.selectedVariant ? ` · ${simulationScooter.selectedVariant.name}` : ''}
                {' · '}{dailyDistance} km/day
              </p>
            </div>
          </div>

          {/* EV vs Petrol cards */}
          <div className="grid gap-3 px-4 pb-6 sm:grid-cols-2 sm:gap-4 sm:px-6 sm:pb-8">
            <CompareCard side="ev" monthly={result.monthlyCost} perKm={result.costPerKm} />
            <CompareCard side="petrol" monthly={result.monthlyPetrol} perKm={result.petrolCostPerKm} />
          </div>

          {/* Same distance cost comparison */}
          <div className="border-t border-slate-100 px-4 py-6 sm:px-6 sm:py-8">
            <p className="mb-1 text-center font-display text-lg font-bold text-heading sm:text-xl">
              Same trip. Different cost.
            </p>
            <p className="mx-auto mb-4 max-w-md text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
              If petrol costs <span className="font-semibold text-heading">₹100</span> to cover that distance,
              home charging costs about{' '}
              <span className="font-semibold text-emerald-700">₹{result.evSpendPer100}</span>.
            </p>
            <div className="mx-auto max-w-md space-y-4">
              <SpendBar label="Petrol (reference)" pct={100} variant="petrol" />
              <SpendBar label="Electric (same distance)" pct={result.evSpendPer100} variant="ev" />
            </div>
            <p className="mx-auto mt-5 max-w-sm text-center text-sm font-medium leading-relaxed text-slate-600">
              &ldquo;{insight}&rdquo;
            </p>
          </div>

          {/* Pills + table */}
          <div className="space-y-4 border-t border-slate-100 bg-slate-50/50 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-800 shadow-sm ring-1 ring-violet-200/60">
                <Zap className="h-3.5 w-3.5" />
                {charging.label}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1',
                  MATCH_STYLES[suitability.tone],
                )}
              >
                {suitability.label}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3" />
                    <th className="px-4 py-3">Petrol</th>
                    <th className="px-4 py-3 text-emerald-700">Electric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-500">Monthly</td>
                    <td className="px-4 py-3 font-bold tabular-nums">{formatINR(result.monthlyPetrol)}</td>
                    <td className="px-4 py-3 font-bold tabular-nums text-emerald-700">{formatINR(result.monthlyCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-500">Annual</td>
                    <td className="px-4 py-3 font-bold tabular-nums">{formatINR(result.annualPetrol)}</td>
                    <td className="px-4 py-3 font-bold tabular-nums text-emerald-700">{formatINR(result.annualCost)}</td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td className="px-4 py-3 font-medium text-slate-500">You save</td>
                    <td className="px-4 py-3 text-slate-400">—</td>
                    <td className="px-4 py-3 font-display text-lg font-extrabold text-emerald-700">
                      {formatINR(result.annualSavings)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <DetailsPanel
              petrolPrice={petrolPrice}
              petrolMileage={petrolMileage}
              electricityRate={electricityRate}
              result={result}
            />

            <a
              href={whatsappUrl(waMessage, site)}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1ebe57] px-6 py-4 text-base font-bold text-white shadow-[0_12px_32px_-8px_rgba(37,211,102,0.5)] transition hover:brightness-105 active:scale-[0.99]"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Enquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
