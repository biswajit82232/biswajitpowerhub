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

const PAGE_SIZE = 10;

export default function Reviews() {
  const { data: reviews, loading } = useAsync(() => getApprovedReviews(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const avg = useMemo(() => {
    if (!reviews?.length) return 0;
    return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  }, [reviews]);

  const visibleReviews = useMemo(
    () => (reviews || []).slice(0, visibleCount),
    [reviews, visibleCount]
  );

  const hasMore = (reviews?.length || 0) > visibleCount;
  const remaining = Math.max(0, (reviews?.length || 0) - visibleCount);

  const reviewSchema = reviews?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'BISWAJIT POWER HUB',
        description: 'Electric scooter dealership in Berhampore, West Bengal',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avg.toFixed(1),
          bestRating: '5',
          worstRating: '1',
          reviewCount: reviews.length,
        },
        review: reviews.slice(0, 5).map((r) => ({
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
            ? { itemReviewed: { '@type': 'Product', name: r.scooter } }
            : {}),
        })),
      }
    : null;

  return (
    <>
      <SEO title="Customer Reviews" description="Read genuine reviews from BISWAJIT POWER HUB electric scooter owners." path="/reviews" jsonLd={reviewSchema} />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-12 sm:py-16">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Reviews
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">What our riders say</h1>
            {reviews?.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <Stars value={avg} size={22} />
                <span className="font-display text-xl font-extrabold text-heading">{avg.toFixed(1)}</span>
                <span className="text-sm text-muted">from {reviews.length} reviews</span>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <div className="container-px py-12">
        {/* Form first — no sticky sidebar, avoids scroll overlap with long review lists */}
        <Reveal className="mx-auto max-w-xl">
          <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-7">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
              <PenLine className="h-5 w-5 text-brand-500" /> Write a review
            </h2>
            <p className="mt-1 text-sm text-muted">Help others choose with confidence.</p>
            <div className="mt-5">
              <ReviewForm scooters={scooters || []} />
            </div>
          </div>
        </Reveal>

        <div className="mt-12 sm:mt-14">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : reviews?.length === 0 ? (
            <EmptyState icon={Star} title="No reviews yet" description="Be the first to share your experience above!" />
          ) : (
            <>
              <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleReviews.map((r) => (
                  <RevealItem key={r.id}>
                    <ReviewCard review={r} className="h-full" />
                  </RevealItem>
                ))}
              </RevealGroup>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={ChevronDown}
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  >
                    Load more reviews ({remaining} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
