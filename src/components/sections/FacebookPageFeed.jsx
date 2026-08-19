import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { facebookPagePluginSrc } from '@/lib/facebookEmbed';
import { useLocale } from '@/context/LocaleContext';

function usePluginSize() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(440);
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;

    const applyWidth = () => {
      const w = box.clientWidth;
      if (w) setWidth(Math.min(500, Math.max(180, Math.floor(w))));
    };

    const mq = window.matchMedia('(min-width: 768px)');
    const applyHeight = () => setHeight(mq.matches ? 600 : 440);

    applyWidth();
    applyHeight();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(applyWidth) : null;
    ro?.observe(box);
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', applyHeight);
    else if (typeof mq.addListener === 'function') mq.addListener(applyHeight);

    return () => {
      ro?.disconnect();
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', applyHeight);
      else if (typeof mq.removeListener === 'function') mq.removeListener(applyHeight);
    };
  }, []);

  return { boxRef, width, height };
}

/**
 * Official Meta Page Plugin (timeline). Free, no token, updates with the Page.
 */
export function FacebookPageFeed({ pageUrl }) {
  const { t } = useLocale();
  const { boxRef, width, height } = usePluginSize();
  const [load, setLoad] = useState(false);
  const src = facebookPagePluginSrc(pageUrl, width || 500, height);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setLoad(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '240px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pageUrl]);

  if (!src || !pageUrl) return null;

  return (
    <section
      id="photos"
      className="scroll-mt-[calc(var(--header-offset)+0.75rem)] bg-white py-8 sm:py-12"
      aria-labelledby="facebook-feed-heading"
    >
      <div className="container-px">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(500px,100%)] lg:gap-10">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
              {t('social.facebook')}
            </p>
            <h2 id="facebook-feed-heading" className="dealer-section-title mt-2 !text-left">
              {t('social.feedTitle')}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-body sm:text-base">
              {t('social.feedSub')}
            </p>
            <p className="mt-3 max-w-md text-sm text-muted">{t('social.feedBlank')}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button href={pageUrl} variant="dealerPrimary" size="dealer">
                {t('social.openFacebook')}
              </Button>
            </div>
          </div>

          <div ref={boxRef} className="mx-auto w-full min-w-0 max-w-[500px] lg:mx-0">
            <div
              className="overflow-hidden border border-line bg-surface-alt shadow-soft"
              style={{ height, width: width || '100%' }}
            >
              {load && width > 0 ? (
                <iframe
                  title={t('social.feedTitle')}
                  src={src}
                  width={width}
                  height={height}
                  className="block max-w-full border-0"
                  scrolling="no"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div
                  className="flex h-full flex-col justify-center gap-4 px-5"
                  aria-busy="true"
                  aria-label={t('social.feedLoading')}
                >
                  <div className="h-10 w-10 animate-pulse rounded-full bg-line" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
                  <div className="h-32 animate-pulse rounded bg-line" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-line" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
