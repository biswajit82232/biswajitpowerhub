import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';
import { DEFAULT_HOURS_SUMMARY_SHORT } from '@/features/site/siteHours';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { SCOOTERS } from '@/data/scooters';
import {
  buildComparisonRows,
  buildSiteFaqs,
  formatCatalogFromPrice,
} from '@/lib/catalogCopy';
import { formatINR } from '@/lib/utils';

export default function LowBudgetElectricScooters() {
  const path = '/low-budget-electric-scooters-berhampore';
  const { data: scooters } = useAsync(() => getScooters(), []);
  const list = scooters?.length ? scooters : SCOOTERS;
  const rows = useMemo(() => buildComparisonRows(list), [list]);
  const fromPrice = formatCatalogFromPrice(list);
  const faqs = useMemo(() => buildSiteFaqs(SITE_FAQS, list), [list]);
  const entry = rows[0];
  const under50k = rows.filter((r) => r.priceValue < 50000);

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Low Budget Electric Scooters', path },
      ]),
      faqPageSchema(faqs),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Low Budget Electric Scooters in Berhampore',
        url: `${SITE_URL}${path}`,
      },
    ],
    [faqs],
  );

  return (
    <SeoLandingLayout
      title={`Low Budget Electric Scooters Berhampore${fromPrice ? ` | From ${fromPrice}` : ''}`}
      description={`Affordable electric scooters in Berhampore${fromPrice ? ` from ${fromPrice}` : ''}. Live showroom prices, no licence models, EMI. Visit Biswajit Power Hub, Chunakhali. Call 096355 05436.`}
      path={path}
      h1={`Low Budget Electric Scooters in Berhampore & Murshidabad${fromPrice ? ` — Starting ${fromPrice}` : ''}`}
      intro={`Need a cheap electric scooter in Berhampore without compromising safety or showroom support? Biswajit Power Hub stocks low-budget, no-licence models${fromPrice ? ` starting at ${fromPrice}` : ''} — with EMI options. Prices below follow live inventory.`}
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'Low Budget Electric Scooters' },
      ]}
      jsonLd={jsonLd}
      faqs={faqs}
    >
      <h2>Most Affordable Electric Scooters in Murshidabad</h2>
      <p>
        The most affordable electric scooters in Murshidabad start at Biswajit Power Hub
        {entry ? (
          <>
            {' '}
            with the <Link to={`/scooters/${entry.slug}`}>{entry.model}</Link> from {entry.price}
          </>
        ) : null}
        . Like all our low-speed EVs, eligible units need no driving licence and no RTO registration — so
        your total cost stays close to the showroom price.
      </p>
      {rows.length > 1 && (
        <p>
          Current starting prices:{' '}
          {rows.map((r, i) => (
            <span key={r.slug}>
              {i > 0 ? ', ' : ''}
              <Link to={`/scooters/${r.slug}`}>{r.model}</Link> ({r.price})
            </span>
          ))}
          . Open each model for battery pack options — Standard vs higher-range packs change the final
          figure.
        </p>
      )}
      <ul>
        <li>
          Entry price{fromPrice ? ` from ${fromPrice}` : ''} with no licence hassle on eligible models
        </li>
        <li>Home charging instead of weekly petrol bills across Murshidabad</li>
        <li>3 free servicing + 1 year motor &amp; controller warranty</li>
        <li>Walk-in support — we do not sell online-only</li>
        {under50k.length > 0 && (
          <li>
            {under50k.length} model{under50k.length > 1 ? 's' : ''} currently under {formatINR(50000)}{' '}
            on the starting pack
          </li>
        )}
      </ul>

      <h2>Save Money With Low Running Costs</h2>
      <p>
        Petrol scooters in Murshidabad often cost ₹150–₹300+ per week in fuel for daily city use. Our
        electric scooters typically run at about ₹0.30–₹0.50 per km with home charging. Over a year,
        that savings often covers a large part of your EMI.
      </p>
      <p>
        Compare full live specs on our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> page.
        We also serve <Link to="/areas-we-serve">towns across Murshidabad</Link>.
      </p>

      <h2>EMI Options Available</h2>
      <p>
        Financing is available on all models — ask at the counter for current EMI slabs. Visit Biswajit
        Power Hub in Berhampore ({DEFAULT_HOURS_SUMMARY_SHORT}), or call 096355 05436. Free{' '}
        <Link to="/test-ride-berhampore">test rides</Link> — no appointment needed.
      </p>
      <p className="text-xs text-muted">
        Prices reflect current inventory starting packs
        {entry ? ` (e.g. ${entry.model} ${entry.price})` : ''} and can change
        with offers or battery choice.
      </p>
    </SeoLandingLayout>
  );
}
