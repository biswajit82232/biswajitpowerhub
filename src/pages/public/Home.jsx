import { useMemo } from 'react';
import { SEO } from '@/components/common/SEO';
import { HeroCarousel } from '@/components/sections/HeroCarousel';
import { ExploreRange } from '@/components/sections/ExploreRange';
import { MoreFromUs } from '@/components/sections/MoreFromUs';
import { LocateUs } from '@/components/sections/LocateUs';
import { SeoAboutBlock } from '@/components/sections/SeoAboutBlock';
import { DealerFaq } from '@/components/sections/DealerFaq';
import { GoogleReviewsWidget } from '@/components/sections/GoogleReviewsWidget';
import { PromotionalOffers } from '@/components/sections/PromotionalOffers';
import { getApprovedReviews } from '@/features/reviews/reviewService';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { useSite } from '@/context/SiteSettingsContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { SITE_URL, siteSameAs } from '@/config/site';
import { optimizedImageUrl, isSupabaseStorageUrl } from '@/lib/imageCdn';
import {
  openingHoursSchema,
  postalAddressSchema,
  breadcrumbList,
  buildScooterOfferCatalogItems,
  faqPageSchema,
  siteAggregateRating,
  siteReviewsSchema,
} from '@/lib/schemaHelpers';
import { SCOOTERS } from '@/data/scooters';
import { buildSiteFaqs, formatCatalogFromPrice } from '@/lib/catalogCopy';
import { SITE_FAQS } from '@/data/seoContent';

export default function Home() {
  const { site } = useSite();
  const { photos } = useSitePhotos();
  const { data: allScooters, loading: scootersLoading } = useAsync(() => getScooters(), []);
  const { settings: financeSettings } = useFinance();
  // On-site reviews still feed JSON-LD only; the visible Home block is GoogleReviewsWidget.
  const { data: reviews } = useAsync(() => getApprovedReviews(), []);
  const catalog = allScooters?.length ? allScooters : SCOOTERS;
  const fromPrice = formatCatalogFromPrice(catalog);
  const faqs = useMemo(
    () => buildSiteFaqs(site.faqs?.length ? site.faqs : SITE_FAQS, catalog),
    [site.faqs, catalog],
  );

  const heroSrc = photos?.hero?.url || financeSettings?.heroImageUrl || null;
  const preloadImage = heroSrc
    ? isSupabaseStorageUrl(heroSrc)
      ? optimizedImageUrl(heroSrc, 960, 72, { height: 420, resize: 'cover' })
      : heroSrc
    : undefined;

  const homeSchemas = useMemo(() => {
    const catalogScooters = catalog;
    // Rating must come from real on-site reviews — never a hand-typed number.
    // Omit entirely until there are genuine reviews to back it, per Google's
    // rich-result guidelines. Visible Google reviews use a separate widget.
    const aggregateRating = siteAggregateRating(reviews);
    const review = siteReviewsSchema(reviews);
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
        ...(aggregateRating ? { aggregateRating } : {}),
        ...(review ? { review } : {}),
        ...(catalogScooters.length
          ? {
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Electric Scooters',
                itemListElement: buildScooterOfferCatalogItems(catalogScooters, site),
              },
            }
          : {}),
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
  }, [site, catalog, faqs, reviews]);

  const modelGrid = useMemo(() => catalog, [catalog]);

  return (
    <>
      <SEO
        title="Best Electric Scooter Dealer Berhampore | Biswajit Power Hub"
        path="/"
        description={`Biswajit Power Hub — best electric scooters in Berhampore, Murshidabad. No licence.${fromPrice ? ` From ${fromPrice}.` : ''} Call 096355 05436 for test ride at Chunakhali.`}
        jsonLd={homeSchemas}
        titleTemplate={false}
        preloadImage={preloadImage}
      />

      <HeroCarousel heroImageUrl={financeSettings?.heroImageUrl} />
      <PromotionalOffers compact />
      <ExploreRange scooters={modelGrid} loading={scootersLoading} />
      <MoreFromUs />
      <LocateUs />
      <SeoAboutBlock />
      <DealerFaq faqs={faqs} />
      <GoogleReviewsWidget />
    </>
  );
}
