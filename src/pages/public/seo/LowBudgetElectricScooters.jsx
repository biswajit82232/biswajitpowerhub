import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { SITE_FAQS } from '@/data/seoContent';
import { breadcrumbList, faqPageSchema } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';

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
      intro="Need a cheap electric scooter in Berhampore without compromising safety or showroom support? Biswajit Power Hub stocks low-budget, no-licence models starting at ₹38,999 — with EMI and exchange options."
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'Low Budget Electric Scooters' },
      ]}
      jsonLd={jsonLd}
    >
      <h2>Cheapest electric scooter in Berhampore: Single Light</h2>
      <p>
        The <Link to="/scooters/single-light">Single Light electric scooter in Berhampore</Link> is our
        lowest-priced model at approximately ₹38,999. It is ideal for school drops, market runs, and short
        Murshidabad town hops. Like all our low-speed EVs, it needs no driving licence and no RTO
        registration — so your total cost stays close to the showroom price.
      </p>
      <p>
        Next up: <Link to="/scooters/double-light">Double Light</Link> (~₹40,999) for extra comfort,{' '}
        <Link to="/scooters/zoom">Zoom</Link> (~₹42,999) for premium pickup, and{' '}
        <Link to="/scooters/activa">Activa</Link> (~₹45,999) for longer range. All four stay under ₹50,000
        on the Standard battery — true low-budget electric scooters for Berhampore families.
      </p>

      <h2>Cost vs petrol scooter — what you save</h2>
      <p>
        Petrol scooters in Murshidabad often cost ₹150–₹300+ per week in fuel for daily city use. Our
        electric scooters typically run at about ₹0.30–₹0.50 per km with home charging. Example: 30 km/day
        ≈ ₹270–₹450 per month in electricity versus ₹2,000+ in petrol for many riders. Over a year, that
        savings often pays for a large part of your EMI.
      </p>

      <h2>EMI &amp; exchange on cheap e-scooters</h2>
      <p>
        Financing is available on all models — ask at the counter for current EMI slabs. We also accept{' '}
        <Link to="/exchange-old-scooter-berhampore">exchange of old petrol or electric scooters</Link> for
        a free valuation at Chunakhali. Pair a low budget model with exchange credit and many customers
        drive out with minimal cash down.
      </p>
      <p>
        Visit Biswajit Power Hub in Berhampore Monday–Saturday 9 AM–8 PM, or call 096355 05436 / WhatsApp
        for today’s stock and EMI options. See also our guide to the{' '}
        <Link to="/best-electric-scooters-berhampore">best electric scooters in Berhampore</Link>.
      </p>
    </SeoLandingLayout>
  );
}
