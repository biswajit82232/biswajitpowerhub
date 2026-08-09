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
      <h2>How exchange works</h2>
      <p>
        Bring your old scooter to our showroom near Chunakhali Bus Stand. Our team inspects condition,
        age, and market demand, then offers a fair exchange price against any of our low-speed electric
        models — including the budget-friendly{' '}
        <Link to="/scooters/single-light">Single Light</Link> from ₹38,999 and the long-range{' '}
        <Link to="/scooters/activa">Activa</Link>. No obligation; you can walk away after the valuation.
      </p>

      <h2>Why exchange into an EV in Murshidabad</h2>
      <p>
        Petrol costs keep rising while home charging on our scooters stays around ₹0.30–₹0.50 per km.
        Combined with no licence / no RTO paperwork on eligible models, exchange customers in Berhampore
        often cut monthly running costs dramatically. Ask about EMI on the balance after exchange credit.
      </p>

      <h2>Visit or call today</h2>
      <p>
        Hours: Monday–Saturday 9:00 AM – 8:00 PM · Sunday Closed. Call 096355 05436 or WhatsApp to tell
        us your old model before you arrive. Pair exchange with a{' '}
        <Link to="/test-ride-berhampore">free test ride</Link> and compare the{' '}
        <Link to="/low-budget-electric-scooters-berhampore">low budget electric scooters</Link> we stock.
      </p>
    </SeoLandingLayout>
  );
}
