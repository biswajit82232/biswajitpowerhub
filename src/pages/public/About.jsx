import { MapPin, Phone, MessageCircle, ShieldCheck, Wrench, BatteryCharging } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { SiteImage } from '@/components/common/SiteImage';
import { SITE, SITE_URL, whatsappUrl, telUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { breadcrumbList, postalAddressSchema, openingHoursSchema } from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { trackEvent, EVENT } from '@/lib/tracking';
import { useMemo } from 'react';

const PERKS = [
  { icon: Wrench, title: '3 Free Servicing', desc: 'Complimentary service visits at our showroom.' },
  { icon: ShieldCheck, title: 'Warranty Coverage', desc: '1 year motor & controller warranty on every scooter.' },
  { icon: BatteryCharging, title: 'Battery Upgrades', desc: 'Custom higher-AH options for extra range.' },
];

export default function About() {
  const { site } = useSite();
  const { photos } = useSitePhotos();

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'MotorcycleDealer', 'Store'],
        '@id': `${SITE_URL}/#dealership`,
        name: SITE.name,
        url: `${SITE_URL}/about`,
        logo: `${SITE_URL}/logo-512.png`,
        image: `${SITE_URL}/logo-512.png`,
        description: SITE.description,
        telephone: `+91${site.phones[0]}`,
        address: postalAddressSchema(site.address),
        openingHoursSpecification: openingHoursSchema(site.hoursPerDay),
        sameAs: [SITE.social.instagram, SITE.social.facebook].filter(Boolean),
      },
    ],
    [site],
  );

  return (
    <>
      <SEO
        title="About Biswajit Power Hub — EV Dealer in Berhampore, Murshidabad"
        description="Trusted electric scooter showroom in Berhampore, Murshidabad. No licence EVs, battery upgrades, test rides at Chunakhali Bus Stand."
        path="/about"
        jsonLd={jsonLd}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-surface-alt">
        <div className="container-px py-12 sm:py-16">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'About' }]} />
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">About us</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              About Biswajit Power Hub — Trusted EV Dealer in Berhampore, Murshidabad
            </h1>
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="mx-auto grid max-w-[800px] gap-10 lg:max-w-none lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="space-y-8 text-base leading-relaxed text-body [&_h2]:border-b [&_h2]:border-line [&_h2]:pb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-heading">
              <div>
                <h2>Our Story</h2>
                <p className="mt-4">
                  Our story begins in Berhampore, Murshidabad — where rising petrol costs and complicated
                  paperwork kept everyday families from switching to electric. Biswajit Power Hub opened at
                  Chunakhali Bus Stand to make clean, low-cost mobility practical: low-speed electric scooters
                  that need no driving licence and no RTO registration on eligible models. From day one we
                  focused on showroom honesty — sit on the scooter, take a free test ride, and leave with
                  clear EMI numbers instead of brochure pressure.
                </p>
                <p className="mt-4">
                  Over the years we have helped hundreds of local customers choose between Activa, Zoom,
                  Single Light, and Double Light, arrange financing, and
                  upgrade batteries for extra range. Our expertise is hands-on: walk-in servicing, genuine
                  spare parts, and neighbours who already ride home from Chunakhali.
                </p>
              </div>

              <div>
                <h2>Why We Started Biswajit Power Hub</h2>
                <p className="mt-4">
                  Why we started Biswajit Power Hub is simple: Murshidabad deserved a trusted electric scooter
                  dealer who explains West Bengal no-licence rules in plain language and stands behind every
                  sale. Online-only sellers cannot feel seat height with you or diagnose a controller the same
                  afternoon. We built a showroom culture around affordability under ₹50,000, low running cost
                  with home charging, and after-sales support you can actually visit.
                </p>
                <p className="mt-4">
                  <strong className="text-heading">Mission:</strong> Power every ride in Berhampore with
                  affordable, legal, low-running-cost electric scooters — backed by real showroom support in
                  Murshidabad. NAP: {site.address.full}. Monday–Saturday 9 AM–8 PM · Sunday Closed.
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-4 text-sm text-muted">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <address className="not-italic">{site.address.full}</address>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <a
                  href={telUrl(undefined, site)}
                  onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'about' })}
                  className="font-medium text-heading transition hover:text-brand-600"
                >
                  {formatPhoneDisplay(site.phones[0])}
                </a>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/scooters" variant="primary" className="min-h-12">
                View scooters
              </Button>
              <Button
                href={whatsappUrl(undefined, site)}
                variant="whatsapp"
                icon={MessageCircle}
                className="min-h-12"
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'about' })}
              >
                WhatsApp us
              </Button>
              <Button to="/contact" variant="secondary" className="min-h-12">
                Contact &amp; map
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-xl ring-1 ring-line">
              <SiteImage
                src={photos?.about?.url}
                alt={photos?.about?.alt || 'Biswajit Power Hub team at Chunakhali showroom Berhampore Murshidabad'}
                width={800}
                height={450}
                loading="lazy"
                className="w-full"
                placeholderLabel="Upload team / showroom photo"
              />
            </div>
            <div className="mt-4 grid gap-4">
              {PERKS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl bg-surface-alt p-5 ring-1 ring-line">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 ring-1 ring-line">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-heading">{title}</h3>
                      <p className="mt-1 text-sm text-muted">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
