import { Quote, BadgeCheck } from 'lucide-react';
import { Stars } from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';

export function ReviewCard({ review, className }) {
  return (
    <figure
      className={cn(
        'flex h-full flex-col rounded-2xl bg-surface p-5 ring-1 ring-line shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-6',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Quote className="h-6 w-6 text-brand-200 sm:h-7 sm:w-7" fill="currentColor" />
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[0.65rem] font-semibold text-accent-700">
          <BadgeCheck className="h-3 w-3" /> Verified buyer
        </span>
      </div>
      <Stars value={review.rating} className="mt-3" size={15} />
      {review.photo && (
        <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-line">
          <img
            src={review.photo}
            alt={`Photo from ${review.name}`}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      )}
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-body sm:text-[0.95rem]">
        “{review.review}”
      </blockquote>
      <figcaption className="mt-4 border-t border-line pt-4">
        <p className="break-words text-sm font-bold text-heading">{review.name}</p>
        {review.scooter && (
          <p className="break-words text-xs text-muted">Owns the {review.scooter}</p>
        )}
      </figcaption>
    </figure>
  );
}
