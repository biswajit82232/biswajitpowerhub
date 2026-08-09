import { MessageCircle, Phone, Navigation, Zap, ShieldCheck, Wrench, Star } from 'lucide-react';
import { SiteImage } from '@/components/common/SiteImage';
import Button from '@/components/ui/Button';
import { SITE, whatsappUrl, telUrl, formatPhoneDisplay, GBP_RATING } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { formatCostPerKm } from '@/lib/catalogStats';

const CHIPS = [
  { icon: Star, label: `${GBP_RATING.ratingValue}/5 Customer Rating`, color: 'text-amber-500' },
  { icon: Wrench, label: '3 Free Servicing', color: 'text-brand-600' },
  { icon: ShieldCheck, label: '1 Year Warranty', color: 'text-sky-600' },
  { icon: Zap, label: 'No Licence Models', color: 'text-brand-500' },
];

const d = (ms) => ({ animationDelay: `${ms}ms` });
const HERO_MAX_RANGE_KM = 120;

export function Hero({ heroImageUrl, catalogStats }) {
  const { site } = useSite();
  const { photos } = useSitePhotos();
  const costPerKm = formatCostPerKm(catalogStats?.minCostPerKm ?? 0.3);
  const chargeLabel = catalogStats?.chargingLabel ?? '4–6 hrs';
  const imageUrl = photos?.hero?.url || heroImageUrl || null;
  const imageAlt =
    photos?.hero?.alt ||
    'Biswajit Power Hub electric scooter showroom at Chunakhali Bus Stand Berhampore Murshidabad';

  const stats = [
    { value: `${HERO_MAX_RANGE_KM} km`, label: 'Max range' },
    { value: costPerKm, label: 'From per km' },
    { value: '0 RTO', label: 'Paperwork*' },
    { value: chargeLabel, label: 'Full charge' },
  ];

  return (
    <section className="relative overflow-x-clip bg-sky-fade">
      <div className="pointer-events-none absolute inset-0 bg-hero-mesh" aria-hidden />
      <div className="container-px relative grid items-center gap-8 pb-12 pt-10 sm:gap-10 sm:pb-16 sm:pt-14 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="text-center lg:text-left">
          <div className="animate-hero-rise" style={d(0)}>
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-brand-700 shadow-soft ring-1 ring-brand-100 sm:px-4 sm:text-xs lg:justify-start">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600">
                <Zap className="h-2.5 w-2.5 text-white" fill="white" />
              </span>
              {SITE.name} · Berhampore
            </span>
          </div>

          <h1 className="mt-5 font-display text-display-md font-extrabold text-heading sm:text-display-lg">
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
              variant="primary"
              size="lg"
              icon={Phone}
              className="w-full sm:w-auto"
              onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'hero' })}
            >
              Call: {formatPhoneDisplay(site.phones[0]).replace('+91 ', '0')}
            </Button>
            <Button
              href={whatsappUrl(undefined, site)}
              variant="whatsapp"
              size="lg"
              icon={MessageCircle}
              className="w-full sm:w-auto"
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'hero' })}
            >
              WhatsApp
            </Button>
            <Button
              href={site.maps.link}
              variant="directions"
              size="lg"
              icon={Navigation}
              className="w-full sm:w-auto"
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
                className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-heading shadow-soft ring-1 ring-brand-100/80"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-hero-scale pb-4 sm:pb-6 lg:max-w-none lg:pb-0" style={d(180)}>
          <div className="relative overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-brand-100">
            <SiteImage
              src={imageUrl}
              alt={imageAlt}
              width={1200}
              height={600}
              loading="eager"
              fetchPriority="high"
              className="w-full"
              placeholderLabel="Upload showroom photo here"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/90 px-2 py-3 text-center shadow-soft ring-1 ring-brand-100/80"
              >
                <p className="font-display text-sm font-extrabold text-brand-700">{s.value}</p>
                <p className="mt-0.5 text-[0.65rem] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
