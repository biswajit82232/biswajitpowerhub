import { MessageCircle, Phone, Navigation, Zap, ShieldCheck, Wrench, Star, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ScooterImage } from '@/components/common/ScooterImage';
import { SITE, whatsappUrl, telUrl, formatPhoneDisplay, GBP_RATING } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { formatCostPerKm } from '@/lib/catalogStats';

const CHIPS = [
  { icon: Star, label: `${GBP_RATING.ratingValue}/5 Customer Rating`, color: 'text-amber-600' },
  { icon: Wrench, label: '3 Free Servicing', color: 'text-rose-600' },
  { icon: ShieldCheck, label: '1 Year Warranty', color: 'text-indigo-600' },
  { icon: RefreshCw, label: 'Exchange Offers', color: 'text-brand-600' },
];

const d = (ms) => ({ animationDelay: `${ms}ms` });
const HERO_MAX_RANGE_KM = 120;

export function Hero({ heroImageUrl, catalogStats }) {
  const { site } = useSite();
  const costPerKm = formatCostPerKm(catalogStats?.minCostPerKm ?? 0.3);
  const chargeLabel = catalogStats?.chargingLabel ?? '4–6 hrs';

  const stats = [
    { value: `${HERO_MAX_RANGE_KM} km`, label: 'Max range' },
    { value: costPerKm, label: 'From per km' },
    { value: '0 RTO', label: 'Paperwork*' },
    { value: chargeLabel, label: 'Full charge' },
  ];

  return (
    <section className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_-10%,#DBEAFE,transparent_60%),radial-gradient(ellipse_80%_60%_at_80%_10%,#CCFBF1,transparent_55%)] bg-bg" />
      </div>

      <div className="container-px grid items-center gap-10 pb-10 pt-10 sm:pb-14 sm:pt-14 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="text-center lg:text-left">
          <div className="animate-hero-rise" style={d(0)}>
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-50 to-accent-50 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-brand-700 ring-1 ring-brand-200 sm:px-4 sm:text-xs">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient">
                <Zap className="h-2.5 w-2.5 text-white" fill="white" />
              </span>
              {SITE.name} · Berhampore
            </span>
          </div>

          <h1 className="mt-5 font-display text-2xl font-extrabold leading-tight text-heading sm:text-3xl lg:text-4xl">
            <span className="animate-hero-rise block" style={d(60)}>
              Biswajit Power Hub — Best Electric Scooter Dealer in Berhampore, Murshidabad
            </span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-xl animate-hero-rise text-base leading-relaxed text-body sm:text-lg lg:mx-0"
            style={d(120)}
          >
            Premium Low-Speed Electric Scooters. No Licence. No Registration. Test Ride Today at
            Chunakhali.
          </p>

          <div
            className="mt-7 flex animate-hero-rise flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
            style={d(180)}
          >
            <Button
              href={telUrl(undefined, site)}
              target="_self"
              size="md"
              variant="primary"
              icon={Phone}
              className="min-h-11"
              onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'hero' })}
            >
              Call: {formatPhoneDisplay(site.phones[0]).replace('+91 ', '0')}
            </Button>
            <Button
              href={whatsappUrl(undefined, site)}
              size="md"
              variant="whatsapp"
              icon={MessageCircle}
              className="min-h-11"
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'hero' })}
            >
              WhatsApp
            </Button>
            <Button
              href={site.maps.link}
              size="md"
              variant="secondary"
              icon={Navigation}
              className="min-h-11"
              onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'hero' })}
            >
              Get Directions
            </Button>
          </div>

          <div
            className="mt-8 flex animate-hero-rise flex-wrap items-center justify-center gap-2.5 lg:justify-start"
            style={d(240)}
          >
            {CHIPS.map(({ icon: Icon, label, color }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-body ring-1 ring-line"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-hero-scale pb-10 sm:pb-12 lg:max-w-none lg:pb-0" style={d(180)}>
          <div className="relative rounded-3xl bg-white p-3 ring-1 ring-blue-100">
            <ScooterImage
              src={heroImageUrl}
              alt="Biswajit Power Hub showroom at Chunakhali Bus Stand Berhampore Murshidabad"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
              loading="eager"
            />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-surface-alt px-2 py-2 text-center">
                  <p className="font-display text-sm font-extrabold text-heading">{s.value}</p>
                  <p className="text-[0.65rem] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <img
                src="/logo-192.png"
                alt="Activa electric scooter test ride at Berhampore showroom"
                width={192}
                height={192}
                loading="lazy"
                className="h-24 w-full rounded-xl object-contain bg-surface-alt p-2 ring-1 ring-line"
              />
              <img
                src="/og-image.png"
                alt="Zoom low-speed e-scooter no licence required West Bengal"
                width={400}
                height={210}
                loading="lazy"
                className="h-24 w-full rounded-xl object-cover ring-1 ring-line"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
