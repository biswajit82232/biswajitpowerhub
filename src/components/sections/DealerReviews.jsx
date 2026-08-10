import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Stars } from '@/components/ui/StarRating';
import { ReviewCardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { SITE } from '@/config/site';

/**
 * Customer reviews — dealer prev/next carousel (3 cards on desktop).
 */
export function DealerReviews({ reviews = [], loading = false, avg }) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.max(1, Math.ceil((reviews?.length || 0) / perPage));
  const slice = (reviews || []).slice(page * perPage, page * perPage + perPage);

  const prev = () => setPage((p) => (p - 1 + pages) % pages);
  const next = () => setPage((p) => (p + 1) % pages);

  return (
    <section className="border-t border-line bg-surface-alt py-10 sm:py-14" aria-labelledby="reviews-heading">
      <div className="container-px">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 id="reviews-heading" className="dealer-section-title !text-left">
              Customer Reviews for {SITE.name}, Berhampore
            </h2>
            {avg && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-body">
                <Stars value={Number(avg)} size={16} />
                <span className="font-bold text-navy">{avg}</span>
                <span className="text-muted">· {reviews?.length || 0} reviews</span>
              </p>
            )}
          </div>
          {(reviews?.length || 0) > perPage && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-dealer border border-navy text-navy hover:bg-navy hover:text-white"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-dealer border border-navy text-navy hover:bg-navy hover:text-white"
                aria-label="Next reviews"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)
            : slice.map((r) => (
                <article
                  key={r.id || r.name + r.created_at}
                  className="border border-line bg-white p-5 shadow-soft"
                >
                  <Stars value={r.rating || 5} size={14} />
                  <h3 className="mt-3 font-display text-base font-bold text-navy">
                    {r.name || r.customer_name || 'Customer'}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-body line-clamp-5">
                    {r.review || r.comment || r.message}
                  </p>
                </article>
              ))}
        </div>

        <div className="mt-8 text-center">
          <Button to="/reviews" variant="dealerSecondary">
            Read All Reviews
          </Button>
        </div>
      </div>
    </section>
  );
}
