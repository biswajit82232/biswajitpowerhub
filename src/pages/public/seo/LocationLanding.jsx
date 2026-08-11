import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { SERVICE_LOCATIONS } from '@/data/locations';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL, SITE } from '@/config/site';

/**
 * Shared local service-area page — one town, one job: bring riders to Berhampore showroom.
 */
export default function LocationLanding({ location }) {
  const path = location.path;
  const faqs = useMemo(
    () => [...(location.faqs || []), ...SITE_FAQS.slice(0, 3)],
    [location.faqs],
  );

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: `Electric Scooters in ${location.name}`, path },
      ]),
      faqPageSchema(faqs),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: location.title,
        url: `${SITE_URL}${path}`,
        description: location.description,
        about: {
          '@type': 'LocalBusiness',
          name: SITE.name,
          '@id': `${SITE_URL}/#dealership`,
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
    [location, path, faqs],
  );

  const otherTowns = SERVICE_LOCATIONS.filter((l) => l.slug !== location.slug);

  return (
    <SeoLandingLayout
      title={location.title}
      description={location.description}
      path={path}
      h1={location.h1}
      intro={location.intro}
      breadcrumbs={[{ name: 'Home', to: '/' }, { name: `Electric Scooters — ${location.name}` }]}
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
        {location.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <h2>Models popular with {location.name} buyers</h2>
      <p>
        Compare{' '}
        <Link to="/scooters/activa">Activa</Link>, <Link to="/scooters/zoom">Zoom</Link>,{' '}
        <Link to="/scooters/double-light">Double Light</Link>, and{' '}
        <Link to="/scooters/single-light">Single Light</Link> — all low-speed options with no licence on
        eligible units. Start from the{' '}
        <Link to="/scooters">full scooters catalogue</Link> or our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> guide.
      </p>

      <h2>Visit from {location.name}</h2>
      <p>
        Address: Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149. Hours: open all
        days 9:00 AM – 8:30 PM. Call 096355 05436 or book a{' '}
        <Link to="/test-ride-berhampore">free test ride</Link> before you travel. Need more range for{' '}
        {location.name} routes? Ask about a{' '}
        <Link to="/battery-upgrade-berhampore">battery upgrade</Link>.
      </p>

      <h2>Also serving nearby towns</h2>
      <ul>
        {otherTowns.map((t) => (
          <li key={t.slug}>
            <Link to={t.path}>Electric scooters for {t.name}</Link>
          </li>
        ))}
        <li>
          <Link to="/contact">Showroom contact &amp; map</Link>
        </li>
      </ul>

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
    </SeoLandingLayout>
  );
}
