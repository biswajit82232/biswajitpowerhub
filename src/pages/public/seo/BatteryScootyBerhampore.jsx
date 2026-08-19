import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { getPriorityLocations, SERVICE_LOCATIONS } from '@/data/locations';
import { breadcrumbList, faqPageSchema, postalAddressSchema } from '@/lib/schemaHelpers';
import { SITE, SITE_URL, GBP_NAP } from '@/config/site';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { SCOOTERS } from '@/data/scooters';
import { formatCatalogFromPrice } from '@/lib/catalogCopy';

const path = '/battery-scooty-berhampore';

const BATTERY_SCOOTY_FAQS = [
  {
    question: 'Where can I buy a battery scooty in Berhampore?',
    answer: `${SITE.name} at ${GBP_NAP.address} is a walk-in battery scooty / e-scooty showroom. Call ${GBP_NAP.phoneDisplay} or search BISWAJIT POWER HUB on Google Maps.`,
    bnQuestion: 'বহরমপুরে ব্যাটারি স্কুটি কোথায় পাওয়া যায়?',
    bnAnswer: `${SITE.name}, ${GBP_NAP.address} — ওয়াক-ইন ব্যাটারি স্কুটি শোরুম। কল ${GBP_NAP.phoneDisplay} অথবা গুগল ম্যাপে BISWAJIT POWER HUB খুঁজুন।`,
  },
  {
    question: 'Is a battery scooty the same as an electric scooter?',
    answer:
      'Yes. In Berhampore and Murshidabad people usually say battery scooty or e-scooty; we sell low-speed electric scooters — Activa, Zoom, Single Light, and Double Light — with home charging and no petrol.',
    bnQuestion: 'ব্যাটারি স্কুটি আর ইলেকট্রিক স্কুটার কি একই?',
    bnAnswer:
      'হ্যাঁ। বহরমপুর ও মুর্শিদাবাদে সাধারণত ব্যাটারি স্কুটি বা ই-স্কুটি বলা হয়। আমরা লো-স্পিড ইলেকট্রিক স্কুটার বিক্রি করি — Activa, Zoom, Single Light ও Double Light — ঘরে চার্জ, পেট্রোল নেই।',
  },
  {
    question: 'Do I need a licence for a battery scooty in West Bengal?',
    answer:
      'Eligible low-speed models (≤25 km/h) generally need no driving licence and no RTO registration. Confirm the exact class at our Chunakhali showroom before you buy.',
    bnQuestion: 'পশ্চিমবঙ্গে ব্যাটারি স্কুটিতে লাইসেন্স লাগে?',
    bnAnswer:
      'যোগ্য লো-স্পিড মডেলে (≤২৫ কিমি/ঘণ্টা) সাধারণত ড্রাইভিং লাইসেন্স ও RTO রেজিস্ট্রেশন লাগে না। কেনার আগে চুনাখালি শোরুমে ক্লাস নিশ্চিত করুন।',
  },
  {
    question: 'Can I test ride a battery scooty near Chunakhali today?',
    answer:
      'Yes — free supervised test rides during showroom hours, no appointment required. Bring a friend if you like; we never rush the decision.',
    bnQuestion: 'চুনাখালির কাছে আজই ব্যাটারি স্কুটি টেস্ট রাইড করা যায়?',
    bnAnswer:
      'হ্যাঁ — শোরুমের সময় ফ্রি সুপারভাইজড টেস্ট রাইড, অ্যাপয়েন্টমেন্ট লাগে না। সিদ্ধান্তে তাড়াহুড়ো করা হয় না।',
  },
];

