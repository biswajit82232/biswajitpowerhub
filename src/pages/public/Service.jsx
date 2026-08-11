import { Wrench, ShieldCheck, BatteryCharging, Check } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { LocateUs } from '@/components/sections/LocateUs';
import Button from '@/components/ui/Button';
import { ServiceBookingForm } from '@/features/leads/ServiceBookingForm';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { PREMIUM_PERKS, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { breadcrumbList } from '@/lib/schemaHelpers';

const ICONS = {
  servicing: Wrench,
  warranty: ShieldCheck,
  batteryUpgrade: BatteryCharging,
};

export default function Service() {
  const { site } = useSite();
  const { data: scooters } = useAsync(() => getScooters(), []);
  const perks = site.perks?.length ? site.perks : PREMIUM_PERKS;
  const batteryTagline = site.batteryUpgradeTagline;
  const jsonLd = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Service', path: '/service' },
  ]);

  return (
    <>
      <SEO
        title="Book Service & Battery Upgrades | Biswajit Power Hub Berhampore"
        description="Book free 1st, 2nd or 3rd scooter servicing, or paid repairs at Biswajit Power Hub, Chunakhali Bus Stand, Berhampore. Battery upgrades available."
        path="/service"
        jsonLd={[jsonLd]}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-white">
        <div className="container-px py-8 sm:py-12">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Service' }]} />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Service</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            Service &amp; Battery Upgrades
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
            Authorised showroom support for your electric scooter — book your free 1st, 2nd or 3rd
            servicing visit, or schedule paid repairs and battery upgrades.
          </p>
          <div className="mt-5">
            <Button href="#book" variant="dealerPrimary">
              Book Service Online
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14">
        <div className="container-px">
          <div className="grid gap-6 sm:grid-cols-3">
            {perks.map((p) => {
              const Icon = ICONS[p.id] || Wrench;
              return (
                <article key={p.id} className="border border-line bg-white p-6 text-center shadow-soft">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-navy text-navy">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </span>
                  <h2 className="mt-4 font-display text-base font-bold uppercase tracking-wide text-navy">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm text-body">{p.desc}</p>
                </article>
              );
            })}
          </div>

          <div
            id="book"
            className="mt-12 scroll-mt-24 grid gap-8 border border-line bg-surface-alt p-5 sm:p-8 lg:grid-cols-5 lg:gap-10"
          >
            <div className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">Book online</p>
              <h2 className="mt-2 font-display text-xl font-bold uppercase text-navy sm:text-2xl">
                Book your service
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-body">
                Choose free 1st / 2nd / 3rd servicing (included with eligible scooters) or paid workshop
                work. Pick a preferred date — we&apos;ll confirm by phone.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  'Free 1st, 2nd & 3rd servicing options',
                  'Paid repairs & diagnostics',
                  'Showroom at Chunakhali Bus Stand',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-body">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                href={telUrl(undefined, site)}
                target="_self"
                variant="dealerSecondary"
                className="mt-5"
                onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'service-book' })}
              >
                Or call showroom
              </Button>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-line shadow-soft sm:p-6 lg:col-span-3">
              <ServiceBookingForm scooters={scooters || []} />
            </div>
          </div>

          <div className="mt-12 border border-line bg-white p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold uppercase text-navy">Battery upgrades</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">{batteryTagline}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                'Higher AH battery options',
                'Expert fitting at our showroom',
                'Extended range on the same model',
                'Advice for daily Berhampore routes',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-body">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/battery-upgrade-berhampore" variant="dealerPrimary">
                Learn More
              </Button>
              <Button href="#book" variant="dealerSecondary">
                Book Service
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LocateUs />
    </>
  );
}
