import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';
import { DEFAULT_HOURS_SUMMARY_SHORT } from '@/features/site/siteHours';

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
      <h2>Do You Need a Licence for Electric Scooters?</h2>
      <p>
        Do you need a licence for electric scooters in West Bengal? For eligible low-speed models — maximum
        speed not exceeding 25 km/h and motor power within the notified category under Central Motor
        Vehicles rules — the answer is generally no driving licence and no RTO registration the way petrol
        scooters require. That is exactly the category Biswajit Power Hub stocks in Berhampore for
        Murshidabad families who want simple, legal ownership. Always ride safely, follow traffic sense, and
        confirm current rules if your use case is commercial.
      </p>
      <p>
        High-speed electric scooters and motorcycles are different — those still need licence and
        registration. If a seller cannot clearly explain the speed limit and category, ask before you pay.
        Our team at Chunakhali Bus Stand walks every customer through the difference in plain language.
      </p>

      <h2>Which Models Require No Registration?</h2>
      <p>
        Which models require no registration at our showroom? Every showroom model we sell is a low-speed
        (≤25 km/h) electric scooter designed for no-licence use:{' '}
        <Link to="/scooters/activa">Activa electric scooter in Berhampore</Link>,{' '}
        <Link to="/scooters/zoom">Zoom</Link>, <Link to="/scooters/double-light">Double Light</Link>, and{' '}
        <Link to="/scooters/single-light">Single Light</Link>. Prices start from ₹38,999. You charge at
        home, pay a fraction of petrol cost per kilometre, and skip registration queues across Murshidabad.
      </p>
      <ul>
        <li>Activa — longer Berhampore / Murshidabad trips</li>
        <li>Zoom — premium daily commute feel</li>
        <li>Double Light — family errands and comfort</li>
        <li>Single Light — lowest entry price from ₹38,999</li>
      </ul>

      <h2>Legal Low-Speed EVs in West Bengal</h2>
      <p>
        Legal low-speed EVs in West Bengal are popular because they remove paperwork friction while cutting
        running costs. Common myths we hear in Berhampore: “any electric scooter is licence-free” (false —
        only low-speed eligible models), and “no paperwork means no service” (false — we include 3 free
        servicing and motor/controller warranty). Financing is also available on showroom purchases; ask
        about EMI even without RTO papers on eligible units.
      </p>
      <p>
        The best way to understand a no-licence electric scooter is to ride one. Book a free{' '}
        <Link to="/test-ride-berhampore">test ride in Berhampore</Link> at Chunakhali Bus Stand — no
        appointment needed — {DEFAULT_HOURS_SUMMARY_SHORT.toLowerCase()}. Compare also our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> guide
        and <Link to="/low-budget-electric-scooters-berhampore">low budget options</Link>. Call 096355
        05436 for stock.
      </p>
    </SeoLandingLayout>
  );
}
