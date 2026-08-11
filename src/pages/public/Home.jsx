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
import { SITE_URL } from '@/config/site';
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

export default function Home() {
  const { site } = useSite();
  const { data: allScooters, loading: scootersLoading } = useAsync(() => getScooters(), []);
  const { settings: financeSettings } = useFinance();
  // On-site reviews still feed JSON-LD only; the visible Home block is GoogleReviewsWidget.
  const { data: reviews } = useAsync(() => getApprovedReviews(), []);
  const faqs = useMemo(() => (site.faqs?.length ? site.faqs : []), [site.faqs]);

  const homeSchemas = useMemo(() => {
    const catalogScooters = allScooters?.length ? allScooters : SCOOTERS;
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
        sameAs: [site.social?.instagram, site.social?.facebook].filter(Boolean),
        slogan: site.tagline,
        areaServed: [
          'Berhampore',
          'Murshidabad',
          'Kandi',
          'Jiaganj',
          'Beldanga',
          'Lalbagh',
          'Domkal',
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
  }, [site, allScooters, faqs, reviews]);

  const modelGrid = useMemo(() => {
    const list = allScooters?.length ? allScooters : SCOOTERS;
    return list;
  }, [allScooters]);

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
