import { Wrench, ShieldCheck, BatteryCharging, Check } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { LocateUs } from '@/components/sections/LocateUs';
import Button from '@/components/ui/Button';
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
  const perks = site.perks?.length ? site.perks : PREMIUM_PERKS;
  const batteryTagline = site.batteryUpgradeTagline;
  const jsonLd = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Service', path: '/service' },
  ]);

  return (
    <>
      <SEO
        title="Service & Battery Upgrades | Biswajit Power Hub Berhampore"
        description="3 free servicing, warranty support, and custom battery upgrades at Biswajit Power Hub, Chunakhali Bus Stand, Berhampore."
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
            Authorised showroom support for your electric scooter — free servicing visits, genuine
            parts guidance, and custom battery upgrades for extra range.
          </p>
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

          <div className="mt-12 border border-line bg-surface-alt p-6 sm:p-8">
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
              <Button
                href={telUrl(undefined, site)}
                target="_self"
                variant="dealerSecondary"
                onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'service-page' })}
              >
                Call Showroom
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LocateUs />
    </>
  );
}
