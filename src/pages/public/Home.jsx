import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Sparkles, MapPin } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Section, SectionHeading } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { Hero } from '@/components/sections/Hero';
import { PremiumPerks } from '@/components/sections/PremiumPerks';
import { PromotionalOffers } from '@/components/sections/PromotionalOffers';
import { ScooterCardWithInsights } from '@/features/scooters/ScooterCardWithInsights';
import { ScooterCardSkeleton, ReviewCardSkeleton } from '@/components/ui/Skeleton';
import { EVSimulator } from '@/features/simulator/EVSimulator';
import { ReviewsCarousel } from '@/features/reviews/ReviewsCarousel';
import { getApprovedReviews } from '@/features/reviews/reviewService';
import { Stars } from '@/components/ui/StarRating';
import { CallbackForm } from '@/features/leads/CallbackForm';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { getScooterInsights } from '@/features/analytics/popularityService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { SITE, SITE_URL, GBP_RATING } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import {
  openingHoursSchema,
  postalAddressSchema,
  breadcrumbList,
  buildScooterOfferCatalogItems,
  faqPageSchema,
} from '@/lib/schemaHelpers';
import { computeCatalogStats } from '@/lib/catalogStats';
import { SCOOTERS } from '@/data/scooters';
import { SITE_FAQS } from '@/data/seoContent';
import { FaqSection, ShowroomCtaRow } from '@/components/seo/SeoLandingLayout';
import { trackEvent, EVENT } from '@/lib/tracking';

function GradientDivider({ flip = false }) {
  return (
    <div
      className={`h-px w-full bg-gradient-to-r from-transparent via-brand-200 to-transparent opacity-70 ${flip ? 'via-accent-200' : ''}`}
    />
  );
}

