import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';

export default function NoLicenceElectricScooters() {
  const path = '/no-licence-electric-scooters-west-bengal';
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'No Licence Electric Scooters West Bengal', path },
      ]),
      faqPageSchema(SITE_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'No Licence Electric Scooters in West Bengal (2026)',
        url: `${SITE_URL}${path}`,
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title="No Licence Electric Scooters in West Bengal (2026) Guide"
      description="No licence, no registration electric scooters in West Bengal. Legal low-speed EVs at Biswajit Power Hub, Berhampore. Test ride today. Call 096355 05436."
      path={path}
      h1="No Licence Electric Scooters in West Bengal (2026) — Complete Guide"
      intro="Yes — you can legally ride certain low-speed electric scooters in West Bengal without a driving licence or RTO registration. Here is how it works at Biswajit Power Hub, Berhampore, Murshidabad."
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'No Licence Electric Scooters' },
      ]}
      jsonLd={jsonLd}
    >
      <h2>What the Motor Vehicles rules allow</h2>
      <p>
        Under Central Motor Vehicles rules, electric vehicles with a maximum speed not exceeding 25 km/h
        and motor power within the notified low-speed category are generally treated differently from
        conventional motorcycles and scooters. In practical terms for West Bengal riders, that means
        eligible low-speed e-scooters do not require a driving licence or RTO registration the way
        petrol scooters do. Always ride safely, follow traffic sense, and confirm current rules if your
        use case is commercial.
      </p>

      <h2>Models at Biswajit Power Hub that qualify</h2>
      <p>
        Every showroom model we sell is a low-speed (≤25 km/h) electric scooter designed for no-licence
        use: <Link to="/scooters/activa">Activa electric scooter in Berhampore</Link>,{' '}
        <Link to="/scooters/zoom">Zoom</Link>, <Link to="/scooters/double-light">Double Light</Link>, and{' '}
        <Link to="/scooters/single-light">Single Light</Link>. Prices start from ₹38,999. You charge at
        home, pay a fraction of petrol cost per kilometre, and skip registration queues.
      </p>

      <h2>Common myths about no-licence e-scooters</h2>
      <ul>
        <li>
          <strong>Myth:</strong> “Any electric scooter is licence-free.”{' '}
          <strong>Fact:</strong> Only low-speed eligible models qualify — high-speed EVs still need
          licence and registration.
        </li>
        <li>
          <strong>Myth:</strong> “No paperwork means no service.”{' '}
          <strong>Fact:</strong> We include 3 free servicing and motor/controller warranty from our
          Berhampore showroom.
        </li>
        <li>
          <strong>Myth:</strong> “You can’t get EMI without registration.”{' '}
          <strong>Fact:</strong> Ask our team — financing options are available on showroom purchases.
        </li>
      </ul>

      <h2>Test ride a no-licence scooter in Murshidabad</h2>
      <p>
        The best way to understand a no-licence electric scooter is to ride one. Book a free{' '}
        <Link to="/test-ride-berhampore">test ride in Berhampore</Link> at Chunakhali Bus Stand — no
        appointment needed Monday–Saturday 9 AM–8 PM. Compare also our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> guide
        and <Link to="/low-budget-electric-scooters-berhampore">low budget options</Link>. Call 096355
        05436 for stock.
      </p>
    </SeoLandingLayout>
  );
}
