import { Link } from 'react-router-dom';
import { Stars } from '@/components/ui/StarRating';
import { SCOOTERS } from '@/data/scooters';
import { cn } from '@/lib/utils';
import { optimizedImageUrl } from '@/lib/imageCdn';

export function ReviewCard({ review, className }) {
  const scooterMatch = review.scooter
    ? SCOOTERS.find((s) => s.name.toLowerCase() === String(review.scooter).toLowerCase())
    : null;

  return (
    <figure className={cn('flex h-full flex-col border border-line bg-white p-5 shadow-soft', className)}>
      <Stars value={review.rating} size={15} />
      {review.photo && (
        <div className="mt-3 overflow-hidden border border-line">
          <img
            src={optimizedImageUrl(review.photo, 800)}
            alt={`Photo from ${review.name}`}
            width={800}
            height={600}
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
        <p className="break-words text-sm font-bold uppercase tracking-wide text-navy">{review.name}</p>
        {review.scooter && (
          <p className="mt-1 break-words text-xs text-muted">
            Owns the{' '}
            {scooterMatch ? (
              <Link
                to={`/scooters/${scooterMatch.id}`}
                className="font-semibold text-brand-500 underline-offset-2 hover:underline"
              >
                {review.scooter}
              </Link>
            ) : (
              review.scooter
            )}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
