import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';

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
      <h2>No appointment needed</h2>
      <p>
        Walk into our showroom Monday–Saturday between 9:00 AM and 8:00 PM (Sunday closed). Tell us which
        model you want to try — <Link to="/scooters/activa">Activa</Link>,{' '}
        <Link to="/scooters/zoom">Zoom</Link>, <Link to="/scooters/double-light">Double Light</Link>, or{' '}
        <Link to="/scooters/single-light">Single Light</Link> — and we will arrange a supervised test ride
        around the Chunakhali area when stock and weather allow.
      </p>

      <h2>What to bring</h2>
      <ul>
        <li>Your phone number so we can follow up on EMI or exchange if you like the ride</li>
        <li>A driving licence is <strong>not</strong> required for our low-speed models</li>
        <li>Optional: your old scooter if you want an on-the-spot{' '}
          <Link to="/exchange-old-scooter-berhampore">exchange valuation</Link>
        </li>
      </ul>

      <h2>Safety &amp; showroom address</h2>
      <p>
        Rides are short, supervised, and limited to safe nearby roads. Wear closed footwear. Address:
        Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149. Call 096355 05436 or
        WhatsApp to confirm today’s available models. Browse the{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> before
        you visit.
      </p>
    </SeoLandingLayout>
  );
}
