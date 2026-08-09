import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { COMPARISON_ROWS, SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';

export default function BestElectricScooters() {
  const path = '/best-electric-scooters-berhampore';
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Best Electric Scooters in Berhampore', path },
      ]),
      faqPageSchema(SITE_FAQS),
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
        itemListElement: COMPARISON_ROWS.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${r.model} Electric Scooter`,
          url: `${SITE_URL}/scooters/${r.slug}`,
        })),
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title="Best Electric Scooters in Berhampore (2026) | Biswajit Power Hub"
      description="Compare the best electric scooters in Berhampore. Activa, Zoom, Single Light & Double Light. No licence. Test ride at Chunakhali. Call 096355 05436."
      path={path}
      h1="Best Electric Scooters in Berhampore (2026) — Top Models Compared"
      intro="Looking for the best electric scooter in Berhampore and Murshidabad? Compare Activa, Zoom, Double Light, and Single Light at Biswajit Power Hub — no licence, low running cost, free test rides at Chunakhali Bus Stand."
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'Best Electric Scooters in Berhampore' },
      ]}
      jsonLd={jsonLd}
    >
      <h2>Compare the best e-scooters in Berhampore</h2>
      <p>
        Shoppers searching for the best electric scooters in Berhampore usually want three things: a fair
        on-road price under ₹50,000, zero licence paperwork, and a showroom they can trust in Murshidabad.
        Biswajit Power Hub specialises in low-speed electric scooters that meet those needs — with home
        charging, 3 free servicing, and 1 year motor &amp; controller warranty on every purchase.
      </p>

      <div className="not-prose overflow-x-auto rounded-2xl ring-1 ring-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-alt text-heading">
            <tr>
              <th className="px-4 py-3 font-bold">Model</th>
              <th className="px-4 py-3 font-bold">Price</th>
              <th className="px-4 py-3 font-bold">Range</th>
              <th className="px-4 py-3 font-bold">Top Speed</th>
              <th className="px-4 py-3 font-bold">Best For</th>
              <th className="px-4 py-3 font-bold">Link</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((r) => (
              <tr key={r.slug} className="border-t border-line">
                <td className="px-4 py-3 font-semibold text-heading">{r.model}</td>
                <td className="px-4 py-3">{r.price}</td>
                <td className="px-4 py-3">{r.range}</td>
                <td className="px-4 py-3">{r.topSpeed}</td>
                <td className="px-4 py-3">{r.bestFor}</td>
                <td className="px-4 py-3">
                  <Link to={`/scooters/${r.slug}`} className="font-semibold text-brand-700 hover:underline">
                    {r.model} electric scooter in Berhampore
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Why Biswajit Power Hub is the best EV dealer in Murshidabad</h2>
      <p>
        Unlike online-only sellers, we run a physical showroom at Chunakhali Bus Stand so you can sit on the
        scooter, check battery options, and take a free{' '}
        <Link to="/test-ride-berhampore">test ride in Berhampore</Link> before you decide. Our team explains
        EMI, exchange offers on old scooters, and custom{' '}
        <Link to="/battery-upgrade-berhampore">battery upgrades</Link> in plain language. Customers across
        Berhampore and Murshidabad choose us for honest pricing, genuine spares, and after-sales service —
        not pressure selling.
      </p>
      <p>
        If you want the best e-scooty in Murshidabad without licence hassles, start with the{' '}
        <Link to="/scooters/activa">Activa electric scooter in Berhampore</Link> for long trips, or the{' '}
        <Link to="/scooters/single-light">Single Light</Link> if budget is your top priority. Every model is
        low-speed (≤25 km/h), charge-at-home, and ready for same-day showroom delivery when stock allows.
      </p>
      <p>
        Ready to compare in person? Call 096355 05436 or walk into Biswajit Power Hub near Chunakhali Bus
        Stand — Monday to Saturday, 9 AM to 8 PM.
      </p>
    </SeoLandingLayout>
  );
}
