import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';

export default function ExchangeOldScooter() {
  const path = '/exchange-old-scooter-berhampore';
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Exchange Old Scooter Berhampore', path },
      ]),
      faqPageSchema(SITE_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Scooter Exchange Offer in Berhampore',
        provider: { '@type': 'LocalBusiness', name: 'Biswajit Power Hub' },
        areaServed: 'Berhampore, Murshidabad, West Bengal',
        url: `${SITE_URL}${path}`,
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title="Exchange Old Scooter in Berhampore | Biswajit Power Hub"
      description="Exchange your old petrol or electric scooter in Berhampore. Free valuation at Biswajit Power Hub, Chunakhali. Call 096355 05436."
      path={path}
      h1="Exchange Old Scooter in Berhampore — Free Valuation"
      intro="Switch to a no-licence electric scooter and get exchange value for your old petrol or electric scooter at Biswajit Power Hub, Chunakhali, Berhampore, Murshidabad."
      breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Exchange Offer' }]}
      jsonLd={jsonLd}
    >
      <h2>How Exchange Works</h2>
      <p>
        How exchange works at Biswajit Power Hub: bring your old petrol or electric scooter to our
        showroom near Chunakhali Bus Stand in Berhampore. Our team inspects condition, age, and local
        market demand, then offers a fair exchange price against any of our low-speed electric models —
        including the budget-friendly <Link to="/scooters/single-light">Single Light</Link> from ₹38,999
        and the long-range <Link to="/scooters/activa">Activa</Link>. There is no obligation; you can walk
        away after the valuation with zero pressure.
      </p>
      <ul>
        <li>Free on-the-spot valuation at Chunakhali, Berhampore</li>
        <li>Credit applied toward Activa, Zoom, Double Light, or Single Light</li>
        <li>EMI available on the balance after exchange</li>
        <li>Pair with a free test ride the same visit</li>
      </ul>
      <p>
        Call or WhatsApp 096355 05436 with your old model’s year and condition before you arrive so we can
        prepare a realistic range for Murshidabad market values.
      </p>

      <h2>Get the Best Value for Your Old Scooter</h2>
      <p>
        Get the best value for your old scooter by arriving with service history if you have it, a charged
        battery (for e-scooters), and realistic photos of scratches or panel damage. Clean scooters with
        matching papers typically fetch stronger exchange offers. Petrol costs keep rising while home
        charging on our scooters stays around ₹0.30–₹0.50 per km — combined with no licence / no RTO
        paperwork on eligible models, Berhampore customers often cut monthly running costs dramatically
        after switching.
      </p>
      <p>
        Hours: Monday–Saturday 9:00 AM – 8:00 PM · Sunday Closed. Pair exchange with a{' '}
        <Link to="/test-ride-berhampore">free test ride</Link> and compare the{' '}
        <Link to="/low-budget-electric-scooters-berhampore">low budget electric scooters</Link> we stock
        across Murshidabad.
      </p>
    </SeoLandingLayout>
  );
}
