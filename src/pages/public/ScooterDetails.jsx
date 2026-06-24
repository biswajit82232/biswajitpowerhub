import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BatteryCharging, Gauge, Timer, ShieldCheck, Cpu, Weight, Users, Palette,
  Check, MessageCircle, CalendarCheck, ChevronLeft, Sparkles,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScooterGallery } from '@/features/scooters/ScooterGallery';
import { PremiumPerksStrip } from '@/components/sections/PremiumPerks';
import { EMICalculator } from '@/features/emi/EMICalculator';
import { TestRideForm } from '@/features/leads/TestRideForm';
import { getScooterById, getScooters } from '@/features/scooters/scooterService';
import { getFinanceSettings } from '@/features/finance/financeService';
import { getScooterInsights } from '@/features/analytics/popularityService';
import { getAllValueBadges } from '@/lib/valueBadges';
import { useAsync } from '@/hooks/useAsync';
import { formatINR } from '@/lib/utils';
import { STOCK_LABELS } from '@/data/scooters';
import { whatsappUrl, SITE_URL } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface p-4 ring-1 ring-line">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="break-words text-sm font-bold leading-snug text-heading">{value}</p>
      </div>
    </div>
  );
}

export default function ScooterDetails() {
  const { id } = useParams();
  const { site } = useSite();
  const { data: scooter, loading } = useAsync(() => getScooterById(id), [id]);
  const { data: settings } = useAsync(() => getFinanceSettings(), []);
  const { data: insights } = useAsync(async () => {
    const all = await getScooters();
    return getScooterInsights(all);
  }, []);
  const [testRideOpen, setTestRideOpen] = useState(false);

  useEffect(() => {
    if (scooter) trackEvent(EVENT.SCOOTER_VIEW, { scooterId: scooter.id, name: scooter.name });
  }, [scooter]);

  if (loading) return <PageLoader label="Loading scooter" />;
  if (!scooter) {
    return (
      <div className="container-px py-20">
        <EmptyState
          title="Scooter not found"
          description="This model may have been removed."
          action={<Button to="/scooters" variant="primary">Back to scooters</Button>}
        />
      </div>
    );
  }

  const stock = STOCK_LABELS[scooter.stock] || STOCK_LABELS.in_stock;
  const valueBadges = getAllValueBadges(scooter.id, insights?.valueBadges);
  const popularityTags = [];
  if (insights?.popularWeekIds?.has?.(scooter.id)) popularityTags.push({ label: '🔥 Trending this week', tone: 'hot' });
  if (insights?.topIntentMonthIds?.has?.(scooter.id)) popularityTags.push({ label: '⭐ Top pick this month', tone: 'warm' });
  const waMessage = `Hi BISWAJIT POWER HUB, I'm interested in the ${scooter.name} (${formatINR(scooter.price)}). Please share more details.`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: scooter.name,
    sku: scooter.id,
    url: `${SITE_URL}/scooters/${scooter.id}`,
    image: scooter.images?.[0] || `${SITE_URL}/logo-512.png`,
    brand: { '@type': 'Brand', name: scooter.brand },
    description: scooter.description,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/scooters/${scooter.id}`,
      price: scooter.price,
      priceCurrency: 'INR',
      availability:
        scooter.stock === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <SEO title={scooter.name} description={scooter.description} path={`/scooters/${scooter.id}`} jsonLd={productSchema} />

      <div className="container-px min-w-0 pb-10 pt-6 sm:pb-14 sm:pt-10">
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
            <h1 className="mt-4 break-words font-display text-display-md font-extrabold text-heading">{scooter.name}</h1>
            <p className="mt-1 break-words text-base text-muted">{scooter.tagline}</p>

            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="break-words font-display text-3xl font-extrabold text-heading sm:text-4xl">{formatINR(scooter.price)}</span>
              <span className="pb-1 text-sm text-muted">on-road price</span>
            </div>

            <p className="mt-5 break-words leading-relaxed text-body">{scooter.description}</p>

            <PremiumPerksStrip />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                href={whatsappUrl(waMessage, site)}
                variant="whatsapp"
                size="lg"
                icon={MessageCircle}
                fullWidth
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'scooter-detail', scooterId: scooter.id })}
              >
                Enquire on WhatsApp
              </Button>
              <Button variant="primary" size="lg" icon={CalendarCheck} fullWidth onClick={() => setTestRideOpen(true)}>
                Book Test Ride
              </Button>
            </div>

            {/* Quick specs */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Spec icon={BatteryCharging} label="Range" value={`${scooter.range} km`} />
              <Spec icon={Gauge} label="Top speed" value={`${scooter.topSpeed} km/h`} />
              <Spec icon={Timer} label="Charging time" value={scooter.chargingTime} />
              <Spec icon={ShieldCheck} label="Warranty" value={scooter.warranty} />
            </div>
          </Reveal>
        </div>

        {/* Full specs + EMI — EMI first on mobile for visibility */}
        <div className="mt-14 grid min-w-0 gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-3">
            <h2 className="break-words font-display text-display-md font-bold text-heading">Specifications</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Spec icon={BatteryCharging} label="Battery type" value={scooter.batteryType} />
              <Spec icon={Cpu} label="Battery capacity" value={scooter.batteryCapacity} />
              <Spec icon={Gauge} label="Range" value={`${scooter.range} km`} />
              <Spec icon={Gauge} label="Top speed" value={`${scooter.topSpeed} km/h`} />
              <Spec icon={Timer} label="Charging" value={scooter.chargingTime} />
              <Spec icon={Cpu} label="Motor" value={scooter.motor} />
              <Spec icon={Weight} label="Weight" value={scooter.weight} />
              <Spec icon={Users} label="Load capacity" value={scooter.loadCapacity} />
              <Spec icon={ShieldCheck} label="Warranty" value={scooter.warranty} />
            </div>

            {/* Colors */}
            {scooter.colors?.length > 0 && (
              <div className="mt-8">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
                  <Palette className="h-5 w-5 text-brand-500" /> Available colours
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scooter.colors.map((c) => (
                    <span key={c} className="break-words rounded-full bg-surface px-3 py-2 text-sm font-medium text-body ring-1 ring-line sm:px-4">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
                <Sparkles className="h-5 w-5 text-accent-500" /> Features
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-3">
                {scooter.features?.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 break-words text-sm text-body">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            {scooter.benefits?.length > 0 && (
              <div className="mt-8 rounded-2xl bg-surface-alt p-6">
                <h3 className="font-display text-lg font-bold text-heading">Why riders love it</h3>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {scooter.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 break-words text-sm font-medium text-body">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
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
              <EMICalculator price={scooter.price} settings={settings} scooterId={scooter.id} />
            </div>
          </div>
        </div>
      </div>

      <Modal open={testRideOpen} onClose={() => setTestRideOpen(false)} title={`Book a test ride`}>
        <p className="mb-4 text-sm text-muted">
          Ride the <span className="font-semibold text-heading">{scooter.name}</span> at our {site.address.city} showroom.
        </p>
        <TestRideForm scooter={scooter} onSuccess={() => setTimeout(() => setTestRideOpen(false), 2500)} />
      </Modal>
    </>
  );
}