export default function BatteryScootyBerhampore() {
  const priority = getPriorityLocations();
  const { data: scooters } = useAsync(() => getScooters(), []);
  const fromPrice = formatCatalogFromPrice(scooters?.length ? scooters : SCOOTERS);

  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Battery Scooty Berhampore', path },
      ]),
      faqPageSchema(BATTERY_SCOOTY_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Battery Scooty in Berhampore',
        url: `${SITE_URL}${path}`,
        description:
          'Buy a battery scooty (e-scooty) in Berhampore at Biswajit Power Hub, Chunakhali Bus Stand.',
        about: {
          '@type': 'LocalBusiness',
          '@id': `${SITE_URL}/#dealership`,
          name: SITE.name,
          telephone: `+91${SITE.phones[0]}`,
          image: `${SITE_URL}/logo-512.png`,
          address: postalAddressSchema(SITE.address),
          geo: {
            '@type': 'GeoCoordinates',
            latitude: SITE.geo.latitude,
            longitude: SITE.geo.longitude,
          },
          hasMap: SITE.maps.link,
          areaServed: SERVICE_LOCATIONS.map((l) => l.name),
        },
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title={`Battery Scooty in Berhampore | E-Scooty Showroom${fromPrice ? ` From ${fromPrice}` : ''}`}
      description={`Battery scooty / e-scooty showroom in Berhampore at Chunakhali Bus Stand${fromPrice ? ` — from ${fromPrice}` : ''}. No licence models, free test ride, EMI. Call 096355 05436.`}
      path={path}
      h1={`Battery Scooty in Berhampore — Local E-Scooty Showroom at Chunakhali${fromPrice ? ` (From ${fromPrice})` : ''}`}
      intro="Searching battery scooty, e-scooty, or battery wali scooty near Berhampore? This page is for that local search — a real walk-in showroom at Chunakhali Bus Stand, not an online-only listing."
      breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Battery Scooty Berhampore' }]}
      jsonLd={jsonLd}
      faqs={BATTERY_SCOOTY_FAQS}
    >
      <h2>Battery scooty showroom in Berhampore</h2>
      <p>
        In Murshidabad, most families search <strong>battery scooty</strong> or <strong>e-scooty</strong>{' '}
        — not “electric scooter”. {SITE.name} stocks low-speed battery scooties you can sit on, charge at
        home, and ride around Berhampore town without petrol. Eligible models need no licence and no RTO
        registration.
      </p>
      <ul>
        <li>Showroom: {GBP_NAP.address}</li>
        <li>Phone / WhatsApp: {GBP_NAP.phoneDisplay}</li>
        <li>Hours: {GBP_NAP.hoursSummary}</li>
        {fromPrice ? <li>Starting price today: {fromPrice} (confirm at the counter)</li> : null}
      </ul>

      <h2>Battery scooty models on the floor</h2>
      <p>
        Compare{' '}
        <Link to="/scooters/activa">Activa</Link>, <Link to="/scooters/zoom">Zoom</Link>,{' '}
        <Link to="/scooters/single-light">Single Light</Link>, and{' '}
        <Link to="/scooters/double-light">Double Light</Link> — all battery-powered, home-charge scooties.
        See live specs on the{' '}
        <Link to="/scooters">scooters catalogue</Link> or the{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> comparison.
      </p>
      <ul>
        <li>No petrol — plug in at home after school, market, or office trips</li>
        <li>No licence on eligible ≤25 km/h models</li>
        <li>EMI guidance at the Chunakhali finance desk</li>
        <li>3 free servicing visits with eligible purchases</li>
      </ul>

      <h2>Battery scooty near me vs battery upgrade</h2>
      <p>
        Buying a <strong>new battery scooty</strong> is this page. If you already own an e-scooty and want
        extra kilometres, use our{' '}
        <Link to="/battery-upgrade-berhampore">battery upgrade in Berhampore</Link> service instead — higher
        AH packs fitted at the same showroom.
      </p>
      <p>
        Need directions? Start with{' '}
        <Link to="/electric-scooter-near-me-berhampore">electric scooter near me Berhampore</Link>, then walk
        in for a <Link to="/test-ride-berhampore">free test ride</Link>. Budget shoppers can also check{' '}
        <Link to="/low-budget-electric-scooters-berhampore">low budget options</Link>.
      </p>

      <h2>Also serving nearby Murshidabad towns</h2>
      <p>
        Riders visit from across the district for a battery scooty they can try before paying. Full list on{' '}
        <Link to="/areas-we-serve">Areas we serve</Link>:
      </p>
      <ul>
        {priority.map((town) => (
          <li key={town.slug}>
            <Link to={town.path}>Battery scooty / electric scooters for {town.name}</Link>
          </li>
        ))}
      </ul>
    </SeoLandingLayout>
  );
}
