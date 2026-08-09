import { Tag, Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getActiveOffers } from '@/features/offers/offerService';
import { whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

function OfferStrip({ offer, site }) {
  const [copied, setCopied] = useState(false);

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

  const waMsg = offer.promoCode
    ? `Hi ${site.name}, I'd like to claim the offer "${offer.title}" (${offer.discountText}). Promo code: ${offer.promoCode}`
    : `Hi ${site.name}, I'd like to know more about the offer "${offer.title}" — ${offer.discountText}.`;

  return (
    <div className="flex flex-col gap-4 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4">
      <div className="min-w-0">
        <p className="font-display text-xl font-extrabold text-heading sm:text-2xl">
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
      <Button
        href={whatsappUrl(waMsg, site)}
        variant="whatsapp"
        size="md"
        icon={MessageCircle}
        className="w-full shrink-0 sm:w-auto"
        onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'promo-offer', offerId: offer.id })}
      >
        Claim Offer
      </Button>
    </div>
  );
}

export function PromotionalOffers() {
  const { site } = useSite();
  const { data: offers, loading } = useAsync(() => getActiveOffers(), []);

  if (loading || !offers?.length) return null;

  return (
    <Section id="offers" tight className="py-2 sm:py-3">
      <div className="space-y-0">
        {offers.map((offer, i) => (
          <Reveal key={offer.id} delay={i * 0.04}>
            <OfferStrip offer={offer} site={site} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
