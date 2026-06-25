import { ArrowRight, MessageCircle, Zap, ShieldCheck, BatteryCharging, Wallet, Wrench } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ScooterImage } from '@/components/common/ScooterImage';
import { SITE, whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { formatCostPerKm } from '@/lib/catalogStats';

const CHIPS = [
  { icon: Wrench, label: '3 Free Servicing', color: 'text-rose-600' },
  { icon: ShieldCheck, label: '1 Yr Motor Warranty', color: 'text-indigo-600' },
  { icon: BatteryCharging, label: 'Charge at Home', color: 'text-brand-600' },
  { icon: Wallet, label: 'Low Running Cost', color: 'text-cyan-600' },
];

/** Stagger delay utility — GPU-only CSS animation */
const d = (ms) => ({ animationDelay: `${ms}ms` });

/** Marketing copy on hero — not tied to live catalog max */
const HERO_MAX_RANGE_KM = 120;

export function Hero({ heroImageUrl, catalogStats }) {
  const { site } = useSite();
  const costPerKm = formatCostPerKm(catalogStats?.minCostPerKm ?? 0.2);
  const chargeLabel = catalogStats?.chargingLabel ?? '4–6 hrs';

  const stats = [
    { value: `${HERO_MAX_RANGE_KM} km`, label: 'Max range' },
    { value: costPerKm, label: 'From per km' },
    { value: '0 RTO', label: 'Paperwork*' },
    { value: chargeLabel, label: 'Full charge' },
  ];

  return (
    <section className="relative overflow-x-clip">
      {/* Background — static, no animated blur on mobile */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_-10%,#DBEAFE,transparent_60%),radial-gradient(ellipse_80%_60%_at_80%_10%,#CCFBF1,transparent_55%)] bg-bg" />
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-200/25 blur-2xl lg:h-96 lg:w-96" />
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-teal-200/20 blur-2xl lg:h-80 lg:w-80" />
      </div>

      <div className="container-px grid items-center gap-10 pb-10 pt-10 sm:pb-14 sm:pt-14 lg:grid-cols-2 lg:gap-12 lg:py-24">
        {/* Left — CSS stagger (opacity + transform only) */}
        <div className="text-center lg:text-left">
          <div className="animate-hero-rise" style={d(0)}>
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-50 to-accent-50 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-brand-700 ring-1 ring-brand-200 shadow-sm sm:px-4 sm:text-xs">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient">
                <Zap className="h-2.5 w-2.5 text-white" fill="white" />
              </span>
              {SITE.name}
            </span>
          </div>

          <h1 className="mt-5 font-display text-display-2xl font-extrabold text-heading">
            <span className="block animate-hero-rise" style={d(60)}>Ride Electric.</span>
            <span className="relative block animate-hero-rise" style={d(120)}>
              Save More.
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden>
                <path d="M0 8 Q75 0 150 6 Q225 12 300 4" stroke="url(#ug)" strokeWidth="3" fill="none" strokeLinecap="round" />
                <defs>
                  <linearGradient id="ug" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="block animate-hero-rise text-gradient-bt" style={d(180)}>Power Every Ride.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl animate-hero-rise text-base leading-relaxed text-body sm:text-lg lg:mx-0"
            style={d(240)}
          >
            Premium low-speed electric scooters — no licence, no registration*, and remarkably low
            running cost.&nbsp;{SITE.tagline}.
          </p>

          <div
            className="mt-7 flex animate-hero-rise flex-wrap items-center justify-center gap-3 lg:justify-start"
            style={d(300)}
          >
            <Button to="/scooters" size="sm" variant="primary" iconRight={ArrowRight}>View Scooters</Button>
            <Button
              href={whatsappUrl(undefined, site)}
              size="sm"
              variant="whatsapp"
              icon={MessageCircle}
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'hero' })}
            >
              WhatsApp Us
            </Button>
          </div>

          <div
            className="mt-8 flex animate-hero-rise flex-wrap items-center justify-center gap-2.5 lg:justify-start"
            style={d(360)}
          >
            {CHIPS.map(({ icon: Icon, label, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-body ring-1 ring-line shadow-soft"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — card */}
        <div
          className="relative mx-auto w-full max-w-md animate-hero-scale pb-10 sm:pb-12 lg:max-w-none lg:pb-0"
          style={d(180)}
        >
          <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-brand-300/10 to-teal-300/10 blur-xl" />

          <div className="relative rounded-3xl bg-white p-3 shadow-card ring-1 ring-blue-100">
            <ScooterImage
              src={heroImageUrl || undefined}
              hue="teal"
              name="PowerHub EV"
              alt="Premium electric scooter"
              className="aspect-[4/3] w-full rounded-2xl"
              loading="eager"
            />

            <div className="absolute -bottom-4 left-0 animate-hero-pop sm:-bottom-5 sm:-left-4" style={d(520)}>
              <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card animate-float-slow">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500">
                  <BatteryCharging className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Up to</p>
                  <p className="font-display text-lg font-extrabold text-heading">{HERO_MAX_RANGE_KM} km range</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 top-6 animate-hero-pop sm:-right-4 sm:top-8" style={d(600)}>
              <div className="glass flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-card animate-float-med [animation-delay:1s]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Zap className="h-4 w-4 text-white" fill="white" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Cost</p>
                  <p className="font-display text-sm font-extrabold text-heading">{costPerKm}/km</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats — quick stagger */}
      <div className="relative border-t border-brand-100/60 bg-gradient-to-r from-brand-50/80 via-cyan-50/60 to-teal-50/80">
        <div className="container-px">
          <div className="grid grid-cols-2 divide-x divide-brand-100/60 sm:grid-cols-4">
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className="flex animate-hero-rise flex-col items-center gap-0.5 px-2 py-4 text-center sm:px-4 sm:py-5"
                style={d(420 + i * 50)}
              >
                <span className="break-words font-display text-lg font-extrabold text-gradient-bt sm:text-2xl">{value}</span>
                <span className="break-words text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-[11px] sm:tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
