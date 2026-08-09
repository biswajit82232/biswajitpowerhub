import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';
import { DEFAULT_HOURS_SUMMARY } from '@/features/site/siteHours';

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
      <h2>Increase Your Scooter&apos;s Range</h2>
      <p>
        Increase your scooter&apos;s range with a custom battery upgrade at Biswajit Power Hub in
        Berhampore. Many Murshidabad riders love their low-speed e-scooter but wish one charge covered
        Berhampore–Kandi or longer market days. A higher ampere-hour (AH) pack — or stepping up to Lithium
        Pro on eligible models — stretches kilometres between plugs so you keep the chassis you already
        trust instead of buying brand new.
      </p>
      <p>
        Typical stock range on our models sits around 60–80 km depending on load, road, and riding style.
        After an upgrade, customers often report noticeably longer daily usefulness for school, shop, and
        office routes across Murshidabad. WhatsApp 096355 05436 with your scooter make and current AH for
        a quick estimate, or walk into Chunakhali Bus Stand for an on-the-spot assessment.
      </p>
      <ul>
        <li>Higher AH options matched to your daily kilometres</li>
        <li>Genuine batteries and connectors fitted at the showroom</li>
        <li>Advice on Standard vs Lithium Pro when buying new</li>
        <li>Spare parts: tyres, panels, mirrors, controllers</li>
      </ul>

      <h2>Battery Upgrade Process</h2>
      <p>
        Our battery upgrade process is straightforward. Bring your e-scooter to Biswajit Power Hub near
        Chunakhali Bus Stand, Berhampore. We inspect the controller, connectors, and chassis, recommend a
        compatible pack, share clear pricing, and schedule fitment — usually the same visit when parts are
        in stock. Hours: {DEFAULT_HOURS_SUMMARY}.
      </p>
      <p>
        If your scooter is ageing overall, compare our{' '}
        <Link to="/scooters">electric scooters</Link> — including{' '}
        <Link to="/scooters/activa">Activa</Link> and <Link to="/scooters/zoom">Zoom</Link> Lithium Pro
        options — then decide with our team. Pair upgrades with a{' '}
        <Link to="/test-ride-berhampore">test ride</Link> if you are switching models, or browse{' '}
        <Link to="/scooters">all electric scooters</Link> and{' '}
        <Link to="/accessories">spare parts</Link> at Chunakhali.
      </p>
    </SeoLandingLayout>
  );
}
