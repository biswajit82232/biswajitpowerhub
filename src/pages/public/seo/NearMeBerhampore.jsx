import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { getPriorityLocations, SERVICE_LOCATIONS } from '@/data/locations';
import { breadcrumbList, faqPageSchema, postalAddressSchema } from '@/lib/schemaHelpers';
import { SITE, SITE_URL, GBP_NAP } from '@/config/site';

const path = '/electric-scooter-near-me-berhampore';

const NEAR_ME_FAQS = [
  {
    question: 'Where is an electric scooter showroom near me in Berhampore?',
    answer: `${SITE.name} is at ${GBP_NAP.address}. Search BISWAJIT POWER HUB on Google Maps or call ${GBP_NAP.phoneDisplay}.`,
  },
  {
    question: 'Do I need a licence for electric scooters near Berhampore?',
    answer:
      'Eligible low-speed models (≤25 km/h) generally need no driving licence and no RTO registration in West Bengal. Confirm the class for your model at our Chunakhali showroom.',
  },
  {
    question: 'Can I test ride today near Chunakhali?',
    answer:
      'Yes — free supervised test rides during showroom hours (open all days 9:00 AM – 8:30 PM). No appointment required.',
  },
];

export default function NearMeBerhampore() {
  const priority = getPriorityLocations();

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Electric Scooter Near Me Berhampore', path },
      ]),
      faqPageSchema(NEAR_ME_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Electric Scooter Near Me in Berhampore',
        url: `${SITE_URL}${path}`,
        description:
          'Find an electric scooter dealer near you in Berhampore at Biswajit Power Hub, Chunakhali Bus Stand.',
        about: {
          '@type': 'LocalBusiness',
          '@id': `${SITE_URL}/#dealership`,
          name: SITE.name,
          telephone: `+91${SITE.phones[0]}`,
          image: `${SITE_URL}/logo-512.png`,
          address: postalAddressSchema(SITE.address),
          geo: {
            '@type': 'GeoCoordinates',
            latitude: SITE.geo.latitude,
            longitude: SITE.geo.longitude,
          },
          hasMap: SITE.maps.link,
          areaServed: SERVICE_LOCATIONS.map((l) => l.name),
        },
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title="Electric Scooter Near Me Berhampore | Biswajit Power Hub"
      description="Electric scooter near me in Berhampore? Visit Biswajit Power Hub at Chunakhali Bus Stand — no licence models, free test ride, EMI. Call 096355 05436."
      path={path}
      h1="Electric Scooter Near Me in Berhampore — Local Dealer at Chunakhali"
      intro="Looking for an electric scooter near me in Berhampore or Murshidabad? This page is for map and “near me” intent — directions, hours, and walk-in test rides at our Chunakhali Bus Stand showroom."
      breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Electric Scooter Near Me Berhampore' }]}
      jsonLd={jsonLd}
    >
      <h2>Your local electric scooter dealer in Berhampore</h2>
      <p>
        When people search <strong>electric scooter near me</strong> in Berhampore, they want a real
        showroom — not only an online listing. {SITE.name} stocks Activa, Zoom, Single Light, and Double
        Light low-speed models with no licence on eligible units, EMI guidance, and 3 free servicing
        visits.
      </p>
      <ul>
        <li>Address: {GBP_NAP.address}</li>
        <li>Phone / WhatsApp: {GBP_NAP.phoneDisplay}</li>
        <li>Hours: {GBP_NAP.hoursSummary}</li>
      </ul>

      <h2>What to do next</h2>
      <p>
        Call or WhatsApp for stock, get directions on Maps, then walk in for a free test ride. Compare
        models on our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> page
        or the dedicated{' '}
        <Link to="/electric-scooters-berhampore">Berhampore electric scooters</Link> service page.
        Searching <Link to="/battery-scooty-berhampore">battery scooty in Berhampore</Link>? That hub
        matches the local wording. Book a{' '}
        <Link to="/test-ride-berhampore">free test ride</Link> or visit{' '}
        <Link to="/contact">Contact / map</Link>.
      </p>

      <h2>Also serving nearby Murshidabad towns</h2>
      <p>
        Customers visit us from across the district. See the full list on{' '}
        <Link to="/areas-we-serve">Areas we serve</Link>, or jump to a town:
      </p>
      <ul>
        {priority.map((t) => (
          <li key={t.slug}>
            <Link to={t.path}>Electric scooters for {t.name}</Link>
          </li>
        ))}
      </ul>
    </SeoLandingLayout>
  );
}
