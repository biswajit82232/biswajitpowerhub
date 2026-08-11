import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';
import { DEFAULT_HOURS_SUMMARY_SHORT } from '@/features/site/siteHours';

export default function LowBudgetElectricScooters() {
  const path = '/low-budget-electric-scooters-berhampore';
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Low Budget Electric Scooters', path },
      ]),
      faqPageSchema(SITE_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Low Budget Electric Scooters in Berhampore',
        url: `${SITE_URL}${path}`,
      },
    ],
    [],
  );

  return (
    <SeoLandingLayout
      title="Low Budget Electric Scooters Berhampore | From ₹38,999"
      description="Affordable electric scooters in Berhampore. Low budget, no licence models. EMI available. Visit Biswajit Power Hub, Chunakhali. Call 096355 05436."
      path={path}
      h1="Low Budget Electric Scooters in Berhampore & Murshidabad — Starting ₹38,999"
      intro="Need a cheap electric scooter in Berhampore without compromising safety or showroom support? Biswajit Power Hub stocks low-budget, no-licence models starting at ₹38,999 — with EMI options."
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'Low Budget Electric Scooters' },
      ]}
      jsonLd={jsonLd}
    >
      <h2>Most Affordable Electric Scooters in Murshidabad</h2>
      <p>
        The most affordable electric scooters in Murshidabad start at Biswajit Power Hub with the{' '}
        <Link to="/scooters/single-light">Single Light</Link> at approximately ₹38,999. It is ideal for
        school drops, market runs, and short Berhampore town hops. Like all our low-speed EVs, eligible
        units need no driving licence and no RTO registration — so your total cost stays close to the
        showroom price instead of disappearing into paperwork.
      </p>
      <p>
        Next up: <Link to="/scooters/double-light">Double Light</Link> (~₹40,999) for extra comfort,{' '}
        <Link to="/scooters/zoom">Zoom</Link> (~₹42,999) for premium pickup, and{' '}
        <Link to="/scooters/activa">Activa</Link> (~₹45,999) for longer range. All four stay under ₹50,000
        on the Standard battery — true low-budget electric scooters for Berhampore families who still want
        warranty, servicing, and a real showroom at Chunakhali Bus Stand.
      </p>
      <ul>
        <li>Entry price from ₹38,999 with no licence hassle on eligible models</li>
        <li>Home charging instead of weekly petrol bills across Murshidabad</li>
        <li>3 free servicing + 1 year motor &amp; controller warranty</li>
        <li>Walk-in support — we do not sell online-only</li>
      </ul>

      <h2>Save Money With Low Running Costs</h2>
      <p>
        Petrol scooters in Murshidabad often cost ₹150–₹300+ per week in fuel for daily city use. Our
        electric scooters typically run at about ₹0.30–₹0.50 per km with home charging. Example: 30 km/day
        ≈ ₹270–₹450 per month in electricity versus ₹2,000+ in petrol for many Berhampore riders. Over a
        year, that savings often covers a large part of your EMI — which is why low budget does not mean
        low value when you buy electric at Biswajit Power Hub.
      </p>
      <p>
        Compare full specs on our{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link> page, or
        use the savings simulator on the homepage after your visit. We also serve{' '}
        <Link to="/areas-we-serve">towns across Murshidabad</Link> — start with{' '}
        <Link to="/electric-scooter-near-me-berhampore">near me Berhampore</Link>,{' '}
        <Link to="/electric-scooters-beldanga">Beldanga</Link>, or{' '}
        <Link to="/electric-scooters-kandi">Kandi</Link>.
      </p>

      <h2>EMI Options Available</h2>
      <p>
        Financing is available on all models — ask at the counter for current EMI slabs. Many Berhampore
        and Murshidabad families choose a low monthly payment and keep cash free for battery accessories
        or a spare charger. Battery upgrades later keep the same chassis useful longer if your commute
        grows.
      </p>
      <p>
        Visit Biswajit Power Hub in Berhampore ({DEFAULT_HOURS_SUMMARY_SHORT}), or call 096355 05436 / WhatsApp
        for today’s stock and EMI options. Free{' '}
        <Link to="/test-ride-berhampore">test rides</Link> — no appointment needed. Browse{' '}
        <Link to="/accessories">spare parts &amp; accessories</Link> while you are here.
      </p>
    </SeoLandingLayout>
  );
}
