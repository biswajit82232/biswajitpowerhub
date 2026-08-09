import { useMemo, useState } from 'react';
import { Star, PenLine, ChevronDown } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal, RevealGroup, RevealItem } from '@/components/common/Reveal';
import { Stars } from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import { ReviewCard } from '@/features/reviews/ReviewCard';
import { ReviewForm } from '@/features/reviews/ReviewForm';
import { ReviewCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsync } from '@/hooks/useAsync';
import { getApprovedReviews } from '@/features/reviews/reviewService';
import { getScooters } from '@/features/scooters/scooterService';
import { breadcrumbList, buildReviewedProductRef } from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { SITE_URL, GBP_RATING } from '@/config/site';
import { REVIEWS as SEED_REVIEWS } from '@/data/reviews';

const PAGE_SIZE = 10;

export default function Reviews() {
  const { data: reviews, loading } = useAsync(() => getApprovedReviews(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const displayReviews = useMemo(() => {
    if (reviews?.length) return reviews;
    return SEED_REVIEWS.filter((r) => r.status === 'approved');
  }, [reviews]);

  const avg = useMemo(() => {
    if (!displayReviews?.length) return GBP_RATING.ratingValue;
    return displayReviews.reduce((a, r) => a + r.rating, 0) / displayReviews.length;
  }, [displayReviews]);

  const visibleReviews = useMemo(
    () => (displayReviews || []).slice(0, visibleCount),
    [displayReviews, visibleCount],
  );

  const hasMore = (displayReviews?.length || 0) > visibleCount;
  const remaining = Math.max(0, (displayReviews?.length || 0) - visibleCount);

  const reviewSchemas = useMemo(() => {
    const crumbs = breadcrumbList([
      { name: 'Home', path: '/' },
      { name: 'Reviews', path: '/reviews' },
    ]);
    const scooterByName = new Map(
      (scooters || []).map((s) => [String(s.name).toLowerCase(), s]),
    );
    const list = displayReviews || [];
    const ratingValue = list.length ? avg.toFixed(1) : String(GBP_RATING.ratingValue);
    const reviewCount = list.length ? String(list.length) : String(GBP_RATING.reviewCount);

    return [
      crumbs,
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Biswajit Power Hub',
        url: SITE_URL,
        logo: `${SITE_URL}/logo-512.png`,
        image: `${SITE_URL}/logo-512.png`,
        description: 'Electric scooter dealership in Berhampore, Murshidabad, West Bengal',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue,
          bestRating: '5',
          worstRating: '1',
          reviewCount,
        },
        ...(list.length
          ? {
              review: list.slice(0, 5).map((r) => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: r.name },
                datePublished: r.created_at || undefined,
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: String(r.rating),
                  bestRating: '5',
                  worstRating: '1',
                },
                reviewBody: r.review,
                ...(r.scooter
                  ? (() => {
                      const reviewed = buildReviewedProductRef(
                        scooterByName.get(String(r.scooter).toLowerCase()),
                      );
                      return reviewed ? { itemReviewed: reviewed } : {};
                    })()
                  : {}),
              })),
            }
          : {}),
      },
    ];
  }, [displayReviews, avg, scooters]);

  return (
    <>
      <SEO
        title="Customer Reviews — Biswajit Power Hub, Berhampore"
        description="Customer reviews of Biswajit Power Hub electric scooters in Berhampore, Murshidabad. Leave a Google review after your visit."
        path="/reviews"
        jsonLd={reviewSchemas}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-surface-alt">
        <div className="container-px py-12 sm:py-16">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Reviews' }]} />
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 ring-1 ring-brand-100">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Reviews
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">
              Customer Reviews — Biswajit Power Hub, Berhampore
            </h1>
            <p className="mt-3 max-w-2xl text-body">
              Real stories from riders across Berhampore and Murshidabad who chose Activa, Zoom, Single
              Light, or Double Light at our Chunakhali showroom — no licence models, honest pricing, and
              walk-in support.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Stars value={Number(avg)} size={22} />
              <span className="font-display text-xl font-extrabold text-heading">
                {Number(avg).toFixed(1)}
              </span>
              <span className="text-sm text-muted">
                from {displayReviews?.length || GBP_RATING.reviewCount} reviews
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12">
        <h2 className="border-b border-line pb-3 font-display text-2xl font-extrabold text-heading">
          What Our Customers Say
        </h2>
        <p className="mt-4 max-w-3xl text-body">
          From first-time EV buyers in Berhampore town to longer Murshidabad commuters, customers praise
          free test rides, clear EMI guidance, battery upgrade options, and the convenience of a showroom
          right at Chunakhali Bus Stand. Below are detailed testimonials — star ratings, model purchased,
          and neighbourhood — so you can decide with confidence before your visit.
        </p>

        <div className="mt-8">
          {loading && !displayReviews?.length ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : !displayReviews?.length ? (
            <EmptyState icon={Star} title="No reviews yet" description="Be the first to share your experience below!" />
          ) : (
            <>
              <RevealGroup className="grid gap-6 sm:grid-cols-2">
                {visibleReviews.map((r) => (
                  <RevealItem key={r.id}>
                    <ReviewCard review={r} className="h-full rounded-xl shadow-soft" />
                  </RevealItem>
                ))}
              </RevealGroup>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={ChevronDown}
                    className="min-h-12"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  >
                    Load more reviews ({remaining} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <Reveal className="mx-auto mt-14 max-w-xl">
          <h2 className="border-b border-line pb-3 font-display text-2xl font-extrabold text-heading">
            Leave Us a Review
          </h2>
          <div className="mt-6 rounded-xl bg-brand-50 p-5 ring-1 ring-brand-100 sm:p-6">
            <p className="text-sm text-body">
              Bought from our Chunakhali showroom? Your Google review helps other Berhampore and
              Murshidabad riders find Biswajit Power Hub.
            </p>
            <Button
              href="https://www.google.com/search?q=Biswajit+Power+Hub+Berhampore"
              variant="primary"
              className="mt-4 min-h-12"
              icon={Star}
            >
              Leave a Review on Google
            </Button>
          </div>
          <div className="mt-6 rounded-xl bg-white p-6 shadow-soft ring-1 ring-line sm:p-7">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
              <PenLine className="h-5 w-5 text-brand-600" /> Write a review on our site
            </h3>
            <p className="mt-1 text-sm text-muted">Help others choose with confidence.</p>
            <div className="mt-5">
              <ReviewForm scooters={scooters || []} />
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