export default function Home() {
  const { site } = useSite();
  const { data: allScooters, loading: scootersLoading } = useAsync(() => getScooters(), []);
  const homeSchemas = useMemo(() => {
    const catalogScooters = allScooters?.length ? allScooters : SCOOTERS;
    return [
      breadcrumbList([{ name: 'Home', path: '/' }]),
      {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'MotorcycleDealer', 'Store', 'AutoDealer'],
        '@id': `${SITE_URL}/#dealership`,
        name: SITE.name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-512.png`,
        image: [`${SITE_URL}/logo-512.png`, `${SITE_URL}/og-image.png`],
        description: SITE.description,
        telephone: `+91${site.phones[0]}`,
        priceRange: '₹₹',
        address: postalAddressSchema(site.address),
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SITE.geo.latitude,
          longitude: SITE.geo.longitude,
        },
        openingHoursSpecification: openingHoursSchema(site.hoursPerDay),
        sameAs: [SITE.social.instagram, SITE.social.facebook].filter(Boolean),
        slogan: SITE.tagline,
        areaServed: ['Berhampore', 'Murshidabad', 'West Bengal'],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: GBP_RATING.ratingValue,
          reviewCount: GBP_RATING.reviewCount,
          bestRating: GBP_RATING.bestRating,
          worstRating: GBP_RATING.worstRating,
        },
        ...(catalogScooters.length
          ? {
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Electric Scooters',
                itemListElement: buildScooterOfferCatalogItems(catalogScooters, site),
              },
            }
          : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-512.png`,
        sameAs: [SITE.social.instagram, SITE.social.facebook].filter(Boolean),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE_URL,
      },
      faqPageSchema(SITE_FAQS),
    ];
  }, [site, allScooters]);

  const modelGrid = useMemo(() => {
    const list = allScooters?.length ? allScooters : SCOOTERS;
    const order = ['activa', 'zoom', 'single-light', 'double-light'];
    return order.map((id) => list.find((s) => s.id === id)).filter(Boolean);
  }, [allScooters]);

  const { settings: financeSettings } = useFinance();
  const { data: reviews, loading: reviewsLoading } = useAsync(() => getApprovedReviews(), []);
  const { data: insights } = useAsync(
    () => (allScooters?.length ? getScooterInsights(allScooters) : Promise.resolve(null)),
    [allScooters?.length],
  );
  const catalogStats = useMemo(() => computeCatalogStats(allScooters || []), [allScooters]);
  const reviewAvg = reviews?.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : String(GBP_RATING.ratingValue);

  return (
    <>
      <SEO
        title="Best Electric Scooter Dealer Berhampore | Biswajit Power Hub"
        path="/"
        description="Biswajit Power Hub — best electric scooters in Berhampore, Murshidabad. No licence. From ₹38,999. Call 096355 05436 for test ride at Chunakhali."
        jsonLd={homeSchemas}
        titleTemplate={false}
      />

      <Hero heroImageUrl={financeSettings?.heroImageUrl} catalogStats={catalogStats} />

      <PromotionalOffers />
      <PremiumPerks />

      <Section id="models" className="relative overflow-hidden">
        <SectionHeading
          align="left"
          eyebrow="Our models"
          title="Electric scooters in Berhampore"
          subtitle="Activa, Zoom, Single Light & Double Light — no licence required."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {scootersLoading
            ? Array.from({ length: 4 }).map((_, i) => <ScooterCardSkeleton key={i} />)
            : modelGrid.map((s, i) => (
                <ScooterCardWithInsights key={s.id} scooter={s} index={i} insights={insights} />
              ))}
        </div>
        <div className="mt-8 text-center">
          <Button to="/scooters" variant="secondary" iconRight={ArrowRight}>
            View all scooters
          </Button>
        </div>
      </Section>

      <GradientDivider />
      <Section>
        <article className="mx-auto max-w-3xl space-y-10 text-body [&_a]:font-semibold [&_a]:text-brand-700 hover:[&_a]:underline [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-heading [&_p]:leading-relaxed">
          <Reveal>
            <h2>Best Electric Scooters in Berhampore Under ₹50,000</h2>
            <p>
              If you are comparing the best electric scooters in Berhampore, start with our four low-speed
              models at Biswajit Power Hub. The Activa (~₹45,999) suits longer Murshidabad trips, Zoom
              (~₹42,999) feels premium for daily commute, Double Light (~₹40,999) balances comfort and
              price, and Single Light (~₹38,999) is the budget pick. Every model is ≤25 km/h — no licence,
              no RTO registration — with home charging around ₹0.30–₹0.50 per km and 3 free servicing
              included. Visit Chunakhali Bus Stand to sit on each scooter and decide with zero pressure.
            </p>
            <p>
              <Link to="/best-electric-scooters-berhampore">
                See our full comparison of the best electric scooters in Berhampore
              </Link>
            </p>
          </Reveal>

          <Reveal>
            <h2>Low Budget Electric Scooters in Murshidabad — Starting from ₹38,999</h2>
            <p>
              Looking for a cheap electric scooter in Berhampore without cutting corners on warranty?
              Our low-budget line starts at ₹38,999. Pair EMI financing with an exchange offer on your old
              petrol scooter and many Murshidabad families switch to electric with minimal cash down.
              Running cost savings versus petrol often reach thousands of rupees per year for daily
              riders — charge overnight at home and skip fuel queues entirely.
            </p>
            <p>
              <Link to="/low-budget-electric-scooters-berhampore">
                Explore low budget electric scooters in Berhampore
              </Link>
            </p>
          </Reveal>

          <Reveal>
            <h2>No Licence Electric Scooters in West Bengal</h2>
            <p>
              Eligible low-speed electric scooters under 25 km/h can be ridden in West Bengal without a
              driving licence or RTO registration under Central Motor Vehicles rules for this category.
              All Biswajit Power Hub models in Berhampore are built for that use case — legal clarity,
              simple ownership, and showroom support in Murshidabad. We explain myths vs facts on our
              full guide so you buy with confidence.
            </p>
            <p>
              <Link to="/no-licence-electric-scooters-west-bengal">
                Read the no licence electric scooters West Bengal guide
              </Link>
            </p>
          </Reveal>

          <Reveal>
            <h2>Custom Battery Upgrades &amp; Genuine Spare Parts in Berhampore</h2>
            <p>
              Need more range for Berhampore–Kandi runs? We offer custom higher-AH battery upgrades and
              stock genuine batteries, tyres, panels, and controllers. Bring your e-scooter to Chunakhali
              for a fitment quote — often cheaper than buying a brand-new vehicle when the chassis is
              still strong.
            </p>
            <p>
              <Link to="/battery-upgrade-berhampore">Battery upgrade service in Berhampore</Link>
            </p>
          </Reveal>

          <Reveal>
            <h2>Visit Our Showroom — Chunakhali Bus Stand, Berhampore</h2>
            <p>
              Find us near Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149.
              Hours: Monday–Saturday 9:00 AM – 8:00 PM · Sunday Closed. Landmark: right at the bus stand —
              easy from anywhere in Murshidabad district. Call 096355 05436 or get directions below.
            </p>
            <a
              href={site.maps.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'home-map' })}
              className="not-prose mt-4 block overflow-hidden rounded-2xl ring-1 ring-line"
            >
              <img
                src={`https://maps.wikimedia.org/img/osm-intl,15,24.0987,88.2519,800x400.png`}
                alt="Map of Biswajit Power Hub near Chunakhali Bus Stand Berhampore"
                width={800}
                height={400}
                loading="lazy"
                className="h-48 w-full object-cover sm:h-56"
              />
              <span className="flex items-center justify-center gap-2 bg-surface-alt px-4 py-3 text-sm font-semibold text-brand-700">
                <MapPin className="h-4 w-4" /> Open in Google Maps
              </span>
            </a>
          </Reveal>
        </article>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <FaqSection faqs={SITE_FAQS} />
          <div className="mt-8">
            <ShowroomCtaRow from="home-faq" />
          </div>
        </div>
      </Section>

      <GradientDivider flip />
      <Section id="simulator" tight className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
        <SectionHeading
          eyebrow="Petrol costs more — every single km"
          title="See What You'd Save by Going Electric"
          subtitle="Pick your scooter, set your daily travel — your yearly savings show up instantly."
        />
        <Reveal className="mt-6 sm:mt-10" y={20}>
          <EVSimulator scooters={allScooters || []} settings={financeSettings} loading={scootersLoading} />
        </Reveal>
      </Section>

      <GradientDivider flip />
      <Section id="reviews">
        <SectionHeading
          eyebrow="Customer Reviews"
          title="Loved by riders like you"
          subtitle="Real stories from buyers across Berhampore and Murshidabad."
        />
        {!reviewsLoading && reviewAvg && (
          <Reveal className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-amber-50 px-5 py-2.5 ring-1 ring-amber-200">
              <Stars value={Number(reviewAvg)} size={18} />
              <span className="font-display text-lg font-extrabold text-heading">{reviewAvg}</span>
              <span className="text-sm text-muted">
                · {reviews?.length || GBP_RATING.reviewCount} reviews
              </span>
            </div>
          </Reveal>
        )}
        <div className="mt-8">
          {reviewsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <ReviewsCarousel reviews={reviews || []} />
          )}
        </div>
        <div className="mt-8 text-center">
          <Button to="/reviews" variant="ghost" iconRight={ArrowRight}>
            Read all reviews
          </Button>
        </div>
      </Section>

      <GradientDivider />
      <Section id="callback">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D4ED8] via-[#0891B2] to-[#0D9488]" />
          <div className="relative z-10 grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <Reveal className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <PhoneCall className="h-3.5 w-3.5" /> Free Callback
              </span>
              <h2 className="mt-4 font-display text-display-md font-extrabold text-white">
                Want Us To Call You?
              </h2>
              <p className="mt-3 max-w-md text-white/85 leading-relaxed">
                Leave your number — we will help with models, EMI, battery upgrades, and test rides at
                our Berhampore showroom.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-white/90">
                {['Model recommendations', 'EMI guidance', 'Battery upgrades', 'Test ride booking'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="glass rounded-2xl p-6 sm:p-8">
                <h3 className="mb-4 font-display text-lg font-bold text-heading">Request your callback</h3>
                <CallbackForm />
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
