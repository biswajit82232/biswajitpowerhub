import { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  BatteryCharging, Gauge, Timer, ShieldCheck, Cpu, Weight, Users, Palette,
  Check, MessageCircle, CalendarCheck, ChevronLeft, Sparkles, Phone,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RouteLoader } from '@/components/ui/Loading';
import { ScooterDetailsSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScooterGallery } from '@/features/scooters/ScooterGallery';
import { PremiumPerksStrip } from '@/components/sections/PremiumPerks';
import { EMICalculator } from '@/features/emi/EMICalculator';
import { TestRideForm } from '@/features/leads/TestRideForm';
import { VariantSelector } from '@/features/scooters/VariantSelector';
import { getScooterById, getScooters } from '@/features/scooters/scooterService';
import { getScooterInsights } from '@/features/analytics/popularityService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { getAllValueBadges } from '@/lib/valueBadges';
import { useAsync } from '@/hooks/useAsync';
import { formatINR } from '@/lib/utils';
import { getScooterVariants, withVariant } from '@/lib/scooterVariants';
import { resolveLegacyScooterId } from '@/lib/legacyScooters';
import { STOCK_LABELS } from '@/data/scooters';
import { whatsappUrl, batteryUpgradeWhatsappMessage, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { scrollToTop } from '@/components/common/ScrollToTop';
import {
  breadcrumbList,
  buildScooterProductSchema,
  SCOOTER_SEO,
} from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { getApprovedReviews } from '@/features/reviews/reviewService';

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border border-line bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-dealer bg-navy/10 text-navy">
        <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="break-words text-sm font-bold leading-snug text-navy">{value}</p>
      </div>
    </div>
  );
}

export default function ScooterDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const legacy = resolveLegacyScooterId(id);

  if (legacy !== undefined) {
    if (legacy === null) return <Navigate to="/scooters" replace />;
    const variant = searchParams.get('variant') || legacy.variant;
    const q = variant ? `?variant=${variant}` : '';
    return <Navigate to={`/scooters/${legacy.id}${q}`} replace />;
  }

  return <ScooterDetailsPage id={id} initialVariantId={searchParams.get('variant')} />;
}

