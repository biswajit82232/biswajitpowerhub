import { Gift, Tag, Copy, Check, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { getActiveOffers } from '@/features/offers/offerService';
import { telUrl, whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { optimizedImageUrl, isSupabaseStorageUrl } from '@/lib/imageCdn';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';

function offerImage(url, size = 96) {
  if (!url) return null;
  return isSupabaseStorageUrl(url)
    ? optimizedImageUrl(url, size, 78, { height: size, resize: 'cover' })
    : url;
}

function offerWhatsappMessage(offer, site) {
  const isFree = offer.kind === 'free_with_purchase';
  if (isFree) {
    return `Hi ${site.name}, I'd like the free gift "${offer.title}" (${offer.discountText}) with my scooter purchase.`;
  }
  if (offer.promoCode) {
    return `Hi ${site.name}, I'd like to claim the offer "${offer.title}" (${offer.discountText}). Promo code: ${offer.promoCode}`;
  }
  return `Hi ${site.name}, I'd like to know more about the offer "${offer.title}" — ${offer.discountText}.`;
}

function OfferDetailsModal({ offer, site, open, onClose }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  if (!offer) return null;

  const isFree = offer.kind === 'free_with_purchase';
  const img = offerImage(offer.imageUrl, 640);
  const waMsg = offerWhatsappMessage(offer, site);

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

  return (
    <Modal open={open} onClose={onClose} title={t('off.details')} size="md" centered>
      <div className="space-y-4">
        {img ? (
          <img
            src={img}
            alt=""
            className="mx-auto h-36 w-36 rounded-2xl object-cover ring-1 ring-line sm:h-44 sm:w-44"
            loading="lazy"
            decoding="async"
          />
        ) : isFree ? (
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600 text-white">
            <Gift className="h-9 w-9" />
          </span>
        ) : null}

        <div className="text-center">
          {isFree ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-700">
              {t('off.freeGift')}
            </p>
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
              {t('off.special')}
            </p>
          )}
          <h3 className="mt-1 font-display text-2xl font-extrabold text-navy">
            {offer.discountText}
          </h3>
          {offer.title ? (
            <p className="mt-1 text-base font-semibold text-heading">{offer.title}</p>
          ) : null}
          {offer.description ? (
            <p className="mt-3 text-sm leading-relaxed text-body">{offer.description}</p>
          ) : null}
        </div>

        {offer.promoCode ? (
          <button
            type="button"
            onClick={onCopy}
            className="mx-auto flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-brand-700 ring-1 ring-brand-100"
          >
            <Tag className="h-4 w-4" />
            {t('home.code')} {offer.promoCode}
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 opacity-60" />}
          </button>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            href={whatsappUrl(waMsg, site)}
            variant="whatsapp"
            fullWidth
            icon={MessageCircle}
            onClick={() =>
              trackEvent(EVENT.WHATSAPP_CLICK, {
                from: 'offer-details',
                offerId: offer.id,
                kind: offer.kind,
              })
            }
          >
            WhatsApp to claim
          </Button>
          <Button
            href={telUrl(undefined, site)}
            target="_self"
            variant="dealerPrimary"
            fullWidth
            icon={Phone}
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'offer-details', offerId: offer.id })}
          >
            Call showroom
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function OfferStrip({ offer, site, onOpen }) {
  const [copied, setCopied] = useState(false);
  const isFree = offer.kind === 'free_with_purchase';
  const waMsg = offerWhatsappMessage(offer, site);
  const img = offerImage(offer.imageUrl, 96);

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

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl shadow-soft sm:rounded-2xl',
        isFree
          ? 'border border-red-200 bg-red-50/70'
          : 'border border-line bg-white',
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(offer)}
        className="flex w-full items-start gap-3 p-3 text-left transition hover:opacity-95 sm:gap-4 sm:p-4"
        aria-label={`View details: ${offer.discountText}${offer.title ? ` — ${offer.title}` : ''}`}
      >
        {img ? (
          <img
            src={img}
            alt=""
            width={56}
            height={56}
            className={cn(
              'h-12 w-12 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14',
              isFree ? 'ring-2 ring-red-300' : 'ring-1 ring-line',
            )}
            loading="lazy"
            decoding="async"
          />
        ) : isFree ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white sm:h-14 sm:w-14">
            <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 sm:h-14 sm:w-14">
            <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block text-[9px] font-black uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.16em]',
              isFree ? 'text-red-700' : 'text-brand-600',
            )}
          >
            {isFree ? 'Free with scooty purchase' : 'Special offer'}
          </span>
          <span className="mt-0.5 block font-display text-[15px] font-black leading-snug tracking-tight text-navy sm:text-xl">
            {offer.discountText}
          </span>
          {offer.title && offer.title !== offer.discountText ? (
            <span className="mt-0.5 block text-sm font-semibold leading-snug text-heading sm:text-base">
              {offer.title}
            </span>
          ) : null}
          {offer.description ? (
            <span className="mt-1 block text-[12px] leading-snug text-muted sm:line-clamp-2 sm:text-sm">
              {offer.description}
            </span>
          ) : null}
        </span>
      </button>

      <div
        className={cn(
          'flex flex-wrap items-center gap-2 border-t px-3 py-2.5 sm:gap-2.5 sm:px-4',
          isFree ? 'border-red-100 bg-red-50/80' : 'border-line bg-surface-alt/60',
        )}
      >
        {offer.promoCode ? (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 text-[11px] font-black uppercase tracking-wider text-brand-700 ring-1 ring-brand-100 sm:h-10 sm:px-3 sm:text-xs"
            aria-label={`Copy promo code ${offer.promoCode}`}
          >
            <Tag className="h-3.5 w-3.5" />
            {offer.promoCode}
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
          </button>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 !px-3 text-[11px] sm:h-10 sm:!px-3.5 sm:text-xs"
          onClick={() => onOpen(offer)}
        >
          Details
        </Button>

        <Button
          href={whatsappUrl(waMsg, site)}
          variant={isFree ? 'dealerPrimary' : 'whatsapp'}
          size="sm"
          icon={MessageCircle}
          className="ml-auto h-9 !px-3 text-[11px] sm:h-10 sm:!px-3.5 sm:text-xs"
          onClick={() =>
            trackEvent(EVENT.WHATSAPP_CLICK, {
              from: 'promo-offer',
              offerId: offer.id,
              kind: offer.kind,
            })
          }
        >
          {isFree ? 'Ask' : 'Claim'}
        </Button>
      </div>
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
  const { t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: offers, loading } = useAsync(() => getActiveOffers(), []);
  const [selected, setSelected] = useState(null);

  // Home already shows freebies as the hero sticky — skip the duplicate strip there.
  const visibleOffers = compact
    ? (offers || []).filter((o) => o.kind !== 'free_with_purchase')
    : offers || [];

  const openOffer = (offer) => {
    if (!offer) return;
    setSelected(offer);
    const next = new URLSearchParams(searchParams);
    next.set('offer', String(offer.id));
    setSearchParams(next, { replace: true });
  };

  const closeOffer = () => {
    setSelected(null);
    if (searchParams.get('offer')) {
      const next = new URLSearchParams(searchParams);
      next.delete('offer');
      setSearchParams(next, { replace: true });
    }
  };

  // Deep-link: /offers?offer=<id> or /?offer=<id>
  useEffect(() => {
    const id = searchParams.get('offer');
    if (!id || !offers?.length) return;
    const match = offers.find((o) => String(o.id) === String(id));
    if (match) setSelected(match);
  }, [searchParams, offers]);

  if (loading) {
    if (compact) {
      return (
        <Section id="offers" tight className="py-3 sm:py-6">
          <div className="min-h-[9.5rem] rounded-xl bg-surface-alt/80 ring-1 ring-line sm:min-h-[10.5rem]" aria-hidden />
        </Section>
      );
    }
    return (
      <Section id="offers" className="py-8 sm:py-10">
        <div className="space-y-2 sm:space-y-4">
          <Skeleton className="h-14 w-full sm:h-24" />
          {showEmpty ? <Skeleton className="h-14 w-full sm:h-24" /> : null}
        </div>
      </Section>
    );
  }

  if (!offers?.length || (compact && !visibleOffers.length)) {
    if (!showEmpty || compact) return null;
    return (
      <Section id="offers">
        <EmptyState
          icon={Tag}
          title={t('off.empty')}
          description={t('off.emptyD')}
        />
      </Section>
    );
  }

  return (
    <Section id="offers" tight={compact} className={compact ? 'py-3 sm:py-6' : 'py-5 sm:py-10'}>
      {!compact ? (
        <h2 className="dealer-section-title mb-3 !text-left text-lg sm:mb-8 sm:text-inherit">
          {t('off.active')}
        </h2>
      ) : null}
      <div className="space-y-2 sm:space-y-3">
        {visibleOffers.map((offer, i) =>
          compact ? (
            <OfferStrip key={offer.id} offer={offer} site={site} onOpen={openOffer} />
          ) : (
            <Reveal key={offer.id} delay={i * 0.04}>
              <OfferStrip offer={offer} site={site} onOpen={openOffer} />
            </Reveal>
          ),
        )}
      </div>

      <OfferDetailsModal
        offer={selected}
        site={site}
        open={!!selected}
        onClose={closeOffer}
      />
    </Section>
  );
}
