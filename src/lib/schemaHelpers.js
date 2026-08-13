import { DAY_KEYS, DAY_LABELS, SITE, SITE_URL } from '@/config/site';
import { getScooterVariants, getStartingPrice } from '@/lib/scooterVariants';
import { SITE_FAQS, MODEL_SEO_META } from '@/data/seoContent';
import { SEO_READY_SCOOTER_IDS } from '@/data/seoReady';

const SCHEMA_DAYS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/** Schema.org OpeningHoursSpecification from admin hours */
export function openingHoursSchema(hoursPerDay) {
  if (!hoursPerDay) return undefined;
  const specs = DAY_KEYS.map((day) => {
    const d = hoursPerDay[day];
    if (!d || d.closed) return null;
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAYS[day] || DAY_LABELS[day],
      opens: d.open,
      closes: d.close,
    };
  }).filter(Boolean);
  if (!specs.length) return undefined;
  const sameHours = specs.every((s) => s.opens === specs[0].opens && s.closes === specs[0].closes);
  if (sameHours && specs.length > 1) {
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: specs.map((s) => s.dayOfWeek),
        opens: specs[0].opens,
        closes: specs[0].closes,
      },
    ];
  }
  return specs;
}

/** PostalAddress from site settings — includes district in street when present */
export function postalAddressSchema(address) {
  const a = address || SITE.address;
  const street = [a.line, a.district].filter(Boolean).join(', ');
  return {
    '@type': 'PostalAddress',
    streetAddress: street || a.line,
    addressLocality: a.city,
    addressRegion: a.state,
    postalCode: a.pincode,
    addressCountry: 'IN',
  };
}

/** Compact LocalBusiness reference for Product seller, etc. */
export function localBusinessRef(site = SITE) {
  return {
    '@type': 'LocalBusiness',
    name: SITE.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512.png`,
    image: `${SITE_URL}/logo-512.png`,
    telephone: `+91${site.phones?.[0] || SITE.phones[0]}`,
    address: postalAddressSchema(site.address),
  };
}

/**
 * BreadcrumbList from [{ name, path }] — path is absolute path like /scooters/activa
 */
export function breadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const path = item.path || '/';
      const itemUrl =
        path === '/' ? `${SITE_URL}/` : `${SITE_URL}${String(path).replace(/\/$/, '')}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: itemUrl,
      };
    }),
  };
}

export function faqPageSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export const SCOOTER_FAQS = SITE_FAQS;

/** SEO copy keyed by scooter id */
export const SCOOTER_SEO = {
  activa: MODEL_SEO_META.activa,
  'single-light': MODEL_SEO_META['single-light'],
  'double-light': MODEL_SEO_META['double-light'],
  zoom: MODEL_SEO_META.zoom,
};

/** Stable product identifier for schema / inventory (e.g. BPH-ACTIVA) */
export function productSku(scooterId) {
  return `BPH-${String(scooterId || '').toUpperCase().replace(/-/g, '_')}`;
}

/** Schema.org availability URL from stock status */
export function productAvailability(stock) {
  return stock === 'out_of_stock'
    ? 'https://schema.org/OutOfStock'
    : 'https://schema.org/InStock';
}

/** Single Offer block — price must be a string for Google Product rich results */
export function buildProductOffer({ url, price, priceCurrency = 'INR', stock = 'in_stock', seller }) {
  return {
    '@type': 'Offer',
    url,
    price: String(price),
    priceCurrency,
    availability: productAvailability(stock),
    itemCondition: 'https://schema.org/NewCondition',
    priceValidUntil: '2026-12-31',
    ...(seller ? { seller } : {}),
  };
}

/** AggregateOffer for scooters with battery variants */
export function buildAggregateProductOffer({
  url,
  lowPrice,
  highPrice,
  offerCount,
  stock = 'in_stock',
  seller,
}) {
  return {
    '@type': 'AggregateOffer',
    url,
    price: String(lowPrice),
    lowPrice: String(lowPrice),
    highPrice: String(highPrice),
    offerCount: String(offerCount),
    priceCurrency: 'INR',
    availability: productAvailability(stock),
    itemCondition: 'https://schema.org/NewCondition',
    priceValidUntil: '2026-12-31',
    ...(seller ? { seller } : {}),
  };
}

/** Review[] for a product from approved reviews */
export function productReviewsSchema(reviews, scooterName, limit = 5) {
  if (!Array.isArray(reviews) || !scooterName) return undefined;
  const matched = reviews
    .filter(
      (r) => r?.scooter && String(r.scooter).toLowerCase() === String(scooterName).toLowerCase(),
    )
    .slice(0, limit);
  if (!matched.length) return undefined;
  return matched.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    ...(r.created_at ? { datePublished: r.created_at } : {}),
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: r.review,
  }));
}

/**
 * Valid Product schema for a scooter — includes required offers and optional
 * aggregateRating / review when review data is available.
 */