function ScooterDetailsPage({ id, initialVariantId }) {
  const { site } = useSite();
  const [, setSearchParams] = useSearchParams();
  const { data: scooter, loading } = useAsync(() => getScooterById(id), [id]);
  const { data: reviews } = useAsync(() => getApprovedReviews(), []);
  const { settings } = useFinance();
  const { data: insights } = useAsync(async () => {
    const all = await getScooters();
    return getScooterInsights(all);
  }, []);
  const [testRideOpen, setTestRideOpen] = useState(false);
  const [variantId, setVariantId] = useState(null);

  useEffect(() => {
    scrollToTop();
  }, [id]);

  useEffect(() => {
    if (scooter) {
      const variants = getScooterVariants(scooter);
      const preferred = initialVariantId && variants.some((v) => v.id === initialVariantId)
        ? initialVariantId
        : variants[0]?.id;
      setVariantId(preferred ?? null);
    }
  }, [scooter, initialVariantId]);

  const display = scooter ? withVariant(scooter, variantId) : null;

  const handleVariantChange = (nextId) => {
    setVariantId(nextId);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextId) next.set('variant', nextId);
        else next.delete('variant');
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (scooter) trackEvent(EVENT.SCOOTER_VIEW, { scooterId: scooter.id, name: scooter.name });
  }, [scooter]);

  if (loading) {
    return (
      <RouteLoader label="Loading scooter">
        <ScooterDetailsSkeleton />
      </RouteLoader>
    );
  }
  if (!scooter || !display) {
    return (
      <div className="container-px py-20">
        <EmptyState
          title="Scooter not found"
          description="This model may have been removed."
          action={<Button to="/scooters" variant="dealerPrimary">Back to Scooters</Button>}
        />
      </div>
    );
  }

  const stock = STOCK_LABELS[scooter.stock] || STOCK_LABELS.in_stock;
  const valueBadges = getAllValueBadges(scooter.id, insights?.valueBadges);
  const popularityTags = [];
  if (insights?.popularWeekIds?.has?.(scooter.id)) popularityTags.push({ label: '🔥 Trending this week', tone: 'hot' });
  if (insights?.topIntentMonthIds?.has?.(scooter.id)) popularityTags.push({ label: '⭐ Top pick this month', tone: 'warm' });
  const waMessage = display.selectedVariant
    ? `Hi BISWAJIT POWER HUB, I'm interested in the ${scooter.name} — ${display.selectedVariant.name} (${formatINR(display.price)}). Please share more details.`
    : `Hi BISWAJIT POWER HUB, I'm interested in the ${scooter.name} (${formatINR(display.price)}). Please share more details.`;
  const batteryUpgradeWaMessage = batteryUpgradeWhatsappMessage(scooter.name);

  const productSchema = buildScooterProductSchema(scooter, { reviews, site });
  const detailSeo = SCOOTER_SEO[scooter.id] || {
    title: `${scooter.name} Electric Scooter | Biswajit Power Hub, Berhampore`,
    description: scooter.description,
  };
  const detailJsonLd = [
    breadcrumbList([
      { name: 'Home', path: '/' },
      { name: 'Scooters', path: '/scooters' },
      { name: scooter.name, path: `/scooters/${scooter.id}` },
    ]),
    productSchema,
  ];

  return (
    <>
      <SEO
        title={detailSeo.title}
        description={detailSeo.description}
        path={`/scooters/${scooter.id}`}
        image={scooter.images?.[0]}
        jsonLd={detailJsonLd}
        titleTemplate={false}
        noindex={!SCOOTER_SEO[scooter.id]}
      />

      <div className="container-px min-w-0 pb-28 pt-6 sm:pb-14 sm:pt-10 lg:pb-14">
        <Breadcrumbs
          items={[
            { name: 'Home', to: '/' },
            { name: 'Scooters', to: '/scooters' },
            { name: scooter.name },
          ]}
        />
        <Link to="/scooters" className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-brand-700">
          <ChevronLeft className="h-4 w-4 shrink-0" /> All scooters
        </Link>

        <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <Reveal className="min-w-0">
            <ScooterGallery scooter={scooter} />
          </Reveal>

          {/* Summary */}
          <Reveal delay={0.05} className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={stock.tone}>{stock.label}</Badge>
              {scooter.noLicence && <Badge tone="brand">No Licence*</Badge>}
              {scooter.noRegistration && <Badge tone="accent">No Registration*</Badge>}
              {popularityTags.map((b) => <Badge key={b.label} tone={b.tone}>{b.label}</Badge>)}
              {valueBadges.map((b) => (
                <Badge key={b.id} tone={b.tone}>{b.emoji} {b.label}</Badge>
              ))}
            </div>
            <h1 className="mt-4 break-words font-display text-display-md font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
              {detailSeo.h1 || `${scooter.name} Electric Scooter in Berhampore — Price, Features & Test Ride`}
            </h1>
            <p className="mt-1 break-words text-base text-muted">{scooter.tagline}</p>

            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="break-words font-display text-3xl font-extrabold text-heading sm:text-4xl">{formatINR(display.price)}</span>
              <span className="pb-1 text-sm text-muted">on-road price{display.selectedVariant ? ` · ${display.selectedVariant.name}` : ''}</span>
            </div>

            <VariantSelector scooter={scooter} selectedId={variantId} onChange={handleVariantChange} />

            <p className="mt-5 break-words leading-relaxed text-body">{scooter.description}</p>
            <div className="mt-6 space-y-6 text-sm leading-relaxed text-body sm:text-base">
              <div>
                <h2 className="font-display text-xl font-extrabold text-heading sm:text-2xl">
                  Why riders in Berhampore choose the {scooter.name}
                </h2>
                <p className="mt-3">
                  The {scooter.name} is one of the most requested low-speed electric scooters at Biswajit
                  Power Hub in Berhampore, Murshidabad. Eligible units need no driving licence and no RTO
                  registration, charge at home for roughly ₹0.30–₹0.50 per km, and include 3 free servicing
                  plus 1 year motor &amp; controller warranty. Visit Chunakhali Bus Stand for a free test
                  ride, EMI guidance, and spare-parts support for your scooter.
                </p>
                <p className="mt-3">
                  Compare all options on our{' '}
                  <Link to="/best-electric-scooters-berhampore" className="font-semibold text-brand-600 hover:underline">
                    best electric scooters in Berhampore
                  </Link>{' '}
                  page, explore{' '}
                  <Link to="/battery-upgrade-berhampore" className="font-semibold text-brand-600 hover:underline">
                    battery upgrades
                  </Link>{' '}
                  if you need more range, or browse{' '}
                  <Link to="/scooters" className="font-semibold text-brand-600 hover:underline">
                    all scooters
                  </Link>
                  . Call 096355 05436 before you visit to confirm colour and stock across Murshidabad.
                </p>
              </div>
              <div>
                <h2 className="font-display text-xl font-extrabold text-heading sm:text-2xl">
                  Price, range &amp; showroom support in Murshidabad
                </h2>
                <p className="mt-3">
                  On-road pricing for the {scooter.name} starts near {formatINR(display.price)} depending on
                  variant. Typical range is about {display.range} km per charge with a top speed of{' '}
                  {display.topSpeed} km/h — ideal for Berhampore town rides and many Murshidabad daily
                  routes. Our team explains Standard vs Lithium Pro packs where available, fits genuine
                  spare parts, and never rushes a decision. {site.hours?.summaryShort || 'Open all days 9 AM–8:30 PM'}.
                </p>
              </div>
            </div>

            <PremiumPerksStrip />

            {/* Battery upgrade */}
            <div className="mt-4 overflow-hidden border border-line bg-surface-alt p-5 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-navy text-navy sm:h-11 sm:w-11">
                  <BatteryCharging className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold uppercase tracking-wide text-navy sm:text-lg">Want More Range?</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-body">
                    Increase mileage with a higher AH battery — custom modifications tailored to your daily riding needs.
                  </p>
                  <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {[
                      'Higher AH battery options',
                      'Custom modification available',
                      'Extended range on the same model',
                      'Expert fitting at our showroom',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-body sm:text-sm">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href={whatsappUrl(batteryUpgradeWaMessage, site)}
                    variant="whatsapp"
                    size="md"
                    icon={MessageCircle}
                    className="mt-4 !rounded-dealer"
                    onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'battery-upgrade', scooterId: scooter.id })}
                  >
                    Contact Us to Know More
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                variant="dealerPrimary"
                size="lg"
                icon={CalendarCheck}
                fullWidth
                className="sm:flex-1"
                onClick={() => setTestRideOpen(true)}
              >
                Book Test Ride
              </Button>
              <Button
                href={telUrl(undefined, site)}
                target="_self"
                variant="dealerSecondary"
                size="lg"
                icon={Phone}
                fullWidth
                className="sm:flex-1"
                onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'scooter-detail', scooterId: scooter.id })}
              >
                Call Showroom
              </Button>
              <Button
                href={whatsappUrl(waMessage, site)}
                variant="whatsapp"
                size="lg"
                icon={MessageCircle}
                fullWidth
                className="!rounded-dealer sm:flex-1"
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'scooter-detail', scooterId: scooter.id })}
              >
                WhatsApp
              </Button>
            </div>

            {/* Quick specs */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Spec icon={BatteryCharging} label="Range" value={`${display.range} km`} />
              <Spec icon={Gauge} label="Top speed" value={`${display.topSpeed} km/h`} />
              <Spec icon={Timer} label="Charging time" value={display.chargingTime} />
              <Spec icon={ShieldCheck} label="Warranty" value={display.warranty} />
            </div>
          </Reveal>
        </div>

        {/* Full specs + EMI — EMI first on mobile for visibility */}
        <div className="mt-14 grid min-w-0 gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-3">
            <h2 className="break-words font-display text-display-md font-bold uppercase tracking-wide text-navy">Specifications</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Spec icon={BatteryCharging} label="Battery type" value={display.batteryType} />
              {display.batteryWarranty && (
                <Spec icon={ShieldCheck} label="Battery warranty" value={display.batteryWarranty} />
              )}
              <Spec icon={Cpu} label="Battery capacity" value={display.batteryCapacity} />
              <Spec icon={Gauge} label="Range" value={`${display.range} km`} />
              <Spec icon={Gauge} label="Top speed" value={`${display.topSpeed} km/h`} />
              <Spec icon={Timer} label="Charging" value={display.chargingTime} />
              <Spec icon={Cpu} label="Motor" value={display.motor} />
              <Spec icon={Weight} label="Weight" value={display.weight} />
              <Spec icon={Users} label="Load capacity" value={display.loadCapacity} />
              <Spec icon={ShieldCheck} label="Warranty" value={display.warranty} />
            </div>

            {/* Colors */}
            {scooter.colors?.length > 0 && (
              <div className="mt-8">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
                  <Palette className="h-5 w-5 text-brand-500" /> Available colours
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scooter.colors.map((c) => (
                    <span key={c} className="break-words border border-line bg-white px-3 py-2 text-sm font-medium text-body sm:px-4">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
                <Sparkles className="h-5 w-5 text-brand-500" /> Features
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-3">
                {scooter.features?.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 break-words text-sm text-body">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-brand-50 text-brand-500">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            {scooter.benefits?.length > 0 && (
              <div className="mt-8 border border-line bg-surface-alt p-6">
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-navy">Why Riders Love It</h3>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {scooter.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 break-words text-sm font-medium text-body">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-brand-500 text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* EMI — shown before full specs on mobile */}
          <div className="order-1 min-w-0 lg:order-2 lg:col-span-2">
            <div className="lg:sticky lg:top-[calc(var(--header-offset)+1.5rem)] lg:self-start">
              <EMICalculator price={display.price} settings={settings} scooterId={scooter.id} />
            </div>
          </div>
        </div>
      </div>

      <Modal open={testRideOpen} onClose={() => setTestRideOpen(false)} title={`Book a test ride`}>
        <p className="mb-4 text-sm text-muted">
          Ride the <span className="font-semibold text-heading">{scooter.name}</span> at our {site.address.city} showroom.
        </p>
        <TestRideForm scooter={display} onSuccess={() => setTimeout(() => setTestRideOpen(false), 2500)} />
      </Modal>

      {/* Purchase-intent sticky CTA — sits above global MobileLocalCTA */}
      <div
        className="fixed inset-x-0 z-[9997] border-t border-line bg-surface/95 px-3 py-2 shadow-card lg:hidden bottom-[calc(4rem+env(safe-area-inset-bottom))]"
        role="region"
        aria-label={`Call about ${scooter.name}`}
      >
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
          <Button
            href={telUrl(undefined, site)}
            target="_self"
            variant="dealerPrimary"
            size="sm"
            icon={Phone}
            fullWidth
            className="min-h-11 !rounded-dealer"
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'scooter-detail-sticky', scooterId: scooter.id })}
          >
            Call about {scooter.name}
          </Button>
          <Button
            href={whatsappUrl(waMessage, site)}
            variant="whatsapp"
            size="sm"
            icon={MessageCircle}
            fullWidth
            className="min-h-11 !rounded-dealer"
            onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'scooter-detail-sticky', scooterId: scooter.id })}
          >
            WhatsApp
          </Button>
        </div>
      </div>
    </>
  );
}
