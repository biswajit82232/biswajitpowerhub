import { SEO } from '@/components/common/SEO';
import { Reveal, RevealGroup, RevealItem } from '@/components/common/Reveal';
import { DealerPageHero } from '@/components/common/DealerPageHero';
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
import { SITE_URL, GBP_RATING } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { REVIEWS as SEED_REVIEWS } from '@/data/reviews';
import { Star, PenLine, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

const PAGE_SIZE = 10;

export default function Reviews() {
  const { site } = useSite();
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

      <DealerPageHero
        eyebrow="Reviews"
        title="Customer Reviews"
        subtitle="Real stories from riders across Berhampore and Murshidabad who chose Activa, Zoom, Single Light, or Double Light at our Chunakhali showroom."
        breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Reviews' }]}
      >
        <div className="mt-4 flex items-center gap-3">
          <Stars value={Number(avg)} size={20} />
          <span className="font-display text-xl font-extrabold text-navy">
            {Number(avg).toFixed(1)}
          </span>
          <span className="text-sm text-muted">
            from {displayReviews?.length || GBP_RATING.reviewCount} reviews
          </span>
        </div>
      </DealerPageHero>

      <div className="container-px py-10 sm:py-12">
        <h2 className="dealer-section-title !text-left">What Our Customers Say</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-body sm:text-base">
          From first-time EV buyers in Berhampore town to longer Murshidabad commuters, customers praise
          free test rides, clear EMI guidance, battery upgrade options, and the convenience of a showroom
          right at Chunakhali Bus Stand.
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
                    <ReviewCard review={r} className="h-full" />
                  </RevealItem>
                ))}
              </RevealGroup>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="dealerSecondary"
                    size="md"
                    icon={ChevronDown}
                    className="min-h-12"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  >
                    Load More Reviews ({remaining} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <Reveal className="mx-auto mt-14 max-w-xl">
          <h2 className="dealer-section-title !text-left">Leave Us a Review</h2>
          <div className="mt-6 border border-line bg-surface-alt p-5 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-navy">Leave a Google Review</p>
            <p className="mt-1 text-sm text-body">
              Bought from our Chunakhali showroom? Your Google review helps other Berhampore and
              Murshidabad riders find Biswajit Power Hub.
            </p>
            <Button
              href={site.maps.reviewLink}
              variant="dealerPrimary"
              className="mt-4 min-h-12"
              icon={Star}
            >
              Leave a Review on Google
            </Button>
          </div>
          <div className="mt-6 border border-line bg-white p-6 shadow-soft sm:p-7">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-navy">
              <PenLine className="h-5 w-5 text-brand-500" /> Write a Review on Our Site
            </h3>
            <p className="mt-1 text-sm text-muted">
              Share your experience here too. Site reviews are held as{' '}
              <strong className="font-semibold text-navy">pending</strong> until our team approves them.
            </p>
            <div className="mt-5">
              <ReviewForm scooters={scooters || []} />
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
