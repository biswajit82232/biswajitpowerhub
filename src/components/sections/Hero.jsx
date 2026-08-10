import { MessageCircle, Phone, Navigation } from 'lucide-react';
import { SiteImage } from '@/components/common/SiteImage';
import Button from '@/components/ui/Button';
import { SITE, whatsappUrl, telUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { trackEvent, EVENT } from '@/lib/tracking';

const d = (ms) => ({ animationDelay: `${ms}ms` });

export function Hero({ heroImageUrl }) {
  const { site } = useSite();
  const { photos } = useSitePhotos();
  const imageUrl = photos?.hero?.url || heroImageUrl || null;
  const imageAlt =
    photos?.hero?.alt ||
    'Biswajit Power Hub electric scooter showroom at Chunakhali Bus Stand Berhampore Murshidabad';

  return (
    <section className="relative isolate min-h-[min(88vh,820px)] overflow-hidden bg-heading">
      {/* Full-bleed showroom photo */}
      <div className="absolute inset-0" aria-hidden={!imageUrl}>
        <SiteImage
          src={imageUrl}
          alt={imageAlt}
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          className="h-full min-h-[min(88vh,820px)] w-full !aspect-auto bg-heading"
          imgClassName="object-cover object-center"
          placeholderLabel="Showroom photos coming soon — visit us at Chunakhali Bus Stand"
        />
      </div>

      {/* Readability gradient only — no chips/badges on the photo */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-heading/90 via-heading/70 to-heading/35 sm:via-heading/65 sm:to-heading/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-heading/80 via-transparent to-heading/30"
        aria-hidden
      />

      <div className="container-px relative flex min-h-[min(88vh,820px)] items-end pb-14 pt-24 sm:items-center sm:pb-20 sm:pt-28 lg:pb-24">
        <div className="max-w-2xl text-left">
          <p
            className="animate-hero-rise font-display text-display-lg font-extrabold tracking-tight text-white sm:text-display-xl"
            style={d(0)}
          >
            {SITE.name}
          </p>
          <p
            className="mt-2 animate-hero-rise font-display text-lg font-medium tracking-wide text-sky-200/95 sm:text-xl"
            style={d(60)}
          >
            {SITE.tagline}
          </p>

          <h1
            className="mt-5 animate-hero-rise font-display text-2xl font-bold leading-snug text-white sm:mt-6 sm:text-3xl lg:text-[2rem]"
            style={d(100)}
          >
            Premium electric scooters. Free test ride in Berhampore.
          </h1>

          <p
            className="mt-3 max-w-lg animate-hero-rise text-base leading-relaxed text-white/80 sm:mt-4 sm:text-lg"
            style={d(140)}
          >
            No licence. No registration on eligible models. Visit our showroom at Chunakhali Bus Stand.
          </p>

          <div
            className="mt-7 flex animate-hero-rise flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center"
            style={d(180)}
          >
            <Button
              href={telUrl(undefined, site)}
              target="_self"
              variant="primary"
              size="lg"
              icon={Phone}
              className="w-full sm:w-auto"
              onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'hero' })}
            >
              Call: {formatPhoneDisplay(site.phones[0]).replace('+91 ', '0')}
            </Button>
            <Button
              href={whatsappUrl(undefined, site)}
              variant="whatsapp"
              size="lg"
              icon={MessageCircle}
              className="w-full sm:w-auto"
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'hero' })}
            >
              WhatsApp
            </Button>
            <Button
              href={site.maps.link}
              variant="directions"
              size="lg"
              icon={Navigation}
              className="w-full sm:w-auto"
              onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'hero' })}
            >
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
