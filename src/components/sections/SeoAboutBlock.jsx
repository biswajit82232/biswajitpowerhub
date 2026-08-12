import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { getPriorityLocations } from '@/data/locations';

/**
 * Local SEO about block — dealer wordplay density for Berhampore + hub links.
 */
export function SeoAboutBlock() {
  const towns = getPriorityLocations();

  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby="seo-about-heading">
      <div className="container-px max-w-4xl">
        <h2
          id="seo-about-heading"
          className="font-display text-xl font-bold uppercase leading-snug tracking-wide text-navy sm:text-2xl md:text-[28px]"
        >
          Electric Scooters — {SITE.name}, Chunakhali Bus Stand, Berhampore
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-body sm:text-base">
          <p>
            At {SITE.name}, Chunakhali Bus Stand, Nimtala, Berhampore, you can get a quote for the
            on-road price of your favourite low-speed electric scooters. Explore easy finance and
            EMI options while checking offers and discounts available for buying electric scooters
            in Berhampore and Murshidabad.             Searching for an{' '}
            <Link to="/electric-scooter-near-me-berhampore" className="font-semibold text-brand-700 hover:underline">
              electric scooter near me in Berhampore
            </Link>
            ? Visit our physical showroom — we do not sell online-only. Compare models on{' '}
            <Link to="/best-electric-scooters-berhampore" className="font-semibold text-brand-700 hover:underline">
              best electric scooters in Berhampore
            </Link>
            {' '}or the{' '}
            <Link to="/electric-scooters-berhampore" className="font-semibold text-brand-700 hover:underline">
              Berhampore showroom hub
            </Link>
            .
          </p>
          <p>
            On this website you can look through specifications and features, compare models, access
            finance options, and enquire about service, battery upgrades, and genuine accessories.
            Popular models include Activa, Zoom, Single Light, and Double Light — many with no
            licence and no registration for eligible low-speed variants. Book a free test ride at
            our showroom and experience the ride yourself.
          </p>
          <p>
            Take home your new electric scooter today and experience helpful customer service and
            after-sales support from {SITE.name}, Berhampore, Murshidabad, West Bengal.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Serving Murshidabad</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {towns.map((t) => (
              <li key={t.slug}>
                <Link
                  to={t.path}
                  className="inline-flex rounded-lg bg-surface-alt px-2.5 py-1.5 text-xs font-semibold text-heading ring-1 ring-line hover:bg-brand-50 hover:text-brand-700"
                >
                  {t.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/areas-we-serve"
                className="inline-flex rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 ring-1 ring-brand-100"
              >
                All areas →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
