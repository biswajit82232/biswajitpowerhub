import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  MapPin,
  Star,
  ExternalLink,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { DealerPageHero } from '@/components/common/DealerPageHero';
import { SITE_URL, whatsappUrl } from '@/config/site';
import { whatsappCatalogUrl } from '@/lib/whatsappLinks';
import { useSite } from '@/context/SiteSettingsContext';
import { useLocale } from '@/context/LocaleContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { FacebookPageFeed } from '@/components/sections/FacebookPageFeed';
import { WhatsAppCatalog } from '@/components/sections/WhatsAppCatalog';
import { SoftBoundary } from '@/components/common/ErrorBoundary';
import { cn } from '@/lib/utils';

const path = '/social';
const SECTION_OFFSET = 'scroll-mt-[calc(var(--header-offset)+0.75rem)]';

function handleFromUrl(url, fallback) {
  if (!url) return fallback;
  try {
    const u = new URL(url);
    const last = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop();
    if (!last) return fallback;
    return last.startsWith('@') ? last : `@${last}`;
  } catch {
    return fallback;
  }
}

function ChannelCard({ item, opensLabel }) {
  const Icon = item.icon;
  return (
    <li>
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.title}. ${item.cta}. ${opensLabel}`}
        onClick={() => {
          if (item.event) trackEvent(item.event, { from: 'social-page', channel: item.id });
        }}
        className="group flex min-h-[4.75rem] items-center gap-3 border border-line bg-white p-3.5 shadow-soft transition hover:border-brand-500 hover:shadow-md focus-visible:border-brand-500 active:scale-[0.99] sm:min-h-[5.25rem] sm:gap-4 sm:p-4"
      >
        <span
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
            item.tone,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-bold uppercase tracking-wide text-navy sm:text-base">
            {item.title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted">{item.hint}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-dealer border border-line bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-navy transition group-hover:border-brand-500 sm:px-3.5">
          {item.cta}
          <ExternalLink className="h-3.5 w-3.5 opacity-50" aria-hidden />
        </span>
      </a>
    </li>
  );
}

function JumpLink({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 shrink-0 items-center rounded-dealer border border-line bg-white px-3.5 text-xs font-bold uppercase tracking-wide text-navy transition hover:border-brand-500 hover:text-brand-600"
    >
      {children}
    </a>
  );
}

export default function Social() {
  const { site } = useSite();
  const { t } = useLocale();
  const instagram = site.social?.instagram?.trim();
  const facebook = site.social?.facebook?.trim();
  const youtube = site.social?.youtube?.trim();
  const maps = site.maps?.link;
  const review = site.maps?.reviewLink;
  const catalogUrl = whatsappCatalogUrl(site);
  const opensLabel = t('social.opensNew');

  const jsonLd = [
    breadcrumbList([
      { name: 'Home', path: '/' },
      { name: 'Social', path },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${site.name} on social`,
      url: `${SITE_URL}${path}`,
      about: { '@id': `${SITE_URL}/#dealership` },
      sameAs: [instagram, facebook, youtube, maps].filter(Boolean),
    },
  ];

  const follow = [
    instagram && {
      id: 'instagram',
      href: instagram,
      icon: Instagram,
      title: t('social.instagram'),
      hint: handleFromUrl(instagram, '@biswajitpowerhub'),
      cta: t('social.follow'),
      tone: 'bg-[#fdf2f8] text-[#c13584]',
      event: null,
    },
    facebook && {
      id: 'facebook',
      href: facebook,
      icon: Facebook,
      title: t('social.facebook'),
      hint: t('social.facebookHint'),
      cta: t('social.follow'),
      tone: 'bg-[#eff4ff] text-[#1877F2]',
      event: null,
    },
    youtube && {
      id: 'youtube',
      href: youtube,
      icon: Youtube,
      title: t('social.youtube'),
      hint: handleFromUrl(youtube, t('social.youtubeHint')),
      cta: t('social.watch'),
      tone: 'bg-[#fef2f2] text-[#cc0000]',
      event: null,
    },
  ].filter(Boolean);

  const visit = [
    {
      id: 'whatsapp',
      href: whatsappUrl(undefined, site),
      icon: MessageCircle,
      title: t('cta.whatsapp'),
      hint: t('social.whatsappHint'),
      cta: t('social.chat'),
      tone: 'bg-[#ecfdf3] text-[#128c7e]',
      event: EVENT.WHATSAPP_CLICK,
    },
    maps && {
      id: 'maps',
      href: maps,
      icon: MapPin,
      title: t('social.maps'),
      hint: t('social.mapsHint'),
      cta: t('social.mapsCta'),
      tone: 'bg-[#eff6ff] text-navy',
      event: EVENT.DIRECTIONS_CLICK,
    },
    review && {
      id: 'google',
      href: review,
      icon: Star,
      title: t('social.google'),
      hint: t('social.googleHint'),
      cta: t('social.review'),
      tone: 'bg-[#fffbeb] text-[#b45309]',
      event: null,
    },
  ].filter(Boolean);

  return (
    <>
      <SEO
        title={`Social | ${site.name} Berhampore`}
        description={`Follow ${site.name} on Instagram, Facebook, WhatsApp, and Google. Showroom at Chunakhali Bus Stand, Berhampore.`}
        path={path}
        jsonLd={jsonLd}
        titleTemplate={false}
      />

      <DealerPageHero
        title={t('social.h1')}
        subtitle={t('social.sub')}
        breadcrumbs={[{ name: t('crumb.home'), to: '/' }, { name: t('social.nav') }]}
      >
        <nav
          aria-label={t('social.jumpLabel')}
          className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {follow.length ? <JumpLink href="#follow">{t('social.jumpFollow')}</JumpLink> : null}
          {facebook ? <JumpLink href="#photos">{t('social.jumpPhotos')}</JumpLink> : null}
          {catalogUrl ? <JumpLink href="#catalog">{t('social.jumpCatalog')}</JumpLink> : null}
          <JumpLink href="#visit">{t('social.jumpVisit')}</JumpLink>
        </nav>
      </DealerPageHero>

      {follow.length ? (
        <section
          id="follow"
          className={cn('border-b border-line bg-surface-alt py-8 sm:py-12', SECTION_OFFSET)}
          aria-labelledby="follow-heading"
        >
          <div className="container-px">
            <h2 id="follow-heading" className="dealer-section-title !text-left">
              {t('social.followTitle')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
              {t('social.followSub')}
            </p>
            <ul className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
              {follow.map((item) => (
                <ChannelCard key={item.id} item={item} opensLabel={opensLabel} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <SoftBoundary>
        {facebook ? <FacebookPageFeed pageUrl={facebook} /> : null}
      </SoftBoundary>

      <SoftBoundary>
        <WhatsAppCatalog />
      </SoftBoundary>

      <section
        id="visit"
        className={cn('border-t border-line bg-surface-alt py-8 sm:py-12', SECTION_OFFSET)}
        aria-labelledby="visit-heading"
      >
        <div className="container-px">
          <h2 id="visit-heading" className="dealer-section-title !text-left">
            {t('social.visitTitle')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
            {t('social.visitSub')}
          </p>
          <ul className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3">
            {visit.map((item) => (
              <ChannelCard key={item.id} item={item} opensLabel={opensLabel} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
