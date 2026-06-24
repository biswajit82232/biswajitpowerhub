import { Quote, BadgeCheck } from 'lucide-react';
import { Stars } from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';

function initials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

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
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-body sm:text-[0.95rem]">
        “{review.review}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
        {review.photo ? (
          <img
            src={review.photo}
            alt={review.name}
            loading="lazy"
            decoding="async"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-100"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white ring-2 ring-brand-100">
            {initials(review.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-heading">{review.name}</p>
          {review.scooter && (
            <p className="truncate text-xs text-muted">Owns the {review.scooter}</p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
