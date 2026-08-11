import { SITE } from '@/config/site';

/**
 * Local SEO about block — dealer wordplay density for Berhampore.
 */
export function SeoAboutBlock() {
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
            in Berhampore and Murshidabad.
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
      </div>
    </section>
  );
}
