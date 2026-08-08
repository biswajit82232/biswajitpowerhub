import { MapPin, Phone, MessageCircle, ShieldCheck, Wrench, BatteryCharging } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Section, SectionHeading } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { SITE, SITE_URL, whatsappUrl, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { breadcrumbList, postalAddressSchema, openingHoursSchema } from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { trackEvent, EVENT } from '@/lib/tracking';
import { useMemo } from 'react';

const PERKS = [
  { icon: Wrench, title: '3 Free Servicing', desc: 'Complimentary service visits at our showroom.' },
  { icon: ShieldCheck, title: 'Warranty Coverage', desc: 'Motor & controller warranty on every scooter.' },
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
        telephone: site.phones.map((p) => `+91${p}`),
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
        description="Trusted multi-brand electric scooter showroom in Berhampore, West Bengal. Batteries, E-Rickshaws, and E-Scooty at Chunakhali."
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
              {SITE.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              We are a trusted electric scooter dealership in {site.address.city}, helping riders switch
              to clean, low-cost mobility — with honest guidance, showroom support, and models that need
              no licence or registration for eligible low-speed variants.
            </p>
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <SectionHeading
              eyebrow="Our showroom"
              title="Powering every ride in Berhampore"
              description={`Visit us at ${site.address.full}. Walk in for a test ride, EMI guidance, and battery upgrade options.`}
            />
            <ul className="mt-8 space-y-4 text-sm text-muted">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <span>{site.address.full}</span>
              </li>
              {site.phones.map((p) => (
                <li key={p} className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <a
                    href={telUrl(p, site)}
                    onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'about' })}
                    className="font-medium text-heading transition hover:text-brand-700"
                  >
                    +91 {p}
                  </a>
                </li>
              ))}
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
            <div className="grid gap-4 sm:grid-cols-1">
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
