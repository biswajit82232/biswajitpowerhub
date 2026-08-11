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
  BEST_FOR_BY_ID,
  buildSiteFaqs,
  formatCatalogFromPrice,
} from '@/lib/catalogCopy';
import { formatINR } from '@/lib/utils';
import { getStartingPrice } from '@/lib/scooterVariants';

export default function NoLicenceElectricScooters() {
  const path = '/no-licence-electric-scooters-west-bengal';
  const { data: scooters } = useAsync(() => getScooters(), []);
  const list = scooters?.length ? scooters : SCOOTERS;
  const noLicence = useMemo(
    () => list.filter((s) => s.noLicence),
    [list],
  );
  const models = noLicence.length ? noLicence : list;
  const fromPrice = formatCatalogFromPrice(models);
  const faqs = useMemo(() => buildSiteFaqs(SITE_FAQS, list), [list]);

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'No Licence Electric Scooters West Bengal', path },
      ]),
      faqPageSchema(faqs),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'No Licence Electric Scooters in West Bengal (2026)',
        url: `${SITE_URL}${path}`,
      },
    ],
    [faqs],
  );

  return (
    <SeoLandingLayout
      title="No Licence Electric Scooters in West Bengal (2026) Guide"
      description={`No licence, no registration electric scooters in West Bengal${fromPrice ? ` from ${fromPrice}` : ''}. Live showroom prices at Biswajit Power Hub, Berhampore. Test ride today. Call 096355 05436.`}
      path={path}
      h1="No Licence Electric Scooters in West Bengal (2026) — Complete Guide"
      intro="Yes — you can legally ride certain low-speed electric scooters in West Bengal without a driving licence or RTO registration. Here is how it works at Biswajit Power Hub, Berhampore, Murshidabad."
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'No Licence Electric Scooters' },
      ]}
      jsonLd={jsonLd}
      faqs={faqs}
    >
      <h2>Do You Need a Licence for Electric Scooters?</h2>
      <p>
        Do you need a licence for electric scooters in West Bengal? For eligible low-speed models — maximum
        speed not exceeding 25 km/h and motor power within the notified category under Central Motor
        Vehicles rules — the answer is generally no driving licence and no RTO registration the way petrol
        scooters require. That is exactly the category Biswajit Power Hub stocks in Berhampore. Always ride
        safely and confirm current rules if your use case is commercial.
      </p>
      <p>
        High-speed electric scooters and motorcycles are different — those still need licence and
        registration. Our team at Chunakhali Bus Stand walks every customer through the difference in plain
        language.
      </p>

      <h2>Which Models Require No Registration?</h2>
      <p>
        Which models require no registration at our showroom? Our eligible low-speed (≤25 km/h) lineup is
        built for no-licence use
        {fromPrice ? `, with prices starting from ${fromPrice}` : ''}. Current options:
      </p>
      <ul>
        {models.map((s) => (
          <li key={s.id}>
            <Link to={`/scooters/${s.id}`}>{s.name}</Link>
            {' — '}
            {BEST_FOR_BY_ID[s.id] || s.tagline || 'Daily rides'}
            {' · from '}
            {formatINR(getStartingPrice(s))}
          </li>
        ))}
      </ul>
      <p>
        You charge at home, pay a fraction of petrol cost per kilometre, and skip registration queues across
        Murshidabad. Open any model for live battery packs and EMI.
      </p>

      <h2>Legal Low-Speed EVs in West Bengal</h2>
      <p>
        Legal low-speed EVs in West Bengal are popular because they remove paperwork friction while cutting
        running costs. Financing is also available on showroom purchases; ask about EMI even without RTO
        papers on eligible units.
      </p>
      <p>
        The best way to understand a no-licence electric scooter is to ride one. Book a free{' '}
        <Link to="/test-ride-berhampore">test ride in Berhampore</Link> at Chunakhali Bus Stand —{' '}
        {DEFAULT_HOURS_SUMMARY_SHORT.toLowerCase()}. Compare also our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> guide
        and <Link to="/low-budget-electric-scooters-berhampore">low budget options</Link>. Call 096355 05436
        for stock.
      </p>
    </SeoLandingLayout>
  );
}
