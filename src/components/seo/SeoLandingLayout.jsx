import { Phone, MessageCircle, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Reveal } from '@/components/common/Reveal';
import Button from '@/components/ui/Button';
import { SITE, whatsappUrl, telUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { SITE_FAQS } from '@/data/seoContent';

export function ShowroomCtaRow({ from = 'seo-landing' }) {
  const { site } = useSite();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button
        href={telUrl(undefined, site)}
        target="_self"
        variant="dealerPrimary"
        size="lg"
        icon={Phone}
        className="min-h-12"
        onClick={() => trackEvent(EVENT.CALL_CLICK, { from })}
      >
        Call: {formatPhoneDisplay(site.phones[0]).replace('+91 ', '0')}
      </Button>
      <Button
        href={whatsappUrl(undefined, site)}
        variant="whatsapp"
        size="lg"
        icon={MessageCircle}
        className="min-h-12 !rounded-dealer"
        onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from })}
      >
        WhatsApp
      </Button>
      <Button
        href={site.maps.link}
        variant="dealerSecondary"
        size="lg"
        icon={Navigation}
        className="min-h-12"
        onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from })}
      >
        Get Direction
      </Button>
    </div>
  );
}

export function FaqSection({ faqs, title = 'Frequently Asked Questions' }) {
  const { site } = useSite();
  const list = faqs?.length ? faqs : (site.faqs?.length ? site.faqs : SITE_FAQS);
  return (
    <section className="mt-14" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="dealer-section-title !text-left">
        {title}
      </h2>
      <div className="mt-6 space-y-2">
        {list.map((f, i) => (
          <details
            key={f.question}
            className="group border border-line bg-white open:shadow-soft"
          >
            <summary className="cursor-pointer list-none px-4 py-4 font-display text-sm font-bold text-navy marker:content-none sm:text-base [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                <span>
                  Q{i + 1}. {f.question}
                </span>
                <span className="shrink-0 text-brand-500 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="border-t border-line px-4 py-3 text-sm leading-relaxed text-body">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Shared shell for SEO intent landing pages.
 */
export function SeoLandingLayout({
  title,
  description,
  path,
  breadcrumbs,
  h1,
  intro,
  jsonLd,
  children,
  showFaq = true,
}) {
  return (
    <>
      <SEO title={title} description={description} path={path} jsonLd={jsonLd} titleTemplate={false} />
      <article>
        <header className="relative overflow-hidden border-b border-line bg-white">
          <div className="container-px relative py-12 sm:py-16 lg:py-20">
            <Breadcrumbs items={breadcrumbs} />
            <Reveal>
              <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold uppercase tracking-wide text-navy sm:text-4xl lg:text-5xl">
                {h1}
              </h1>
              {intro ? (
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-body sm:text-lg">{intro}</p>
              ) : null}
              <div className="mt-8">
                <ShowroomCtaRow from={path} />
              </div>
            </Reveal>
          </div>
        </header>

        <div className="container-px py-12 sm:py-16">
          <Reveal>
            <div className="prose-seo mx-auto max-w-[800px] space-y-6 px-0 text-body [&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-line [&_h2]:pb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-navy [&_h2]:sm:text-3xl [&_li]:leading-relaxed [&_p]:leading-relaxed [&_strong]:text-navy [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
              {children}
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-[800px] border border-line bg-surface-alt p-6 shadow-soft sm:p-8">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-navy sm:text-xl">Visit Our Showroom</p>
            <p className="mt-1 text-sm text-muted">
              Looking for models? Browse{' '}
              <Link to="/scooters" className="font-semibold text-brand-600 hover:underline">
                all electric scooters
              </Link>{' '}
              or contact {SITE.name}, Berhampore.
            </p>
            {showFaq ? <FaqSection /> : null}
            <div className="mt-8">
              <ShowroomCtaRow from={`${path}-bottom`} />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
