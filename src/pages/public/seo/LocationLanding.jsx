import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { getNearbyLocations } from '@/data/locations';
import { breadcrumbList, faqPageSchema, postalAddressSchema } from '@/lib/schemaHelpers';
import { SITE_URL, SITE } from '@/config/site';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { SCOOTERS } from '@/data/scooters';
import { formatCatalogFromPrice } from '@/lib/catalogCopy';

/**
 * Shared local service-area page — one town, one job: bring riders to Berhampore showroom.
 */
export default function LocationLanding({ location }) {
  const path = location.path;
  const faqs = useMemo(() => location.faqs || [], [location]);
  const nearbyTowns = getNearbyLocations(location, 5);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const fromPrice = formatCatalogFromPrice(scooters?.length ? scooters : SCOOTERS);
  const seoDescription = fromPrice
    ? `${location.description.replace(/\.\s*$/, '')}. Starting from ${fromPrice}.`
    : location.description;
  const highlights = useMemo(() => {
    const list = [...(location.highlights || [])];
    if (!fromPrice) return list;
    return list.map((h) =>
      /Current showroom prices/i.test(h) ? `Prices from ${fromPrice} with EMI options` : h,
    );
  }, [location.highlights, fromPrice]);

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Areas We Serve', path: '/areas-we-serve' },
        { name: `Electric Scooters in ${location.name}`, path },
      ]),
      ...(faqs.length ? [faqPageSchema(faqs)] : []),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: location.title,
        url: `${SITE_URL}${path}`,
        description: seoDescription,
        about: {
          '@type': 'LocalBusiness',
          '@id': `${SITE_URL}/#dealership`,
          name: SITE.name,
          url: SITE_URL,
          telephone: `+91${SITE.phones[0]}`,
          address: postalAddressSchema(SITE.address),
          geo: {
            '@type': 'GeoCoordinates',
            latitude: SITE.geo.latitude,
            longitude: SITE.geo.longitude,
          },
          hasMap: SITE.maps.link,
          image: `${SITE_URL}/logo-512.png`,
          areaServed: [location.name, location.district, 'West Bengal', 'Berhampore'],
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Electric scooter sales for ${location.name}`,
        provider: { '@id': `${SITE_URL}/#dealership` },
        areaServed: {
          '@type': 'City',
          name: location.name,
          containedInPlace: { '@type': 'AdministrativeArea', name: location.district },
        },
        serviceType: 'Electric scooter sales, test rides, battery upgrades',
      },
    ],
    [location, path, faqs, seoDescription],
  );

  return (
    <SeoLandingLayout
      title={location.title}
      description={seoDescription}
      path={path}
      h1={location.h1}
      intro={location.intro}
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'Areas We Serve', to: '/areas-we-serve' },
        { name: `Electric Scooters — ${location.name}` },
      ]}
      jsonLd={jsonLd}
      showFaq={false}
    >
      <h2>Why {location.name} riders choose Biswajit Power Hub</h2>
      <p>
        {SITE.name} is a physical electric scooter showroom at Chunakhali Bus Stand, Nimtala, Berhampore —
        not an online-only seller. Customers from {location.name} and across {location.district} visit for
        honest pricing, free test rides, EMI guidance, and walk-in servicing. {location.distanceHint}.
      </p>
      <ul>
        {highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      {location.localNote && (
        <>
          <h2>Local tip for {location.name} riders</h2>
          <p>{location.localNote}</p>
        </>
      )}

      <h2>Models popular with {location.name} buyers</h2>
      <p>
        Compare{' '}
        <Link to="/scooters/activa">Activa</Link>, <Link to="/scooters/zoom">Zoom</Link>,{' '}
        <Link to="/scooters/double-light">Double Light</Link>, and{' '}
        <Link to="/scooters/single-light">Single Light</Link> — all low-speed options with no licence on
        eligible units. Start from the{' '}
        <Link to="/scooters">full scooters catalogue</Link>, our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> guide,{' '}
        <Link to="/battery-scooty-berhampore">battery scooty in Berhampore</Link>, or{' '}
        <Link to="/electric-scooter-near-me-berhampore">electric scooter near me Berhampore</Link>.
      </p>

      <h2>Visit from {location.name}</h2>
      <p>
        Address: Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149. Hours: open all
        days 9:00 AM – 8:30 PM. Call 096355 05436 or book a{' '}
        <Link to="/test-ride-berhampore">free test ride</Link> before you travel. Need more range for{' '}
        {location.name} routes? Ask about a{' '}
        <Link to="/battery-upgrade-berhampore">battery upgrade</Link>.
      </p>

      <h2>Nearby areas we also serve</h2>
      <ul>
        {location.slug !== 'berhampore' && (
          <li>
            <Link to="/electric-scooters-berhampore">Electric scooters in Berhampore</Link>
          </li>
        )}
        {nearbyTowns.map((t) => (
          <li key={t.slug}>
            <Link to={t.path}>Electric scooters for {t.name}</Link>
          </li>
        ))}
        <li>
          <Link to="/areas-we-serve">All areas we serve in Murshidabad</Link>
        </li>
        <li>
          <Link to="/contact">Showroom contact &amp; map</Link>
        </li>
      </ul>

      {faqs.length > 0 && (
        <div className="not-prose mt-10 space-y-2 border border-line bg-surface-alt p-4 sm:p-6">
          <p className="font-display text-lg font-bold uppercase tracking-wide text-navy">FAQ</p>
          {faqs.map((f) => (
            <details key={f.question} className="border border-line bg-white open:shadow-soft">
              <summary className="cursor-pointer list-none px-4 py-3 font-display text-sm font-bold text-navy">
                {f.question}
              </summary>
              <p className="border-t border-line px-4 py-3 text-sm text-body">{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </SeoLandingLayout>
  );
}
