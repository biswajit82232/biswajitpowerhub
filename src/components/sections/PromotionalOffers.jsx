import { Gift, Tag, Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { getActiveOffers } from '@/features/offers/offerService';
import { whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { optimizedImageUrl, isSupabaseStorageUrl } from '@/lib/imageCdn';

function OfferStrip({ offer, site }) {
  const [copied, setCopied] = useState(false);
  const isFree = offer.kind === 'free_with_purchase';

  const onCopy = async () => {
    if (!offer.promoCode) return;
    try {
      await navigator.clipboard.writeText(offer.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      /* ignore */
    }
  };

  const waMsg = isFree
    ? `Hi ${site.name}, I'd like the free gift "${offer.title}" (${offer.discountText}) with my scooter purchase.`
    : offer.promoCode
      ? `Hi ${site.name}, I'd like to claim the offer "${offer.title}" (${offer.discountText}). Promo code: ${offer.promoCode}`
      : `Hi ${site.name}, I'd like to know more about the offer "${offer.title}" — ${offer.discountText}.`;

  const img = offer.imageUrl
    ? isSupabaseStorageUrl(offer.imageUrl)
      ? optimizedImageUrl(offer.imageUrl, 160, 78, { height: 160, resize: 'cover' })
      : offer.imageUrl
    : null;

  return (
    <div
      className={
        isFree
          ? 'flex flex-col gap-4 border border-red-200 bg-red-50/60 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6'
          : 'flex flex-col gap-4 border border-line bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6'
      }
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        {img ? (
          <img
            src={img}
            alt=""
            width={64}
            height={64}
            className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-line sm:h-16 sm:w-16"
            loading="lazy"
            decoding="async"
          />
        ) : isFree ? (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white sm:h-16 sm:w-16">
            <Gift className="h-6 w-6" />
          </span>
        ) : null}
        <div className="min-w-0">
          {isFree ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-700">
              Free with scooty purchase
            </p>
          ) : null}
          <p className="font-display text-xl font-extrabold text-navy sm:text-2xl">
            {offer.discountText}
            <span className="ml-2 text-base font-semibold text-body sm:text-lg">{offer.title}</span>
          </p>
          {offer.description ? (
            <p className="mt-1 text-sm text-muted line-clamp-2">{offer.description}</p>
          ) : null}
          {offer.promoCode ? (
            <button
              type="button"
              onClick={onCopy}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700"
            >
              <Tag className="h-3.5 w-3.5" />
              {offer.promoCode}
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
            </button>
          ) : null}
        </div>
      </div>
      <Button
        href={whatsappUrl(waMsg, site)}
        variant={isFree ? 'dealerPrimary' : 'whatsapp'}
        size="md"
        icon={MessageCircle}
        className="w-full shrink-0 sm:w-auto"
        onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'promo-offer', offerId: offer.id, kind: offer.kind })}
      >
        {isFree ? 'Ask about freebie' : 'Claim Offer'}
      </Button>
    </div>
  );
}

/**
 * @param {{ compact?: boolean; showEmpty?: boolean }} props
 * compact — tighter spacing for Home; showEmpty — message when no active offers (/offers page)
 * On Home (compact), renders nothing when there are no offers — no dead promo strip.
 */
export function PromotionalOffers({ compact = false, showEmpty = false }) {
  const { site } = useSite();
  const { data: offers, loading } = useAsync(() => getActiveOffers(), []);

  if (loading) {
    if (compact) return null;
    return (
      <Section id="offers" className="py-8 sm:py-10">
        <div className="space-y-4">
          <Skeleton className="h-28 w-full sm:h-24" />
          {showEmpty ? <Skeleton className="h-28 w-full sm:h-24" /> : null}
        </div>
      </Section>
    );
  }

  if (!offers?.length) {
    if (!showEmpty || compact) return null;
    return (
      <Section id="offers">
        <EmptyState
          icon={Tag}
          title="No active offers right now"
          description="Call or WhatsApp the showroom — seasonal deals and freebies change often at Chunakhali."
        />
      </Section>
    );
  }

  return (
    <Section id="offers" tight={compact} className={compact ? 'py-6 sm:py-8' : 'py-8 sm:py-10'}>
      {!compact ? (
        <h2 className="dealer-section-title mb-6 !text-left sm:mb-8">Active Offers</h2>
      ) : null}
      <div className="space-y-4">
        {offers.map((offer, i) => (
          <Reveal key={offer.id} delay={i * 0.04}>
            <OfferStrip offer={offer} site={site} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
