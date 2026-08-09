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
      className={`h-px w-full bg-gradient-to-r from-transparent via-brand-200 to-transparent opacity-70 ${flip ? 'via-sky-300' : ''}`}
    />
  );
}

const HOME_GUIDES = [
  {
    title: 'Best Electric Scooters in Berhampore Under ₹50,000',
    blurb:
      'Low-speed EVs with no licence paperwork, honest pricing, and free test rides at Chunakhali Bus Stand.',
    to: '/best-electric-scooters-berhampore',
    cta: 'Learn more',
  },
  {
    title: 'Popular Models: Activa, Zoom, Single Light & Double Light',
    blurb:
      'Four hero models for every budget — compare range, feel, and price before your showroom visit.',
    to: '/scooters',
    cta: 'Learn more',
  },
  {
    title: 'No Licence / No Registration Models',
    blurb:
      'Eligible ≤25 km/h scooters mean no driving licence and no RTO registration for most buyers in West Bengal.',
    to: '/no-licence-electric-scooters-west-bengal',
    cta: 'Learn more',
  },
  {
    title: 'Custom Battery Upgrades & Spare Parts',
    blurb:
      'Extra range packs plus genuine batteries, tyres, panels, and controllers at the Berhampore showroom.',
    to: '/battery-upgrade-berhampore',
    cta: 'Learn more',
  },
  {
    title: 'Visit Our Showroom — Chunakhali Bus Stand',
    blurb:
      'Walk in for a free test ride at Nimtala, Berhampore. Easy landmark, same-day model guidance.',
    to: '/contact',
    cta: 'Learn more',
  },
];

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
        hasMap: site.maps?.link || SITE.maps.link,
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
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
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

      <PremiumPerks />

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

      <PromotionalOffers />

      <GradientDivider />
      <Section id="models" tight>
        <SectionHeading
          eyebrow="In stock now"
          title="Popular models"
          subtitle="Activa, Zoom, Single Light & Double Light — pick one for a free test ride."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      <Section id="callback">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          <div className="absolute inset-0 bg-brand-gradient" />
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

      <GradientDivider flip />
      <Section id="reviews">
        <SectionHeading
          eyebrow="Customer Reviews"
          title="Loved by riders like you"
          subtitle="Real stories from buyers across Berhampore and Murshidabad."
        />
        {!reviewsLoading && reviewAvg && (
          <Reveal className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-brand-50 px-5 py-2.5 ring-1 ring-brand-200">
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
      <Section id="guides" tight className="bg-section-alt">
        <SectionHeading
          eyebrow="Local guides"
          title="Everything you need to know"
          subtitle="Short answers first — open a guide when you want the full detail."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_GUIDES.map((guide, i) => (
            <Reveal key={guide.to} delay={i * 0.04}>
              <article className="flex h-full flex-col rounded-2xl bg-surface p-5 ring-1 ring-line shadow-soft">
                <h3 className="font-display text-base font-extrabold leading-snug text-heading sm:text-lg">
                  {guide.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-body">{guide.blurb}</p>
                <Link
                  to={guide.to}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
                >
                  {guide.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 overflow-hidden rounded-2xl shadow-card ring-1 ring-line">
          <iframe
            src={site.maps.embed}
            title="Biswajit Power Hub location map — Chunakhali Bus Stand, Berhampore"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-40 w-full border-0 sm:h-48"
            allowFullScreen
          />
          <a
            href={site.maps.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'home-map-image' })}
            className="flex items-center justify-center gap-2 bg-surface-alt px-4 py-3 text-sm font-semibold text-[#4285f4] transition hover:bg-brand-50"
          >
            <MapPin className="h-4 w-4" /> Near Chunakhali Bus Stand — open in Google Maps
          </a>
        </Reveal>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <FaqSection faqs={SITE_FAQS} />
          <div className="mt-8">
            <ShowroomCtaRow from="home-faq" />
          </div>
        </div>
      </Section>
    </>
  );
}
