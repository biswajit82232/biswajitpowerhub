import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import {
  FOOTER_QUICK_LINKS,
  FOOTER_MODEL_LINKS,
  FOOTER_MORE_LINKS,
  whatsappUrl,
  telUrl,
  formatPhoneDisplay,
  formatShowroomAddress,
} from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { useLocale } from '@/context/LocaleContext';
import { FOOTER_PATH_KEYS } from '@/i18n/messages';

const linkClass =
  'inline-flex min-h-8 items-center py-0.5 text-[13px] leading-snug text-body transition hover:text-brand-500 hover:underline sm:min-h-9 sm:text-sm';

function FooterLinkColumn({ title, links, extra, t }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy sm:text-xs sm:tracking-[0.16em]">
        {title}
      </h3>
      <ul className="mt-2 space-y-0.5 sm:mt-3 sm:space-y-1">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className={linkClass}>
              {FOOTER_PATH_KEYS[l.to] ? t(FOOTER_PATH_KEYS[l.to]) : l.label}
            </Link>
          </li>
        ))}
        {extra}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const { site } = useSite();
  const { t } = useLocale();
  const primaryPhone = site.phones[0];
  const addressLine = formatShowroomAddress(site.address);

  return (
    <footer className="relative mt-auto overflow-x-hidden border-t border-line bg-white pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-body lg:pb-0">
      <div className="h-1 bg-brand-500" />

      <div className="container-px py-6 sm:py-10 lg:py-12">
        <div className="mb-5 sm:mb-8 lg:mb-0 lg:hidden">
          <Logo compact className="origin-left scale-90 sm:scale-100" />
          <address className="mt-2 not-italic text-xs leading-relaxed text-muted sm:mt-3 sm:text-sm">
            {addressLine}
          </address>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs sm:mt-3 sm:text-sm">
            <a
              href={telUrl(primaryPhone, site)}
              onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'footer' })}
              className="font-semibold text-navy hover:text-brand-500 hover:underline"
            >
              {formatPhoneDisplay(primaryPhone)}
            </a>
            <span className="text-line" aria-hidden>
              |
            </span>
            <a
              href={whatsappUrl(undefined, site)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'footer' })}
              className="font-semibold text-navy hover:text-brand-500 hover:underline"
            >
              {t('cta.whatsapp')}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4 lg:gap-8">
          <div className="hidden lg:block">
            <Logo compact className="origin-left" />
            <address className="mt-4 not-italic text-sm leading-relaxed text-muted">
              {addressLine}
            </address>
            <p className="mt-3">
              <a
                href={telUrl(primaryPhone, site)}
                onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'footer' })}
                className="text-sm font-semibold text-navy hover:text-brand-500 hover:underline"
              >
                {formatPhoneDisplay(primaryPhone)}
              </a>
            </p>
            <p className="mt-1">
              <a
                href={whatsappUrl(undefined, site)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'footer' })}
                className="text-sm font-semibold text-navy hover:text-brand-500 hover:underline"
              >
                {t('cta.whatsapp')}
              </a>
            </p>
          </div>

          <FooterLinkColumn
            title={t('footer.scooters')}
            t={t}
            links={FOOTER_MODEL_LINKS}
            extra={
              <li>
                <Link to="/scooters" className={`${linkClass} font-semibold text-navy`}>
                  {t('footer.viewAll')}
                </Link>
              </li>
            }
          />

          <FooterLinkColumn title={t('footer.more')} t={t} links={FOOTER_MORE_LINKS} />

          <FooterLinkColumn title={t('footer.quick')} t={t} links={FOOTER_QUICK_LINKS} />
        </div>
      </div>

      <div className="border-t border-line bg-surface-alt">
        <div className="container-px flex flex-col items-center gap-1 py-3 text-center sm:flex-row sm:justify-between sm:gap-2 sm:py-5 sm:text-left">
          <p className="text-[11px] leading-snug text-muted sm:text-sm">
            © {year} {site.name}. {t('footer.copy')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-[11px] sm:gap-x-3 sm:text-sm">
            <Link to="/terms" className="text-muted hover:text-navy hover:underline">
              {t('footer.terms')}
            </Link>
            <Link to="/privacy" className="text-muted hover:text-navy hover:underline">
              {t('footer.privacyShort')}
            </Link>
            <Link to="/about" className="text-muted hover:text-navy hover:underline">
              {t('footer.about')}
            </Link>
            <Link to="/social" className="text-muted hover:text-navy hover:underline">
              {t('social.nav')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
