import { Gift, Star, Tag } from 'lucide-react';

const KIND_RANK = { scooter_sale: 0, free_with_purchase: 1, promo: 2 };

/** Sales first, then free gifts, then promos. Sort order breaks ties. */
export function presentOffers(offers) {
  return [...(offers || [])]
    .filter((offer) => offer?.kind !== 'scooter_sale')
    .sort((a, b) => {
    const byKind = (KIND_RANK[a.kind] ?? 9) - (KIND_RANK[b.kind] ?? 9);
    if (byKind) return byKind;
    return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
  });
}

const PERCENT_COPY = /^\s*\d+\s*%/i;

export function isPercentCopy(text) {
  return PERCENT_COPY.test(String(text || ''));
}

/** Sale cards use the offer name. The percent stays on the scooter price, not in the offer line. */
export function offerHeadline(offer, t) {
  if (offer?.kind === 'scooter_sale') {
    const title = String(offer.title || '').trim();
    if (title && !isPercentCopy(title)) return title;
    return t('off.saleTitle');
  }
  return String(offer?.discountText || offer?.title || '').trim();
}

/** Second line for promos and free gifts. Empty for a sale, so the percent is not repeated. */
export function offerSupport(offer) {
  if (offer?.kind === 'scooter_sale') return '';
  const title = String(offer?.title || '').trim();
  const headline = String(offer?.discountText || '').trim();
  if (title && title !== headline && !isPercentCopy(title)) return title;
  return '';
}

export function offerLook(offer, t) {
  const isSale = offer?.kind === 'scooter_sale';
  const isFree = offer?.kind === 'free_with_purchase';
  if (isSale) {
    return {
      isSale: true,
      isFree: false,
      eyebrow: '',
      chip: null,
      card: 'bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white ring-red-900/30',
      chipClass: 'bg-amber-300 text-red-900',
      Icon: Star,
    };
  }
  if (isFree) {
    return {
      isSale: false,
      isFree: true,
      eyebrow: t('off.freeGift'),
      chip: t('off.freeChip'),
      card: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 text-white ring-orange-900/25',
      chipClass: 'bg-white text-orange-800',
      Icon: Gift,
    };
  }
  return {
    isSale: false,
    isFree: false,
    eyebrow: t('off.special'),
    chip: offer?.promoCode || t('off.dealChip'),
    card: 'bg-gradient-to-br from-navy via-[#16315f] to-brand-700 text-white ring-navy/25',
    chipClass: 'bg-amber-300 text-navy',
    Icon: Tag,
  };
}
