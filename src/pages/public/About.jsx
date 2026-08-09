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
  const aboutPhoto = photos?.about?.url || photos?.gallery?.[0]?.url || photos?.hero?.url || null;

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
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SITE.geo.latitude,
          longitude: SITE.geo.longitude,
        },
        hasMap: site.maps?.link || SITE.maps.link,
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

      <section className="relative isolate min-h-[40vh] overflow-hidden bg-heading sm:min-h-[46vh]">
        <SiteImage
          src={aboutPhoto}
          alt={
            photos?.about?.alt ||
            'Biswajit Power Hub team at Chunakhali showroom Berhampore Murshidabad'
          }
          width={1600}
          height={900}
          loading="eager"
          className="absolute inset-0 h-full w-full !aspect-auto bg-heading"
          imgClassName="object-cover object-center"
          placeholderLabel="Upload team / showroom photo"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-heading via-heading/60 to-heading/30"
          aria-hidden
        />
        <div className="container-px relative flex min-h-[40vh] flex-col justify-end pb-10 pt-20 sm:min-h-[46vh] sm:pb-14">
          <Breadcrumbs
            items={[{ name: 'Home', to: '/' }, { name: 'About' }]}
            className="mb-0 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
          />
          <Reveal>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-sky-200/90">About us</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              A local showroom you can trust
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/80">
              Biswajit Power Hub at Chunakhali — premium low-speed EVs for Berhampore and Murshidabad.
            </p>
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="space-y-10 text-base leading-relaxed text-body [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-heading">
              <div>
                <h2>What to expect when you visit</h2>
                <p className="mt-4">
                  Walk into Chunakhali Bus Stand and you will meet a local team — not a call centre. We help
                  you compare Activa, Zoom, Single Light, and Double Light on the floor, explain no-licence
                  rules for West Bengal in plain language, and never rush a Murshidabad family into the wrong
                  battery pack. Sit on the seat, check under-seat storage, and take a free test ride on nearby
                  roads before you decide.
                </p>
                <p className="mt-4">
                  Prefer a local shop over an online-only seller? So do our customers. Same-day questions about
                  controllers, chargers, and servicing are answered in person. Bring a friend, ask about EMI
                  slabs, and leave with a clear price — including 3 free servicing and warranty coverage —
                  written down before you pay.
                </p>
              </div>

              <div>
                <h2>Our Story</h2>
                <p className="mt-4">
                  Our story begins in Berhampore, Murshidabad — where rising petrol costs and complicated
                  paperwork kept everyday families from switching to electric. Biswajit Power Hub opened at
                  Chunakhali Bus Stand to make clean, low-cost mobility practical: low-speed electric scooters
                  that need no driving licence and no RTO registration on eligible models. From day one we
                  focused on showroom honesty — sit on the scooter, take a free test ride, and leave with clear
                  EMI numbers instead of brochure pressure.
                </p>
                <p className="mt-4">
                  Over the years we have helped hundreds of local customers choose between Activa, Zoom, Single
                  Light, and Double Light, arrange financing, and upgrade batteries for extra range. Our
                  expertise is hands-on: walk-in servicing, genuine spare parts, and neighbours who already ride
                  home from Chunakhali.
                </p>
              </div>

              <div>
                <h2>Why We Started Biswajit Power Hub</h2>
                <p className="mt-4">
                  Murshidabad deserved a trusted electric scooter dealer who explains West Bengal no-licence
                  rules in plain language and stands behind every sale. Online-only sellers cannot feel seat
                  height with you or diagnose a controller the same afternoon. We built a showroom culture
                  around affordability under ₹50,000, low running cost with home charging, and after-sales
                  support you can actually visit.
                </p>
                <p className="mt-4">
                  <strong className="text-heading">Mission:</strong> Power every ride in Berhampore with
                  affordable, legal, low-running-cost electric scooters — backed by real showroom support in
                  Murshidabad. NAP: {site.address.full}.{' '}
                  {site.hours?.summaryShort || 'Open all days 9 AM–8:30 PM'}.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
              {PERKS.map(({ icon: Icon, title, desc }) => (
                <div key={title}>
                  <Icon className="h-5 w-5 text-brand-600" />
                  <h3 className="mt-3 font-display text-lg font-bold text-heading">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{desc}</p>
                </div>
              ))}
            </div>

            <ul className="mt-10 space-y-3 border-t border-line pt-8 text-sm text-muted">
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
        </div>
      </Section>
    </>
  );
}
