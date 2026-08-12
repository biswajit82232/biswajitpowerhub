import { Link } from 'react-router-dom';
import { ChevronRight, Gift } from 'lucide-react';
import { optimizedImageUrl, isSupabaseStorageUrl } from '@/lib/imageCdn';
import { cn } from '@/lib/utils';

/**
 * Eye-catching premium hero offer badge — high contrast, no motion.
 * Designed to read clearly over busy showroom photos.
 */
export function SaleOfferSticker({ offer, to, className }) {
  if (!offer) return null;

  const isFree = offer.kind === 'free_with_purchase';
  const thumb = offer.imageUrl
    ? isSupabaseStorageUrl(offer.imageUrl)
      ? optimizedImageUrl(offer.imageUrl, 200, 82, { height: 200, resize: 'cover' })
      : offer.imageUrl
    : null;

  const headline = (offer.discountText || offer.title || 'Special offer').trim();
  const title =
    offer.title && offer.discountText && offer.title !== offer.discountText
      ? offer.title.trim()
      : '';
  const eyebrow = isFree ? 'Free gift' : 'Hot deal';
  const href = to || `/offers?offer=${encodeURIComponent(offer.id)}`;

  return (
    <Link
      to={href}
      aria-label={`${eyebrow}: ${headline}${title ? ` — ${title}` : ''}`}
      className={cn(
        'absolute z-30 w-[11rem] sm:w-[15rem]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy/50',
        className,
      )}
    >
      <span
        className={cn(
          'relative block overflow-hidden rounded-xl sm:rounded-2xl',
          'bg-navy-800 text-white',
          'ring-2 ring-amber-400/90',
          'shadow-[0_10px_28px_rgba(0,18,51,0.5),0_0_0_1px_rgba(255,212,0,0.25)]',
        )}
      >
        {/* Gold crown bar */}
        <span className="flex items-center justify-between gap-1.5 bg-amber-400 px-2 py-0.5 sm:gap-2 sm:px-3 sm:py-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.14em] text-navy-900 sm:text-[10px] sm:tracking-[0.16em]">
            {eyebrow}
          </span>
          <span className="rounded-full bg-navy-900 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-amber-300 sm:text-[9px]">
            {isFree ? 'With scooty' : 'Limited'}
          </span>
        </span>

        <span className="flex items-stretch gap-2 p-2 sm:gap-3 sm:p-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg ring-2 ring-amber-400/80 sm:h-16 sm:w-16 sm:rounded-xl">
            {thumb ? (
              <img
                src={thumb}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-brand-600">
                <Gift className="h-4 w-4 text-white sm:h-7 sm:w-7" strokeWidth={2.2} aria-hidden />
              </span>
            )}
          </span>

          <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <span className="line-clamp-2 font-display text-[11px] font-black leading-[1.15] tracking-tight text-white sm:line-clamp-none sm:text-[15px]">
              {headline}
            </span>
            {title ? (
              <span className="line-clamp-2 text-[9px] font-semibold leading-snug text-amber-200 sm:line-clamp-none sm:text-xs">
                {title}
              </span>
            ) : null}
            <span className="mt-0.5 inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-amber-300 sm:mt-1 sm:text-[10px]">
              Details
              <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2.6} aria-hidden />
            </span>
          </span>
        </span>

        {/* Brand red under-accent */}
        <span className="block h-0.5 w-full bg-brand-gradient sm:h-1" aria-hidden />
      </span>
    </Link>
  );
}
