import { MapPin, Phone, MessageCircle, ShieldCheck, Wrench, BatteryCharging } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Section, SectionHeading } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { SITE, SITE_URL, whatsappUrl, telUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
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

      <section className="border-b border-line bg-surface-alt/50">
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
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="space-y-4 text-base leading-relaxed text-body">
              <p>
                Biswajit Power Hub started with a simple mission: make clean, low-cost electric mobility
                practical for everyday families in Berhampore and across Murshidabad. Too many riders were
                stuck with rising petrol costs and complicated paperwork. We focused on low-speed electric
                scooters that need no driving licence and no RTO registration — so switching to electric is
                as simple as visiting our showroom at Chunakhali Bus Stand.
              </p>
              <p>
                Over the years we have helped hundreds of local customers choose between Activa, Zoom,
                Single Light, and Double Light models, arrange EMI, accept exchange of old scooters, and
                upgrade batteries for extra range. Our expertise is hands-on: test rides on the floor,
                honest comparisons, and after-sales servicing you can walk into — not a call-centre
                warranty maze.
              </p>
              <p>
                <strong className="text-heading">Mission:</strong> Power every ride in Berhampore with
                affordable, legal, low-running-cost electric scooters — backed by real showroom support in
                Murshidabad.
              </p>
            </div>
            <SectionHeading
              className="mt-10"
              eyebrow="Our showroom"
              title="Visit Chunakhali, Berhampore"
              description={`NAP: ${site.address.full}. Monday–Saturday 9 AM–8 PM · Sunday Closed.`}
            />
            <ul className="mt-6 space-y-4 text-sm text-muted">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <address className="not-italic">{site.address.full}</address>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <a
                  href={telUrl(undefined, site)}
                  onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'about' })}
                  className="font-medium text-heading transition hover:text-brand-700"
                >
                  {formatPhoneDisplay(site.phones[0])}
                </a>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/scooters" variant="primary">
                View scooters
              </Button>
              <Button
                href={whatsappUrl(undefined, site)}
                variant="whatsapp"
                icon={MessageCircle}
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'about' })}
              >
                WhatsApp us
              </Button>
              <Button to="/contact" variant="secondary">
                Contact &amp; map
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-2xl bg-surface-alt ring-1 ring-line">
              <img
                src="/og-image.png"
                alt="Biswajit Power Hub team and showroom in Berhampore"
                width={800}
                height={450}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
              <p className="px-4 py-3 text-center text-xs text-muted">Showroom photo placeholder — Chunakhali, Berhampore</p>
            </div>
            <div className="mt-4 grid gap-4">
              {PERKS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl bg-surface-alt/80 p-5 ring-1 ring-line">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
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
