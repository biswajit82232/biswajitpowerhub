import { lazyRetry as lazy } from '@/lib/lazyRetry';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { SEO } from '@/components/common/SEO';
import { HeroCarousel } from '@/components/sections/HeroCarousel';
import { ExploreRange } from '@/components/sections/ExploreRange';
import { PromotionalOffers } from '@/components/sections/PromotionalOffers';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { useSite } from '@/context/SiteSettingsContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { SITE_URL, siteSameAs } from '@/config/site';
import { heroImageSources } from '@/lib/imageCdn';
import {
  openingHoursSchema,
  postalAddressSchema,
  breadcrumbList,
  faqPageSchema,
} from '@/lib/schemaHelpers';
import { SCOOTERS } from '@/data/scooters';
import { buildSiteFaqs, formatCatalogFromPrice } from '@/lib/catalogCopy';
import { SITE_FAQS } from '@/data/seoContent';
import { SoftBoundary } from '@/components/common/ErrorBoundary';

const MoreFromUs = lazy(() =>
  import('@/components/sections/MoreFromUs').then((m) => ({ default: m.MoreFromUs })),
);
const LocateUs = lazy(() =>
  import('@/components/sections/LocateUs').then((m) => ({ default: m.LocateUs })),
);
const SeoAboutBlock = lazy(() =>
  import('@/components/sections/SeoAboutBlock').then((m) => ({ default: m.SeoAboutBlock })),
);
const DealerFaq = lazy(() =>
  import('@/components/sections/DealerFaq').then((m) => ({ default: m.DealerFaq })),
);
const GoogleReviewsWidget = lazy(() =>
  import('@/components/sections/GoogleReviewsWidget').then((m) => ({
    default: m.GoogleReviewsWidget,
  })),
);

function HomeChunk({ children }) {
  return (
    <SoftBoundary>
      <Suspense fallback={null}>{children}</Suspense>
    </SoftBoundary>
  );
}

/** Below-fold home blocks — deferred so first paint / TBT stay light. */
function DeferredHomeTail({ faqs }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId;
    let timeoutId;
    const enable = () => setReady(true);
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 2200 });
    } else {
      timeoutId = window.setTimeout(enable, 900);
    }
    return () => {
      if (idleId != null && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <HomeChunk>
        <MoreFromUs />
      </HomeChunk>
      <HomeChunk>
        <LocateUs />
      </HomeChunk>
      <HomeChunk>
        <SeoAboutBlock />
      </HomeChunk>
      <HomeChunk>
        <DealerFaq faqs={faqs} />
      </HomeChunk>
      <HomeChunk>
        <GoogleReviewsWidget />
      </HomeChunk>
    </>
  );
}

export default function Home() {
  const { site } = useSite();
  const { photos } = useSitePhotos();
  const { data: allScooters, loading: scootersLoading } = useAsync(() => getScooters(), []);
  const { settings: financeSettings } = useFinance();
  const catalog = allScooters?.length ? allScooters : SCOOTERS;
  const fromPrice = formatCatalogFromPrice(catalog);
  const faqs = useMemo(
    () => buildSiteFaqs(site.faqs?.length ? site.faqs : SITE_FAQS, catalog),
    [site.faqs, catalog],
  );

  const heroSrc = photos?.hero?.url || financeSettings?.heroImageUrl || null;
  const heroPreload = heroSrc ? heroImageSources(heroSrc) : null;
  // Prefer seed catalog immediately — skeleton→card swap was a major CLS culprit.
  const showModelSkeletons = scootersLoading && !(allScooters?.length || SCOOTERS.length);

  const homeSchemas = useMemo(() => {
    // Homepage LocalBusiness is NAP + hours only. Nested Review + AggregateRating
    // here (and again after React hydrates prerendered JSON-LD) made Google report
    // "Review has multiple aggregate ratings". Product Offers on the homepage also
    // triggered Merchant listings checks we cannot pass (no online checkout/shipping).
    // Reviews live on /community; product Offers live on /scooters/:id.
    return [
      breadcrumbList([{ name: 'Home', path: '/' }]),
      {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'MotorcycleDealer', 'Store', 'AutoDealer'],
        '@id': `${SITE_URL}/#dealership`,
        name: site.name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-512.png`,
        image: [`${SITE_URL}/logo-512.png`, `${SITE_URL}/og-image.png`],
        description: site.description,
        telephone: `+91${site.phones[0]}`,
        priceRange: '₹₹',
        address: postalAddressSchema(site.address),
        geo: {
          '@type': 'GeoCoordinates',
          latitude: site.geo.latitude,
          longitude: site.geo.longitude,
        },
        hasMap: site.maps?.link,
        openingHoursSpecification: openingHoursSchema(site.hoursPerDay),
        sameAs: siteSameAs(site),
        slogan: site.tagline,
        areaServed: [
          'Berhampore',
          'Cossimbazar',
          'Murshidabad',
          'Lalbagh',
          'Jiaganj',
          'Azimganj',
          'Raninagar',
          'Beldanga',
          'Nabagram',
          'Hariharpara',
          'Chaltia',
          'Gora Bazar',
          'Daulatabad',
          'Domkal',
          'Lalgola',
          'Kandi',
          'Bhagawangola',
          'West Bengal',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: site.name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-512.png`,
        sameAs: siteSameAs(site),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: SITE_URL,
      },
      ...(faqs.length ? [faqPageSchema(faqs)] : []),
    ];
  }, [site, faqs]);

  const modelGrid = useMemo(() => catalog, [catalog]);

  return (
    <>
      <SEO
        title="Best Electric Scooter Dealer Berhampore | Biswajit Power Hub"
        path="/"
        description={`Biswajit Power Hub — best electric scooters in Berhampore, Murshidabad. No licence.${fromPrice ? ` From ${fromPrice}.` : ''} Call 096355 05436 for test ride at Chunakhali.`}
        jsonLd={homeSchemas}
        titleTemplate={false}
        preloadImage={heroPreload?.href}
        preloadImageSrcSet={heroPreload?.srcSet}
        preloadImageSizes={heroPreload?.sizes}
      />

      <HeroCarousel heroImageUrl={financeSettings?.heroImageUrl} />
      <PromotionalOffers compact />
      <ExploreRange scooters={modelGrid} loading={showModelSkeletons} />
      <DeferredHomeTail faqs={faqs} />
    </>
  );
}
