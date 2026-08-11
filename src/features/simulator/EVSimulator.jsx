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
      <div className="h-3 overflow-hidden rounded-full bg-line sm:h-3.5">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isPetrol ? 'bg-navy/50' : 'bg-brand-gradient',
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
        'relative overflow-hidden border p-4 sm:p-5',
        isEv
          ? 'border-brand-200 bg-brand-50/60'
          : 'border-line bg-surface-alt',
      )}
    >
      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-widest',
          isEv ? 'text-brand-600' : 'text-muted',
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
    <div className="overflow-hidden border border-line bg-surface-alt">
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
        <dl className="grid gap-3 border-t border-line px-4 py-4 text-sm sm:grid-cols-2">
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
  excellent: 'bg-brand-50 text-brand-700 ring-brand-200',
  good: 'bg-navy/5 text-navy ring-navy/20',
  fair: 'bg-amber-50 text-amber-900 ring-amber-200',
  stretch: 'bg-orange-50 text-orange-900 ring-orange-200',
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
      <div className="mx-auto max-w-3xl border border-line bg-white p-10 text-center shadow-soft">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <p className="text-sm text-muted">Loading simulator…</p>
      </div>
    );
  }

  if (!scooters.length) {
    return (
      <div className="mx-auto max-w-3xl border border-line bg-white p-10 text-center shadow-soft">
        <p className="text-sm text-muted">
          Scooter data is unavailable right now. Please refresh the page or try again in a moment.
        </p>
      </div>
    );
  }

  if (!scooter) {
    return (
      <div className="mx-auto max-w-3xl border border-line bg-white p-10 text-center shadow-soft">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <p className="text-sm text-muted">Preparing simulator…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl lg:max-w-4xl">
      <div className="overflow-hidden border border-line bg-white shadow-soft">
        {/* Inputs */}
        <div className="border-b border-line bg-surface-alt px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid gap-4 sm:grid-cols-2" onPointerDown={onInteract}>
            <div className={hasVariants(scooter) ? '' : 'sm:col-span-2'}>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Scooter model
              </label>
              <Select
                value={scooterId}
                className="h-11"
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
                <label className="mb-1.5 block text-xs font-semibold text-muted">
                  Battery variant
                </label>
                <Select
                  value={variantId}
                  className="h-11"
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
                <label className="text-xs font-semibold text-muted">Daily travel</label>
                <span className="bg-white px-2.5 py-0.5 text-xs font-bold text-brand-600 ring-1 ring-line">
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
          <p className="mt-3 text-xs text-muted">
            Petrol benchmark · {formatINR(petrolPrice)}/L
          </p>
        </div>

        {/* Hero savings */}
        <div className="relative overflow-hidden px-4 py-8 text-center sm:px-8 sm:py-10">
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              That&apos;s what you keep every year
            </span>
            <p className="mt-4 font-display text-[2.5rem] font-extrabold leading-none tracking-tight text-navy sm:text-6xl">
              <CountValue
                key={`save-${scooterId}-${dailyDistance}`}
                value={result.annualSavings}
                prefix="₹"
                duration={900}
                className="text-brand-600"
              />
            </p>
            <p className="mt-2 text-sm text-muted sm:text-base">
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
        <div className="border-t border-line px-4 py-6 sm:px-6 sm:py-8">
          <p className="mb-1 text-center font-display text-lg font-bold uppercase tracking-wide text-navy sm:text-xl">
            Same trip. Different cost.
          </p>
          <p className="mx-auto mb-4 max-w-md text-center text-xs leading-relaxed text-muted sm:text-sm">
            If petrol costs <span className="font-semibold text-heading">₹100</span> to cover that distance,
            home charging costs about{' '}
            <span className="font-semibold text-brand-600">₹{result.evSpendPer100}</span>.
          </p>
          <div className="mx-auto max-w-md space-y-4">
            <SpendBar label="Petrol (reference)" pct={100} variant="petrol" />
            <SpendBar label="Electric (same distance)" pct={result.evSpendPer100} variant="ev" />
          </div>
          <p className="mx-auto mt-5 max-w-sm text-center text-sm font-medium leading-relaxed text-body">
            &ldquo;{insight}&rdquo;
          </p>
        </div>

        {/* Pills + table */}
        <div className="space-y-4 border-t border-line bg-surface-alt px-4 py-5 sm:space-y-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy">
              <Zap className="h-3.5 w-3.5 text-brand-500" />
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

          <div className="overflow-hidden border border-line bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3" />
                  <th className="px-4 py-3">Petrol</th>
                  <th className="px-4 py-3 text-brand-600">Electric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="px-4 py-3 font-medium text-muted">Monthly</td>
                  <td className="px-4 py-3 font-bold tabular-nums">{formatINR(result.monthlyPetrol)}</td>
                  <td className="px-4 py-3 font-bold tabular-nums text-brand-600">{formatINR(result.monthlyCost)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-muted">Annual</td>
                  <td className="px-4 py-3 font-bold tabular-nums">{formatINR(result.annualPetrol)}</td>
                  <td className="px-4 py-3 font-bold tabular-nums text-brand-600">{formatINR(result.annualCost)}</td>
                </tr>
                <tr className="bg-brand-50/50">
                  <td className="px-4 py-3 font-medium text-muted">You save</td>
                  <td className="px-4 py-3 text-muted">—</td>
                  <td className="px-4 py-3 font-display text-lg font-extrabold text-brand-600">
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
            className="flex w-full items-center justify-center gap-2.5 rounded-dealer bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-soft transition hover:brightness-105 active:scale-[0.99]"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Enquiry
          </a>
        </div>
      </div>
    </div>
  );
}
