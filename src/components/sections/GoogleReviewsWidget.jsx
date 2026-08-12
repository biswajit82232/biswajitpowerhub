import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { SITE } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';

const SCRIPT_SRC = 'https://www.replyonthefly.com/widget/reviews.js';
const FALLBACK_PLACE_ID = 'ChIJP_miqYx9-TkR9z1fb-iGyxI';

function buildSeedHtml(placeId) {
  return `<div data-rotf-seed="${placeId}"><!-- Google reviews for BISWAJIT POWER HUB — crawlable seed; live widget replaces this on load. --><blockquote><p>I recently visited Biswajit Power Hub at the Chunakhali Bus Stand, and I am extremely satisfied with my experience. The staff members are incredibly polite, professional, and patient.</p><cite>Sumi Barman — 5 out of 5 on Google on <time datetime="2026-08-10">August 10, 2026</time></cite></blockquote><blockquote><p>Had a great experience at Biswajit Powerhub. The staff was friendly, helpful, and explained everything clearly before the purchase. The electric scooty was delivered in excellent condition, and the overall buying process was smooth and hassle-free. They also provided proper guidance about the features, usage, and after-sales service. Highly recommended for anyone looking for a reliable electric scooty and good customer service.</p><cite>Biswajit Howladar — 5 out of 5 on Google on <time datetime="2026-08-10">August 10, 2026</time></cite></blockquote><blockquote><p>Very good service and professional</p><cite>Tintu Dey — 5 out of 5 on Google on <time datetime="2026-08-10">August 10, 2026</time></cite></blockquote><blockquote><p>Good quality scooter</p><cite>Mithun Howladar — 5 out of 5 on Google on <time datetime="2026-08-10">August 10, 2026</time></cite></blockquote><blockquote><p>All good ♥️shop</p><cite>DIP DIP — 5 out of 5 on Google on <time datetime="2026-02-20">February 20, 2026</time></cite></blockquote><blockquote><p>All very good 💯</p><cite>Biswajit Howladar — 5 out of 5 on Google on <time datetime="2026-02-18">February 18, 2026</time></cite></blockquote><blockquote><p>Ummm excellent 👌</p><cite>Soumya Sarkar — 5 out of 5 on Google on <time datetime="2025-11-26">November 26, 2025</time></cite></blockquote><blockquote><p>Excellent scooty and battery showroom. The staff was extremely helpful and guided me patiently through scooty models and battery options. Pricing is reasonable and battery performance is reliable for city rides. Highly recommended.</p><cite>Srija Halder — 5 out of 5 on Google on <time datetime="2025-11-26">November 26, 2025</time></cite></blockquote><p><a href="https://www.replyonthefly.com/tools/google-reviews-widget?utm_source=embed-seed&utm_medium=referral&utm_campaign=reviews-widget-badge" rel="noopener">Reviews by ReplyOnTheFly</a></p></div>`;
}

/**
 * ReplyOnTheFly Google reviews embed — seed stays crawlable; third-party script
 * loads only when the section scrolls near the viewport (saves home page weight).
 */
export function GoogleReviewsWidget() {
  const hostRef = useRef(null);
  const sectionRef = useRef(null);
  const { site } = useSite();
  const placeId = (site?.maps?.placeId || SITE.maps.placeId || FALLBACK_PLACE_ID).trim();
  const [loadWidget, setLoadWidget] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !placeId) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setLoadWidget(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoadWidget(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [placeId]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !placeId) return undefined;

    host.innerHTML = buildSeedHtml(placeId);
    if (!loadWidget) return undefined;

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute('data-place-id', placeId);
    script.setAttribute('data-layout', 'carousel');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-min-rating', '4');
    script.setAttribute('data-size', '2');
    script.setAttribute('data-autoplay', '4');
    script.setAttribute('data-max-reviews', '10');
    host.appendChild(script);

    return () => {
      host.innerHTML = '';
    };
  }, [placeId, loadWidget]);

  return (
    <section
      ref={sectionRef}
      className="border-t border-line bg-surface-alt py-8 sm:py-12 md:py-14"
      aria-labelledby="reviews-heading"
    >
      <div className="container-px">
        <h2 id="reviews-heading" className="dealer-section-title !text-left">
          Customer Reviews for {SITE.name}, Berhampore
        </h2>

        <div
          ref={hostRef}
          className="google-reviews-embed mt-6 min-h-[12rem] w-full min-w-0 sm:mt-8 sm:min-h-[14rem]"
        />

        <div className="mt-8 text-center">
          <Button to="/community" variant="dealerSecondary" size="dealer">
            Our Community
          </Button>
        </div>
      </div>
    </section>
  );
}
