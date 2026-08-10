import { useMemo } from 'react';
import { SEO } from '@/components/common/SEO';
import { HeroCarousel } from '@/components/sections/HeroCarousel';
import { ExploreRange } from '@/components/sections/ExploreRange';
import { MoreFromUs } from '@/components/sections/MoreFromUs';
import { LocateUs } from '@/components/sections/LocateUs';
import { SeoAboutBlock } from '@/components/sections/SeoAboutBlock';
import { DealerFaq } from '@/components/sections/DealerFaq';
import { DealerReviews } from '@/components/sections/DealerReviews';
import { getApprovedReviews } from '@/features/reviews/reviewService';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { useSite } from '@/context/SiteSettingsContext';
import { SITE_URL } from '@/config/site';
import {
  openingHoursSchema,
  postalAddressSchema,
  breadcrumbList,
  buildScooterOfferCatalogItems,
  faqPageSchema,
} from '@/lib/schemaHelpers';
import { SCOOTERS } from '@/data/scooters';

export default function Home() {
  const { site } = useSite();
  const { data: allScooters, loading: scootersLoading } = useAsync(() => getScooters(), []);
  const { settings: financeSettings } = useFinance();
  const { data: reviews, loading: reviewsLoading } = useAsync(() => getApprovedReviews(), []);
  const faqs = site.faqs?.length ? site.faqs : [];
  const gbp = site.gbp || {};

  const homeSchemas = useMemo(() => {
    const catalogScooters = allScooters?.length ? allScooters : SCOOTERS;
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
        sameAs: [site.social?.instagram, site.social?.facebook].filter(Boolean),
        slogan: site.tagline,
        areaServed: ['Berhampore', 'Murshidabad', 'West Bengal'],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: gbp.ratingValue,
          reviewCount: gbp.reviewCount,
          bestRating: gbp.bestRating || 5,
          worstRating: gbp.worstRating || 1,
        },
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
        sameAs: [site.social?.instagram, site.social?.facebook].filter(Boolean),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: SITE_URL,
      },
      faqPageSchema(faqs),
    ];
  }, [site, allScooters, faqs, gbp]);

  const modelGrid = useMemo(() => {
    const list = allScooters?.length ? allScooters : SCOOTERS;
    return list;
  }, [allScooters]);

  const reviewAvg = reviews?.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : String(gbp.ratingValue ?? 4.8);

  return (
    <>
      <SEO
        title="Best Electric Scooter Dealer Berhampore | Biswajit Power Hub"
        path="/"
        description="Biswajit Power Hub — best electric scooters in Berhampore, Murshidabad. No licence. From ₹38,999. Call 096355 05436 for test ride at Chunakhali."
        jsonLd={homeSchemas}
        titleTemplate={false}
      />

      <HeroCarousel heroImageUrl={financeSettings?.heroImageUrl} />
      <ExploreRange scooters={modelGrid} loading={scootersLoading} />
      <MoreFromUs />
      <LocateUs />
      <SeoAboutBlock />
      <DealerFaq faqs={faqs} />
      <DealerReviews
        reviews={reviews || []}
        loading={reviewsLoading}
        avg={reviewAvg}
      />
    </>
  );
}
