import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';
import { DEFAULT_HOURS_SUMMARY } from '@/features/site/siteHours';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { SCOOTERS } from '@/data/scooters';
import {
  buildComparisonRows,
  buildSiteFaqs,
  formatCatalogFromPrice,
} from '@/lib/catalogCopy';

export default function BestElectricScooters() {
  const path = '/best-electric-scooters-berhampore';
  const { data: scooters } = useAsync(() => getScooters(), []);
  const list = scooters?.length ? scooters : SCOOTERS;
  const rows = useMemo(() => buildComparisonRows(list), [list]);
  const fromPrice = formatCatalogFromPrice(list);
  const faqs = useMemo(() => buildSiteFaqs(SITE_FAQS, list), [list]);
  const cheapestName = rows[0]?.model;

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Best Electric Scooters in Berhampore', path },
      ]),
      faqPageSchema(faqs),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Best Electric Scooters in Berhampore (2026)',
        url: `${SITE_URL}${path}`,
        description:
          'Compare the best electric scooters in Berhampore at Biswajit Power Hub.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Best electric scooters in Berhampore',
        itemListElement: rows.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${r.model} Electric Scooter`,
          url: `${SITE_URL}/scooters/${r.slug}`,
        })),
      },
    ],
    [faqs, rows],
  );

  return (
    <SeoLandingLayout
      title="Best Electric Scooters in Berhampore (2026) | Biswajit Power Hub"
      description={`Compare the best electric scooters in Berhampore${fromPrice ? ` from ${fromPrice}` : ''}. Live showroom prices. No licence models. Test ride at Chunakhali. Call 096355 05436.`}
      path={path}
      h1="Best Electric Scooters in Berhampore (2026) — Top Models Compared"
      intro={`Looking for the best electric scooter in Berhampore and Murshidabad? Compare our current showroom models at Biswajit Power Hub — prices and ranges below update from live inventory${fromPrice ? ` (from ${fromPrice})` : ''}.`}
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'Best Electric Scooters in Berhampore' },
      ]}
      jsonLd={jsonLd}
      faqs={faqs}
    >
      <h2>Top Electric Scooters Compared</h2>
      <p>
        Shoppers searching for the best electric scooters in Berhampore usually want three things: a fair
        on-road price, zero licence paperwork on eligible low-speed models, and a showroom they can trust in
        Murshidabad. Biswajit Power Hub specialises in those needs — with home charging, 3 free servicing,
        and 1 year motor &amp; controller warranty. Figures below match today’s catalog (including battery
        pack ranges where available).
      </p>

      <div className="not-prose">
        {!rows.length ? (
          <p className="text-sm text-muted">Models will appear here once inventory is loaded.</p>
        ) : (
          <>
            <ul className="space-y-3 md:hidden">
              {rows.map((r) => (
                <li key={r.slug} className="border border-line bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-bold uppercase tracking-wide text-navy">
                      {r.model}
                    </h3>
                    <p className="shrink-0 font-display text-base font-extrabold text-body">{r.price}</p>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Range</dt>
                      <dd className="font-semibold text-body">{r.range}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Top Speed</dt>
                      <dd className="font-semibold text-body">{r.topSpeed}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Best For</dt>
                      <dd className="font-semibold text-body">{r.bestFor}</dd>
                    </div>
                  </dl>
                  <Link
                    to={`/scooters/${r.slug}`}
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-dealer border border-brand-500 bg-brand-500 px-4 text-xs font-bold uppercase tracking-wide !text-white hover:!text-white hover:bg-brand-600 hover:no-underline"
                  >
                    View {r.model}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto border border-line md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-surface-alt text-navy">
                  <tr>
                    <th className="px-3 py-3 font-bold uppercase tracking-wide">Model</th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wide">Price</th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wide">Range</th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wide">Top Speed</th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wide">Best For</th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wide">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.slug} className="border-t border-line">
                      <td className="px-3 py-3 font-semibold text-navy">{r.model}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{r.price}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{r.range}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{r.topSpeed}</td>
                      <td className="px-3 py-3">{r.bestFor}</td>
                      <td className="px-3 py-3">
                        <Link
                          to={`/scooters/${r.slug}`}
                          className="font-semibold text-brand-500 underline-offset-2 hover:underline"
                        >
                          View {r.model}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <h2>Which Model is Best for You?</h2>
      <p>
        Choosing the best e-scooter in Murshidabad depends on daily kilometres, budget, and who will ride.
        Open any model above for live battery packs and EMI, or book a{' '}
        <Link to="/test-ride-berhampore">free test ride in Berhampore</Link>
        {cheapestName ? ` — entry pricing currently starts with ${cheapestName}` : ''}
        {fromPrice ? ` from ${fromPrice}` : ''}.
      </p>
      <ul>
        <li>Eligible low-speed models (≤25 km/h) — no licence / no RTO registration</li>
        <li>Home charging typically ₹0.30–₹0.50 per km versus petrol queues</li>
        <li>EMI options available at the Chunakhali showroom</li>
        <li>Custom battery upgrades if you outgrow stock range later</li>
      </ul>

      <h2>Why Buy From Biswajit Power Hub?</h2>
      <p>
        Unlike online-only sellers, we run a physical showroom at Chunakhali Bus Stand so you can check
        battery options, ask about{' '}
        <Link to="/battery-upgrade-berhampore">battery upgrades</Link>, and leave with clear EMI numbers —
        not pressure selling. Ready to compare in person? Call 096355 05436 or visit — {DEFAULT_HOURS_SUMMARY}.
      </p>
      <p>
        Also explore{' '}
        <Link to="/low-budget-electric-scooters-berhampore">low budget electric scooters in Berhampore</Link>{' '}
        and our{' '}
        <Link to="/no-licence-electric-scooters-west-bengal">no licence electric scooters West Bengal</Link>{' '}
        guide. See{' '}
        <Link to="/electric-scooter-near-me-berhampore">electric scooter near me Berhampore</Link> and{' '}
        <Link to="/areas-we-serve">areas we serve</Link> across Murshidabad.
      </p>
      <p className="text-xs text-muted">
        Prices shown are starting list figures from current inventory
        {fromPrice ? ` (lowest from ${fromPrice})` : ''} and may change with battery pack or offers.
        Confirm at the showroom before purchase.
      </p>
    </SeoLandingLayout>
  );
}
