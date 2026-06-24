import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Section, SectionHeading } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import { Hero } from '@/components/sections/Hero';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
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
import { getScooters, getFeaturedScooters } from '@/features/scooters/scooterService';
import { getScooterInsights } from '@/features/analytics/popularityService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { SITE, SITE_URL } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { openingHoursSchema } from '@/lib/schemaHelpers';

/** Decorative gradient divider between sections */
function GradientDivider({ flip = false }) {
  return (
    <div className={`h-px w-full bg-gradient-to-r from-transparent via-brand-200 to-transparent opacity-70 ${flip ? 'via-accent-200' : ''}`} />
  );
}

export default function Home() {
  const { site } = useSite();
  const localBusinessSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': `${SITE_URL}/#dealership`,
    name: SITE.name,
    url: SITE_URL,
    image: `${SITE_URL}/logo-512.png`,
    description: SITE.description,
    telephone: site.phones.map((p) => `+91${p}`),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.line,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.pincode,
      addressCountry: 'IN',
    },
    openingHoursSpecification: openingHoursSchema(site.hoursPerDay),
    slogan: SITE.tagline,
    areaServed: `${site.address.city}, ${site.address.state}`,
    priceRange: '₹₹',
  }), [site]);
  const { data: featured, loading } = useAsync(() => getFeaturedScooters(3), []);
  const { data: allScooters } = useAsync(() => getScooters(), []);
  const { settings: financeSettings } = useFinance();
  const { data: reviews, loading: reviewsLoading } = useAsync(() => getApprovedReviews(), []);
  const { data: insights } = useAsync(
    () => (allScooters?.length ? getScooterInsights(allScooters) : Promise.resolve(null)),
    [allScooters?.length],
  );
  const reviewAvg = reviews?.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <SEO
        path="/"
        description={`${SITE.description} Visit our ${site.address.city} showroom or book a test ride.`}
        jsonLd={localBusinessSchema}
      />

      <Hero heroImageUrl={financeSettings?.heroImageUrl} />

      <PromotionalOffers />

      <GradientDivider />
      <WhyChooseUs />

      <GradientDivider flip />
      <PremiumPerks />

      {/* ── Featured Scooters ── */}
      <GradientDivider />
      <Section id="featured" className="relative overflow-hidden">
        {/* subtle bg */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent" />

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Featured"
            title="Scooters built to impress"
            subtitle="Hand-picked models loved by our riders."
          />
          <Reveal>
            <Button to="/scooters" variant="secondary" iconRight={ArrowRight} className="hidden sm:inline-flex">
              View all
            </Button>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <ScooterCardSkeleton key={i} />)
            : featured?.map((s, i) => <ScooterCardWithInsights key={s.id} scooter={s} index={i} insights={insights} />)}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button to="/scooters" variant="secondary" fullWidth iconRight={ArrowRight}>
            View all scooters
          </Button>
        </div>
      </Section>

      <GradientDivider flip />

      {/* ── EV Simulator ── */}
      <Section id="simulator" tight className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[480px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-emerald-100/30 blur-3xl" />
        </div>

        <SectionHeading
          eyebrow="Petrol costs more — every single km"
          title="See What You'd Save by Going Electric"
          subtitle="Pick your scooter, set your daily travel — your yearly savings show up instantly."
          className="[&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:sm:text-[2.25rem] [&_p]:mt-3 [&_p]:max-w-lg [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-slate-600 [&_p]:sm:mx-auto [&_p]:sm:text-base [&_span]:border-emerald-200/60 [&_span]:bg-emerald-50/80 [&_span]:text-emerald-800 [&_span]:shadow-sm"
        />

        <Reveal className="mt-6 sm:mt-10" y={20}>
          <EVSimulator scooters={allScooters || []} settings={financeSettings} />
        </Reveal>
      </Section>

      {/* ── Reviews ── */}
      <GradientDivider flip />
      <Section id="reviews" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-surface-alt/80 to-transparent" />
          <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-amber-100/25 blur-3xl" />
        </div>

        <SectionHeading
          eyebrow="Customer Reviews"
          title="Loved by riders like you"
          subtitle="Real stories from verified buyers across Berhampore."
        />

        {!reviewsLoading && reviewAvg && (
          <Reveal className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-2.5 ring-1 ring-amber-200 shadow-soft">
              <Stars value={Number(reviewAvg)} size={18} />
              <span className="font-display text-lg font-extrabold text-heading">{reviewAvg}</span>
              <span className="text-sm text-muted">· {reviews.length} reviews</span>
            </div>
          </Reveal>
        )}

        <div className="mt-8">
          {reviewsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
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

      {/* ── Callback ── */}
      <GradientDivider />
      <Section id="callback">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          {/* Premium gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D4ED8] via-[#0891B2] to-[#0D9488]" />
          {/* Mesh overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Orb glows */}
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <Reveal className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/20">
                <PhoneCall className="h-3.5 w-3.5" /> Free Callback
              </span>
              <h2 className="mt-4 font-display text-display-md font-extrabold text-white">
                Want Us To Call You?
              </h2>
              <p className="mt-3 max-w-md text-white/85 leading-relaxed">
                Leave your number and our team will call you back to answer questions, share offers,
                and help you pick the perfect ride.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-white/90">
                {[
                  'Personalised model recommendations',
                  'EMI & finance guidance',
                  'Test ride scheduling',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Sparkles className="h-3 w-3 text-white" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="glass rounded-2xl p-6 shadow-card sm:p-8">
                <h3 className="mb-4 font-display text-lg font-bold text-heading">
                  Request your callback
                </h3>
                <CallbackForm />
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
