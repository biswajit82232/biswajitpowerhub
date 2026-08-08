import { Tag, Sparkles, Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Section } from '@/components/common/Section';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getActiveOffers } from '@/features/offers/offerService';
import { whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

function OfferCard({ offer, site }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!offer.promoCode) return;
    try {
      await navigator.clipboard.writeText(offer.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { /* ignore */ }
  };

  const waMsg = offer.promoCode
    ? `Hi ${site.name}, I'd like to claim the offer "${offer.title}" (${offer.discountText}). Promo code: ${offer.promoCode}`
    : `Hi ${site.name}, I'd like to know more about the offer "${offer.title}" — ${offer.discountText}.`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-heading shadow-card ring-1 ring-white/10">
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12)_0%,transparent_45%,rgba(20,184,166,0.1)_100%)]" />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr,auto] lg:items-center lg:gap-10">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-300 ring-1 ring-white/10">
            <Sparkles className="h-3 w-3" />
            Limited Offer
          </span>

          <p className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
            {offer.discountText}
          </p>

          <h2 className="mt-3 font-display text-xl font-bold text-white/95 sm:text-2xl">
            {offer.title}
          </h2>

          {offer.description && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {offer.description}
            </p>
          )}

          {offer.promoCode && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Use code</span>
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-mono text-sm font-bold tracking-widest text-white ring-1 ring-white/20 transition hover:bg-white/15"
              >
                <Tag className="h-4 w-4 text-accent-300" />
                {offer.promoCode}
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-white/50" />}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:min-w-[11rem]">
          <Button
            href={whatsappUrl(waMsg, site)}
            variant="whatsapp"
            size="lg"
            fullWidth
            icon={MessageCircle}
            onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'promo-offer', offerId: offer.id })}
          >
            Claim Offer
          </Button>
          <Button to="/scooters" variant="secondary" size="lg" fullWidth className="bg-white/95 text-heading hover:bg-white">
            View Scooters
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PromotionalOffers() {
  const { site } = useSite();
  const { data: offers, loading } = useAsync(() => getActiveOffers(), []);

  if (loading || !offers?.length) return null;

  return (
    <Section id="offers" className="py-10 sm:py-14">
      <Reveal className="mb-5 text-center sm:mb-6">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-600">
          Exclusive Deals
        </span>
        <h2 className="mt-1.5 font-display text-2xl font-extrabold text-heading sm:text-3xl">
          Today&apos;s showroom offers
        </h2>
      </Reveal>

      <div className="space-y-5">
        {offers.map((offer, i) => (
          <Reveal key={offer.id} delay={i * 0.05}>
            <OfferCard offer={offer} site={site} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
