import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';
import { DEFAULT_HOURS_SUMMARY } from '@/features/site/siteHours';

export default function TestRide() {
  const path = '/test-ride-berhampore';
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Test Ride Berhampore', path },
      ]),
      faqPageSchema(SITE_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Free Electric Scooter Test Ride in Berhampore',
        provider: { '@type': 'LocalBusiness', name: 'Biswajit Power Hub' },
        areaServed: 'Berhampore, Murshidabad',
        url: `${SITE_URL}${path}`,
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title="Free Test Ride Electric Scooter in Berhampore | Book Today"
      description="Free electric scooter test rides in Berhampore. No appointment needed at Biswajit Power Hub, Chunakhali. No licence models. Call 096355 05436."
      path={path}
      h1="Free Test Ride Electric Scooter in Berhampore — Book Today"
      intro="Feel the ride before you buy. Free test rides are available at Biswajit Power Hub, Chunakhali Bus Stand, Berhampore — no appointment needed for low-speed, no-licence models."
      breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Test Ride' }]}
      jsonLd={jsonLd}
    >
      <h2>How to Book a Free Test Ride</h2>
      <p>
        How to book a free test ride in Berhampore: simply walk into Biswajit Power Hub at Chunakhali Bus
        Stand ({DEFAULT_HOURS_SUMMARY}). No appointment is required for
        our low-speed models. Prefer a heads-up? Call or WhatsApp 096355 05436 and tell us which scooter
        you want to try — <Link to="/scooters/activa">Activa</Link>,{' '}
        <Link to="/scooters/zoom">Zoom</Link>, <Link to="/scooters/double-light">Double Light</Link>, or{' '}
        <Link to="/scooters/single-light">Single Light</Link> — so we can keep that colour ready when stock
        allows.
      </p>
      <ul>
        <li>Bring your phone number for EMI follow-up if you like the ride</li>
        <li>A driving licence is <strong>not</strong> required for our low-speed models</li>
        <li>Wear closed footwear; rides are short and supervised near the showroom</li>
        <li>
          Ask about <Link to="/accessories">genuine spare parts</Link> and{' '}
          <Link to="/battery-upgrade-berhampore">battery upgrades</Link> after the ride
        </li>
      </ul>
      <p>
        Customers across Murshidabad appreciate that we never rush the decision — sit on multiple models,
        ask battery questions, and leave with clear numbers.
      </p>

      <h2>What to Expect at Our Showroom</h2>
      <p>
        What to expect at our showroom: a friendly walkthrough of no-licence rules in West Bengal, side-by-side
        comparison of Activa, Zoom, Single Light, and Double Light, and a supervised ride on safe nearby
        roads around Chunakhali when weather and traffic allow. Address: Chunakhali Bus Stand, Nimtala,
        Berhampore, Murshidabad, West Bengal 742149 — easy landmark for anyone travelling across the
        district.
      </p>
      <p>
        After the ride we can discuss EMI,{' '}
        <Link to="/battery-upgrade-berhampore">battery upgrades</Link>, and today’s on-road price. Browse
        the <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link>{' '}
        guide before you visit so you already know which two models to shortlist.
      </p>
    </SeoLandingLayout>
  );
}
