import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  PhoneCall,
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Navigation,
} from 'lucide-react';
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
import { SITE, SITE_URL, GBP_RATING, whatsappUrl, telUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import {
  openingHoursSchema,
  postalAddressSchema,
  breadcrumbList,
  buildScooterOfferCatalogItems,
  faqPageSchema,
} from '@/lib/schemaHelpers';
import { SCOOTERS } from '@/data/scooters';
import { SITE_FAQS } from '@/data/seoContent';
import { FaqSection, ShowroomCtaRow } from '@/components/seo/SeoLandingLayout';
import { trackEvent, EVENT } from '@/lib/tracking';

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

      <Hero heroImageUrl={financeSettings?.heroImageUrl} />

      {/* 1. Product wall */}
      <Section id="models" tight>
        <SectionHeading
          eyebrow="In stock now"
          title="Popular models"
          subtitle="Activa, Zoom, Single Light & Double Light — pick one for a free test ride."
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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

      {/* Slim offers strip — not a second hero */}
      <PromotionalOffers />

      {/* 2. Quiet ownership perks */}
      <PremiumPerks />

      {/* 3. Savings calculator */}
      <Section id="simulator" tight className="relative overflow-hidden bg-section-alt">
        <SectionHeading
          eyebrow="Petrol costs more — every single km"
          title="See What You'd Save by Going Electric"
          subtitle="Pick your scooter, set your daily travel — your yearly savings show up instantly."
        />
        <Reveal className="mt-6 sm:mt-10" y={20}>
          <EVSimulator scooters={allScooters || []} settings={financeSettings} loading={scootersLoading} />
        </Reveal>
      </Section>

      {/* 4. Reviews */}
      <Section id="reviews">
        <SectionHeading
          eyebrow="Customer Reviews"
          title="Loved by riders like you"
          subtitle="Real stories from buyers across Berhampore and Murshidabad."
        />
        {!reviewsLoading && reviewAvg && (
          <Reveal className="mt-4 flex justify-center">
            <p className="inline-flex items-center gap-2.5 text-heading">
              <Stars value={Number(reviewAvg)} size={18} />
              <span className="font-display text-lg font-extrabold">{reviewAvg}</span>
              <span className="text-sm text-muted">
                · {reviews?.length || GBP_RATING.reviewCount} reviews
              </span>
            </p>
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

      {/* 5. Visit the showroom */}
      <Section id="visit" className="bg-section-alt">
        <SectionHeading
          eyebrow="Come see us"
          title="Visit the showroom"
          subtitle="Chunakhali Bus Stand, Nimtala — open every day for free test rides."
        />
        <Reveal className="mt-8 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
          <iframe
            src={site.maps.embed}
            title="Biswajit Power Hub location map — Chunakhali Bus Stand, Berhampore"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-52 w-full border-0 sm:h-64"
            allowFullScreen
          />
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div className="space-y-3 text-sm text-body">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{site.address.full}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-brand-600" />
                <span>{site.hours?.summary || 'Open all days 9:00 AM – 8:30 PM'}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button
                href={telUrl(undefined, site)}
                target="_self"
                variant="primary"
                icon={Phone}
                onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'home-visit' })}
              >
                Call {formatPhoneDisplay(site.phones[0]).replace('+91 ', '0')}
              </Button>
              <Button
                href={whatsappUrl(undefined, site)}
                variant="whatsapp"
                icon={MessageCircle}
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'home-visit' })}
              >
                WhatsApp
              </Button>
              <Button
                href={site.maps.link}
                variant="ghost"
                icon={Navigation}
                onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'home-visit' })}
              >
                Directions
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Callback after visit */}
      <Section id="callback">
        <div className="relative overflow-hidden rounded-2xl bg-brand-800">
          <div className="relative z-10 grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <Reveal className="text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200/90">
                <PhoneCall className="mr-1.5 inline h-3.5 w-3.5" /> Free Callback
              </p>
              <h2 className="mt-3 font-display text-display-md font-extrabold text-white">
                Want Us To Call You?
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-white/80">
                Leave your number — we will help with models, EMI, battery upgrades, and test rides at
                our Berhampore showroom.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/85">
                {['Model recommendations', 'EMI guidance', 'Battery upgrades', 'Test ride booking'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-xl bg-white p-6 sm:p-8">
                <h3 className="mb-4 font-display text-lg font-bold text-heading">Request your callback</h3>
                <CallbackForm />
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 6. Guides + FAQ (SEO, quieter) */}
      <Section id="guides" tight>
        <SectionHeading
          eyebrow="Local guides"
          title="Everything you need to know"
          subtitle="Short answers first — open a guide when you want the full detail."
        />
        <div className="mt-8 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_GUIDES.map((guide, i) => (
            <Reveal key={guide.to} delay={i * 0.04}>
              <article className="flex h-full flex-col">
                <h3 className="font-display text-base font-extrabold leading-snug text-heading sm:text-lg">
                  {guide.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-body">{guide.blurb}</p>
                <Link
                  to={guide.to}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
                >
                  {guide.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
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
