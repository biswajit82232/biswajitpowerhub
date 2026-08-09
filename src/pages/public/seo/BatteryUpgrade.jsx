import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';

export default function BatteryUpgrade() {
  const path = '/battery-upgrade-berhampore';
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Battery Upgrade Berhampore', path },
      ]),
      faqPageSchema(SITE_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Electric Scooter Battery Upgrade in Berhampore',
        provider: { '@type': 'LocalBusiness', name: 'Biswajit Power Hub' },
        areaServed: 'Berhampore, Murshidabad, West Bengal',
        url: `${SITE_URL}${path}`,
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title="Electric Scooter Battery Upgrade in Berhampore | Extra Range"
      description="Custom battery upgrades for electric scooters in Berhampore. Increase your range at Biswajit Power Hub, Chunakhali. Call 096355 05436."
      path={path}
      h1="Electric Scooter Battery Upgrade in Berhampore — Extra Range"
      intro="Need more kilometres per charge? Biswajit Power Hub offers custom higher-AH battery upgrades and genuine spare batteries for electric scooters in Berhampore and Murshidabad."
      breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Battery Upgrade' }]}
      jsonLd={jsonLd}
    >
      <h2>What is a battery upgrade?</h2>
      <p>
        A battery upgrade replaces or modifies your e-scooter’s battery pack with a higher ampere-hour
        (AH) option so you travel farther between charges. At our Chunakhali showroom we assess your
        daily distance across Berhampore / Murshidabad, recommend a compatible pack, and fit it with
        proper connectors and safety checks. Pricing starts from affordable rates depending on AH and
        chemistry — WhatsApp 096355 05436 for a quote.
      </p>

      <h2>Upgrade vs buying a new scooter</h2>
      <p>
        If your current low-speed scooter still rides well but range is short, upgrading the battery is
        often cheaper than buying new. If you also want a fresher model, compare our{' '}
        <Link to="/scooters">electric scooters</Link> — including Lithium Pro variants on{' '}
        <Link to="/scooters/activa">Activa</Link> and <Link to="/scooters/zoom">Zoom</Link> — then decide
        with our team on the showroom floor.
      </p>

      <h2>Spare parts &amp; controllers</h2>
      <p>
        We stock batteries, tyres, body panels, mirrors, and controllers. Bring your scooter to Biswajit
        Power Hub near Chunakhali Bus Stand, Berhampore — Monday to Saturday 9 AM–8 PM (Sunday closed).
        Pair upgrades with a <Link to="/test-ride-berhampore">test ride</Link> if you are switching
        models, or explore <Link to="/exchange-old-scooter-berhampore">exchange offers</Link>.
      </p>
    </SeoLandingLayout>
  );
}
