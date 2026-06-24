import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, ChevronDown, Scale, Gauge, Fuel } from 'lucide-react';
import { Select } from '@/components/ui/Input';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { simulate } from '@/lib/simulator';
import { formatINR, cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';
import { trackEvent, EVENT } from '@/lib/tracking';
import { FINANCE_DEFAULTS } from '@/config/finance';
import {
  IconSavings, IconRange, IconCharging,
  IconDays, IconPetrol, IconPerCharge,
} from './SimulatorKpiIcons';

function CountValue({ value, decimals = 0, prefix = '', suffix = '', duration = 700 }) {
  const display = useCountUp(value, { active: true, decimals, duration });
  return (
    <>
      {prefix}
      {Number(display).toLocaleString('en-IN', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}

const KPI_TINTS = {
  savings: {
    card: 'bg-gradient-to-br from-emerald-50/90 to-teal-50/50 ring-emerald-100/80',
    icon: 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-200/60',
  },
  range: {
    card: 'bg-gradient-to-br from-blue-50/90 to-sky-50/50 ring-blue-100/80',
    icon: 'bg-gradient-to-br from-blue-400 to-sky-500 shadow-sm shadow-blue-200/60',
  },
  charging: {
    card: 'bg-gradient-to-br from-cyan-50/90 to-sky-50/50 ring-cyan-100/80',
    icon: 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm shadow-cyan-200/60',
  },
  days: {
    card: 'bg-violet-50/70 ring-violet-100/70',
    icon: 'bg-gradient-to-br from-violet-400 to-purple-500 shadow-sm shadow-violet-200/50',
  },
  petrol: {
    card: 'bg-orange-50/70 ring-orange-100/70',
    icon: 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm shadow-orange-200/50',
  },
  perCharge: {
    card: 'bg-amber-50/70 ring-amber-100/70',
    icon: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-200/50',
  },
};

/** Level 1 — hero savings (featured) */
function HeroSavings({ value }) {
  const t = KPI_TINTS.savings;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-4 ring-1 sm:p-5',
        'bg-gradient-to-br from-emerald-50 via-teal-50/80 to-emerald-100/40 ring-emerald-200/70'
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl" />
      <div className="relative flex items-center gap-3 sm:gap-4">
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11', t.icon)}>
          <IconSavings className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/80 sm:text-sm">
            Annual savings
          </p>
          <p className="mt-0.5 font-display text-[2rem] font-extrabold leading-none tracking-tight text-emerald-900 sm:text-4xl lg:text-[2.75rem]">
            <CountValue value={value} prefix="₹" duration={900} />
            <span className="text-lg font-bold text-emerald-600/70 sm:text-2xl">/yr</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Level 1 — compact primary KPI */
function PrimaryKpi({ icon, label, children, tint = 'range', extra, className }) {
  const t = KPI_TINTS[tint];
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl p-3 ring-1 sm:gap-3 sm:p-3.5', t.card, className)}>
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', t.icon)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted/90">{label}</p>
        <div className="mt-0.5 font-display text-xl font-extrabold leading-none text-heading sm:text-[1.35rem]">
          {children}
        </div>
        {extra}
      </div>
    </div>
  );
}

/** Level 2 — compact detail KPI */
function DetailKpi({ icon, label, value, decimals = 0, prefix = '', suffix = '', tint }) {
  const t = KPI_TINTS[tint];
  return (
    <div className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2.5 ring-1', t.card)}>
      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', t.icon)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words text-[10px] font-semibold leading-tight text-muted">{label}</p>
        <p className="font-display text-sm font-bold leading-tight text-heading">
          <CountValue value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
        </p>
      </div>
    </div>
  );
}

function RangeBar({ pct }) {
  const fill = useCountUp(pct, { active: true, duration: 700 });
  return (
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-blue-100/80">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
        animate={{ width: `${Math.min(fill, 100)}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

function MethodologyPanel({ result, riderWeight, petrolPrice, petrolMileage, electricityRate, scooter }) {
  const [open, setOpen] = useState(false);
  const weightDelta = riderWeight - 70;
  const weightNote =
    weightDelta === 0
      ? 'Baseline rider weight (70 kg) — no adjustment applied.'
      : weightDelta > 0
        ? `${weightDelta} kg above baseline — range reduced by ~${Math.round((1 - result.weightFactor) * 100)}%.`
        : `${Math.abs(weightDelta)} kg below baseline — range slightly improved.`;

  return (
    <div className="mt-4 rounded-xl ring-1 ring-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface-alt/80"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
          <Info className="h-4 w-4 text-brand-400" />
          Calculation details & assumptions
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4 text-xs leading-relaxed text-body">
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-heading">
              <Scale className="h-3.5 w-3.5 text-brand-500" /> Weight adjustment
            </p>
            <p className="mt-1.5 text-muted">{weightNote}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-heading">
              <Fuel className="h-3.5 w-3.5 text-brand-500" /> Petrol comparison
            </p>
            <p className="mt-1.5 text-muted">
              Petrol cost uses {formatINR(petrolPrice)}/L at {petrolMileage} km/L ({formatINR(result.petrolCostPerKm)}/km).
              EV cost uses {formatINR(electricityRate)}/unit with ~90% charging efficiency.
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-heading">
              <Gauge className="h-3.5 w-3.5 text-brand-500" /> Methodology
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-muted">
              <li>
                Real-world range = {result.claimedRange} km claimed × {Math.round(result.realFactor * 100)}% real-world factor × weight factor ({result.weightFactor}).
              </li>
              <li>
                Battery {scooter?.batteryCapacity} → ~{result.energyPerCharge} kWh drawn per full charge.
              </li>
              <li>Monthly costs = daily distance × 30 days × cost per km.</li>
              <li>Annual savings = yearly petrol cost minus yearly EV charging cost.</li>
            </ul>
            <p className="mt-3 text-[0.65rem] text-muted/80">
              All figures are indicative and vary with terrain, riding style, and load.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function EVSimulator({ scooters = [], settings }) {
  const defaultPetrol = settings?.petrolPricePerLitre ?? FINANCE_DEFAULTS.petrolPricePerLitre;
  const petrolMileage = settings?.petrolMileageKmPerLitre ?? FINANCE_DEFAULTS.petrolMileageKmPerLitre;

  const [scooterId, setScooterId] = useState(scooters[0]?.id);
  const [dailyDistance, setDailyDistance] = useState(60);
  const [riderWeight, setRiderWeight] = useState(70);
  const [electricityRate, setElectricityRate] = useState(7);
  const [petrolPrice, setPetrolPrice] = useState(defaultPetrol);
  const tracked = useRef(false);

  useEffect(() => {
    if (scooters.length && !scooterId) setScooterId(scooters[0].id);
  }, [scooters, scooterId]);

  useEffect(() => {
    setPetrolPrice(defaultPetrol);
  }, [defaultPetrol]);

  const scooter = useMemo(
    () => scooters.find((s) => s.id === scooterId) || scooters[0],
    [scooters, scooterId]
  );

  const result = useMemo(
    () =>
      simulate({
        scooter,
        dailyDistance,
        riderWeight,
        electricityRate,
        petrolPricePerLitre: petrolPrice,
        petrolMileageKmPerLitre: petrolMileage,
      }),
    [scooter, dailyDistance, riderWeight, electricityRate, petrolPrice, petrolMileage]
  );

  const onInteract = () => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent(EVENT.SIMULATOR_USED, { scooterId });
    }
  };

  if (!scooter) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
      {/* Level 1 — hero savings + supporting KPIs */}
      <div className="space-y-2 border-b border-line bg-surface-alt/30 p-3 sm:space-y-2.5 sm:p-4">
        <HeroSavings value={result.annualSavings} />

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
          <PrimaryKpi
            icon={<IconRange />}
            label="Real-world range"
            tint="range"
            extra={<RangeBar pct={result.rangePct} />}
          >
            <CountValue value={result.realRange} />
            <span className="text-sm font-semibold text-muted"> km</span>
          </PrimaryKpi>

          <PrimaryKpi icon={<IconCharging />} label="Monthly charging" tint="charging">
            <CountValue value={result.monthlyCost} prefix="₹" />
            <span className="text-sm font-semibold text-muted">/mo</span>
          </PrimaryKpi>
        </div>
      </div>

      <div className="grid lg:grid-cols-5">
        {/* Inputs */}
        <div className="border-b border-line p-4 sm:p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
          <p className="text-sm font-bold text-heading">Your profile</p>
          <div className="mt-3 space-y-4" onPointerDown={onInteract}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">Model</label>
              <Select
                value={scooterId}
                className="h-11 text-sm"
                onChange={(e) => {
                  setScooterId(e.target.value);
                  onInteract();
                }}
              >
                {scooters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.batteryCapacity}
                  </option>
                ))}
              </Select>
            </div>

            {[
              { label: 'Daily distance', value: dailyDistance, display: `${dailyDistance} km/day`, min: 5, max: 120, step: 1, set: setDailyDistance, aria: 'Daily distance' },
              { label: 'Rider weight', value: riderWeight, display: `${riderWeight} kg`, min: 40, max: 140, step: 1, set: setRiderWeight, aria: 'Rider weight' },
              { label: 'Electricity rate', value: electricityRate, display: `${formatINR(electricityRate)}/unit`, min: 4, max: 15, step: 0.5, set: setElectricityRate, aria: 'Electricity rate' },
              { label: 'Petrol price', value: petrolPrice, display: `${formatINR(petrolPrice)}/L`, min: 90, max: 130, step: 1, set: setPetrolPrice, aria: 'Petrol price per litre' },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-heading">
                  <span>{row.label}</span>
                  <span className="text-brand-600">{row.display}</span>
                </div>
                <RangeSlider value={row.value} min={row.min} max={row.max} step={row.step} onChange={row.set} ariaLabel={row.aria} />
              </div>
            ))}
          </div>
        </div>

        {/* Level 2 + Level 3 */}
        <div className="p-4 sm:p-5 lg:col-span-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
            More details
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <DetailKpi
              icon={<IconDays />}
              label="Days per charge"
              value={result.daysBetweenCharges}
              decimals={1}
              suffix=" days"
              tint="days"
            />
            <DetailKpi
              icon={<IconPetrol />}
              label="Monthly petrol"
              value={result.monthlyPetrol}
              prefix="₹"
              tint="petrol"
            />
            <DetailKpi
              icon={<IconPerCharge />}
              label="Cost per charge"
              value={result.costPerCharge}
              prefix="₹"
              tint="perCharge"
            />
          </div>

          <MethodologyPanel
            result={result}
            riderWeight={riderWeight}
            petrolPrice={petrolPrice}
            petrolMileage={petrolMileage}
            electricityRate={electricityRate}
            scooter={scooter}
          />
        </div>
      </div>
    </div>
  );
}
