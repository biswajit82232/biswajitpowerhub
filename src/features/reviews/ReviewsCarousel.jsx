import { useEffect, useRef } from 'react';
import { ReviewCard } from './ReviewCard';

const SCROLL_SPEED = 0.75; // px per frame (~45px/s at 60fps)

/**
 * Seamless infinite horizontal marquee — continuous scroll, no controls.
 */
export function ReviewsCarousel({ reviews = [] }) {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const halfRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reviews.length === 0) return;

    const measure = () => {
      halfRef.current = track.scrollWidth / 2;
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let raf = 0;

    const tick = () => {
      if (!document.hidden) {
        if (halfRef.current <= 0) measure();
        const half = halfRef.current;
        if (half > 0) {
          offsetRef.current -= SCROLL_SPEED;
          if (Math.abs(offsetRef.current) >= half) offsetRef.current = 0;
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reviews.length]);

  if (!reviews.length) return null;

  const track = [...reviews, ...reviews];

  return (
    <div className="reviews-marquee-wrap relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-surface-alt to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-surface-alt to-transparent sm:w-16" />

      <div
        ref={trackRef}
        className="flex w-max will-change-transform gap-4 sm:gap-5"
        aria-live="off"
      >
        {track.map((review, i) => (
          <div
            key={`${review.id}-${i}`}
            className="w-[min(85vw,320px)] shrink-0 sm:w-[340px]"
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
    </div>
  );
}
