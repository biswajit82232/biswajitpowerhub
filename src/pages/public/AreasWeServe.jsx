import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Reveal } from '@/components/common/Reveal';
import { ShowroomCtaRow } from '@/components/seo/SeoLandingLayout';
import { SERVICE_LOCATIONS } from '@/data/locations';
import { breadcrumbList, postalAddressSchema } from '@/lib/schemaHelpers';
import { SITE, SITE_URL, GBP_NAP } from '@/config/site';

const path = '/areas-we-serve';

export default function AreasWeServe() {
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Areas We Serve', path },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Areas We Serve — Murshidabad Electric Scooters',
        url: `${SITE_URL}${path}`,
        description:
          'Towns across Murshidabad served by Biswajit Power Hub showroom in Berhampore.',
        about: {
          '@type': 'LocalBusiness',
          '@id': `${SITE_URL}/#dealership`,
          name: SITE.name,
          telephone: `+91${SITE.phones[0]}`,
          address: postalAddressSchema(SITE.address),
          areaServed: SERVICE_LOCATIONS.map((l) => ({
            '@type': 'City',
            name: l.name,
            containedInPlace: { '@type': 'AdministrativeArea', name: 'Murshidabad' },
          })),
        },
        hasPart: SERVICE_LOCATIONS.map((l) => ({
          '@type': 'WebPage',
          name: `Electric scooters for ${l.name}`,
          url: `${SITE_URL}${l.path}`,
        })),
      },
    ],
    [],
  );

  return (
    <>
      <SEO
        title="Areas We Serve — Murshidabad Electric Scooters | Biswajit Power Hub"
        description="Biswajit Power Hub serves Berhampore, Cossimbazar, Lalbagh, Jiaganj, Kandi, Domkal, Lalgola and more. Visit Chunakhali showroom. Call 096355 05436."
        path={path}
        jsonLd={jsonLd}
        titleTemplate={false}
      />

      <div className="border-b border-line bg-surface-alt">
        <div className="container-px py-8 sm:py-12">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Areas We Serve' }]} />
          <Reveal>
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl md:text-4xl">
              Areas We Serve — Murshidabad
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
              One showroom in Berhampore — customers from across Murshidabad. Free test rides at{' '}
              {GBP_NAP.address}. Looking for a dealer near you? Start with{' '}
              <Link to="/electric-scooter-near-me-berhampore" className="font-semibold text-brand-600 hover:underline">
                electric scooter near me Berhampore
              </Link>
              .
            </p>
            <div className="mt-6">
              <ShowroomCtaRow from="areas-we-serve" />
            </div>
          </Reveal>
        </div>
      </div>

      <div className="container-px py-10 sm:py-14">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_LOCATIONS.map((loc) => (
            <li key={loc.slug}>
              <Link
                to={loc.path}
                className="flex h-full flex-col gap-2 rounded-xl border border-line bg-white p-4 shadow-soft transition hover:border-brand-200 hover:shadow-card"
              >
                <span className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
                  {loc.name}
                </span>
                <span className="text-xs leading-snug text-muted">{loc.distanceHint}</span>
                <span className="mt-auto text-xs font-semibold text-brand-600">
                  Electric scooters for {loc.name} →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-body">
          Showroom: <strong>{SITE.name}</strong> — {GBP_NAP.address}. Hours: {GBP_NAP.hoursSummary}.{' '}
          <Link to="/contact" className="font-semibold text-brand-600 hover:underline">
            Contact &amp; map
          </Link>
          .
        </p>
      </div>
    </>
  );
}