export function buildScooterProductSchema(scooter, { reviews, site } = {}) {
  if (!scooter) return null;
  const seller = localBusinessRef(site);
  const variants = getScooterVariants(scooter);
  const url = `${SITE_URL}/scooters/${scooter.id}`;
  const productImages = (scooter.images || []).filter(Boolean);
  const aggregateRating = reviews ? productAggregateRating(reviews, scooter.name) : null;
  const review = reviews ? productReviewsSchema(reviews, scooter.name) : undefined;

  let offers;
  if (variants.length) {
    const prices = variants.map((v) => v.price);
    offers = buildAggregateProductOffer({
      url,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: variants.length,
      stock: scooter.stock,
      seller,
    });
  } else {
    offers = buildProductOffer({
      url,
      price: scooter.price,
      stock: scooter.stock,
      seller,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${scooter.name} Electric Scooter`,
    sku: productSku(scooter.id),
    mpn: scooter.id,
    url,
    image: productImages.length ? productImages : [`${SITE_URL}/og-image.png`],
    brand: { '@type': 'Brand', name: scooter.brand || 'PowerHub' },
    description: scooter.description,
    offers,
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(review ? { review } : {}),
  };
}

/** OfferCatalog itemListElement entries for LocalBusiness hasOfferCatalog */
export function buildScooterOfferCatalogItems(scooters, site) {
  if (!Array.isArray(scooters)) return [];
  const seller = localBusinessRef(site);
  const ready = new Set(SEO_READY_SCOOTER_IDS);
  return scooters.filter((scooter) => ready.has(scooter.id)).map((scooter) => {
    const url = `${SITE_URL}/scooters/${scooter.id}`;
    const variants = getScooterVariants(scooter);
    const startingPrice = getStartingPrice(scooter);
    const offer =
      variants.length > 1
        ? buildAggregateProductOffer({
            url,
            lowPrice: Math.min(...variants.map((v) => v.price)),
            highPrice: Math.max(...variants.map((v) => v.price)),
            offerCount: variants.length,
            stock: scooter.stock,
            seller,
          })
        : buildProductOffer({
            url,
            price: startingPrice,
            stock: scooter.stock,
            seller,
          });
    return {
      ...offer,
      itemOffered: {
        '@type': 'Product',
        name: `${scooter.name} Electric Scooter`,
        url,
        offers: offer,
      },
    };
  });
}

/** Valid Product schema for an accessory */
export function buildAccessoryProductSchema(accessory, { site } = {}) {
  if (!accessory) return null;
  const url = `${SITE_URL}/accessories/${accessory.id}`;
  const seller = localBusinessRef(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: accessory.name,
    sku: accessory.id,
    url,
    image: accessory.images?.[0] || `${SITE_URL}/logo-512.png`,
    description: accessory.description,
    category: accessory.category,
    offers: buildProductOffer({
      url,
      price: accessory.price,
      stock: accessory.stock,
      seller,
    }),
  };
}

/** Minimal Product reference for Review.itemReviewed (must include offers) */
export function buildReviewedProductRef(scooter) {
  if (!scooter) return null;
  const url = `${SITE_URL}/scooters/${scooter.id}`;
  const startingPrice = getStartingPrice(scooter);
  return {
    '@type': 'Product',
    name: `${scooter.name} Electric Scooter`,
    url,
    offers: buildProductOffer({
      url,
      price: startingPrice,
      stock: scooter.stock,
    }),
  };
}


/**
 * Site-wide AggregateRating from all approved on-site reviews, regardless of
 * which scooter they mention. Use on the community page LocalBusiness only —
 * do not also nest this on the homepage (duplicate graphs with the same @id
 * trigger GSC "Review has multiple aggregate ratings"). Returns null when
 * there are no real reviews yet so callers omit aggregateRating rather than
 * fabricate rich-result eligibility with content that isn't actually on the page.
 */
export function siteAggregateRating(reviews) {
  if (!Array.isArray(reviews) || !reviews.length) return null;
  const valid = reviews.filter((r) => Number(r?.rating) > 0);
  if (!valid.length) return null;
  const sum = valid.reduce((a, r) => a + Number(r.rating), 0);
  return {
    '@type': 'AggregateRating',
    ratingValue: (sum / valid.length).toFixed(1),
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(valid.length),
  };
}

/**
 * Review[] for schema.org, built from real approved on-site reviews (not
 * scoped to a single product). Mirrors the shape Google expects for
 * LocalBusiness.review — pairs with `siteAggregateRating`.
 */
export function siteReviewsSchema(reviews, limit = 5) {
  if (!Array.isArray(reviews) || !reviews.length) return undefined;
  const valid = reviews.filter((r) => Number(r?.rating) > 0).slice(0, limit);
  if (!valid.length) return undefined;
  return valid.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    ...(r.created_at ? { datePublished: r.created_at } : {}),
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: r.review,
  }));
}

/**
 * AggregateRating from approved reviews for a scooter display name.
 * Returns null when there are fewer than 1 matching reviews (omit from schema).
 */
export function productAggregateRating(reviews, scooterName) {
  if (!Array.isArray(reviews) || !scooterName) return null;
  const matched = reviews.filter(
    (r) => r?.scooter && String(r.scooter).toLowerCase() === String(scooterName).toLowerCase(),
  );
  if (!matched.length) return null;
  const sum = matched.reduce((a, r) => a + Number(r.rating || 0), 0);
  return {
    '@type': 'AggregateRating',
    ratingValue: (sum / matched.length).toFixed(1),
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(matched.length),
  };
}
