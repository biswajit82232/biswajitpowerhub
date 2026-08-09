/**
 * Puppeteer-free SEO prerender fallback.
 * Copies dist/index.html into route folders and injects unique title/meta/canonical/JSON-LD/noscript.
 * Runs after vite build (+ optional puppeteer prerender). Safe to overwrite route HTML.
 *
 * Only ROUTES below get indexable SEO HTML. Extra Supabase catalog URLs get noindex stubs
 * so crawlers never see the homepage shell as duplicate content.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SEO_READY_SCOOTER_IDS } from '../src/data/seoReady.js';
import { SCOOTERS } from '../src/data/scooters.js';
import { REVIEWS } from '../src/data/reviews.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const BASE = (process.env.VITE_SITE_URL || 'https://biswajitpowerhub.in').replace(/\/$/, '');
const SEO_READY = new Set(SEO_READY_SCOOTER_IDS);
const GSC_VERIFICATION = (
  process.env.VITE_GOOGLE_SITE_VERIFICATION ||
  process.env.VITE_GSC_VERIFICATION ||
  ''
).trim();
const CATALOG = Object.fromEntries(SCOOTERS.map((s) => [s.id, s]));

const SCOOTER_SEO = {
  activa: {
    title: 'Activa Electric Scooter in Berhampore — Price, Features & Test Ride',
    description:
      'Buy Activa electric scooter at Biswajit Power Hub, Chunakhali, Berhampore. No licence required. Price ₹45,999. Book test ride. Call 096355 05436.',
    name: 'Activa Electric Scooter',
    h1: 'Activa Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  'single-light': {
    title: 'Single Light Electric Scooter in Berhampore — Price & Test Ride',
    description:
      'Buy Single Light electric scooter at Biswajit Power Hub, Chunakhali, Berhampore. No licence required. Price ₹38,999. Book test ride. Call 096355 05436.',
    name: 'Single Light Electric Scooter',
    h1: 'Single Light Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  'double-light': {
    title: 'Double Light Electric Scooter in Berhampore — Price & Test Ride',
    description:
      'Buy Double Light electric scooter at Biswajit Power Hub, Chunakhali, Berhampore. No licence required. Price ₹40,999. Book test ride. Call 096355 05436.',
    name: 'Double Light Electric Scooter',
    h1: 'Double Light Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  zoom: {
    title: 'Zoom Electric Scooter in Berhampore — Price, Features & Test Ride',
    description:
      'Buy Zoom electric scooter at Biswajit Power Hub, Chunakhali, Berhampore. No licence required. Price ₹42,999. Book test ride. Call 096355 05436.',
    name: 'Zoom Electric Scooter',
    h1: 'Zoom Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
};

function skuFor(id) {
  return `BPH-${String(id).toUpperCase().replace(/-/g, '_')}`;
}

function ratingForScooter(displayName) {
  const matched = REVIEWS.filter(
    (r) => r.status === 'approved' && r.scooter?.toLowerCase() === displayName.toLowerCase(),
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

function reviewsForScooter(displayName, limit = 5) {
  const matched = REVIEWS.filter(
    (r) => r.status === 'approved' && r.scooter?.toLowerCase() === displayName.toLowerCase(),
  ).slice(0, limit);
  if (!matched.length) return null;
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

const ROUTES = [
  {
    path: '/',
    title: 'Best Electric Scooter Dealer Berhampore | Biswajit Power Hub',
    description:
      'Biswajit Power Hub — best electric scooters in Berhampore, Murshidabad. No licence. From ₹38,999. Call 096355 05436 for test ride at Chunakhali.',
    h1: 'Biswajit Power Hub — Best Electric Scooter Dealer in Berhampore, Murshidabad',
    schema: 'local',
  },
  {
    path: '/scooters',
    title: 'Electric Scooters in Berhampore | Activa, Zoom, Single & Double Light | BPH',
    description:
      'Compare all low-speed electric scooters at Biswajit Power Hub. No licence required. Test rides available at Chunakhali, Berhampore.',
    h1: 'Electric Scooters in Berhampore',
    schema: 'faq',
  },
  ...Object.entries(SCOOTER_SEO).map(([id, seo]) => ({
    path: `/scooters/${id}`,
    title: seo.title,
    description: seo.description,
    h1: seo.h1 || seo.name,
    schema: 'product',
    productName: seo.name,
    productId: id,
  })),
  {
    path: '/best-electric-scooters-berhampore',
    title: 'Best Electric Scooters in Berhampore (2026) | Biswajit Power Hub',
    description:
      'Compare the best electric scooters in Berhampore. Activa, Zoom, Single Light & Double Light. No licence. Test ride at Chunakhali. Call 096355 05436.',
    h1: 'Best Electric Scooters in Berhampore (2026) — Top Models Compared',
    schema: 'crumbs',
    crawlText:
      'Compare Activa, Zoom, Double Light, and Single Light at Biswajit Power Hub in Berhampore and Murshidabad. Every model is a low-speed electric scooter with no licence and no RTO registration required. Prices start from ₹38,999. Visit Chunakhali Bus Stand for a free test ride, EMI options, exchange offers, and custom battery upgrades. We include 3 free servicing and 1 year motor and controller warranty.',
  },
  {
    path: '/low-budget-electric-scooters-berhampore',
    title: 'Low Budget Electric Scooters Berhampore | From ₹38,999',
    description:
      'Affordable electric scooters in Berhampore. Low budget, no licence models. EMI available. Visit Biswajit Power Hub, Chunakhali. Call 096355 05436.',
    h1: 'Low Budget Electric Scooters in Berhampore & Murshidabad — Starting ₹38,999',
    schema: 'crumbs',
    crawlText:
      'Looking for a cheap electric scooter in Berhampore? Single Light starts at approximately ₹38,999, with Double Light, Zoom, and Activa still under ₹50,000 on Standard batteries. Save on petrol with home charging around ₹0.30 to ₹0.50 per km. Ask about EMI and exchange of old scooters at our Murshidabad showroom near Chunakhali Bus Stand.',
  },
  {
    path: '/no-licence-electric-scooters-west-bengal',
    title: 'No Licence Electric Scooters in West Bengal (2026) Guide',
    description:
      'No licence, no registration electric scooters in West Bengal. Legal low-speed EVs at Biswajit Power Hub, Berhampore. Test ride today. Call 096355 05436.',
    h1: 'No Licence Electric Scooters in West Bengal (2026) — Complete Guide',
    schema: 'crumbs',
    crawlText:
      'Eligible low-speed electric scooters under 25 km/h can be ridden in West Bengal without a driving licence or RTO registration. Biswajit Power Hub in Berhampore stocks Activa, Zoom, Single Light, and Double Light models built for that category. Test ride at Chunakhali, Murshidabad, Monday to Saturday 9 AM to 8 PM.',
  },
  {
    path: '/battery-upgrade-berhampore',
    title: 'Electric Scooter Battery Upgrade in Berhampore | Extra Range',
    description:
      'Custom battery upgrades for electric scooters in Berhampore. Increase your range at Biswajit Power Hub, Chunakhali. Call 096355 05436.',
    h1: 'Electric Scooter Battery Upgrade in Berhampore — Extra Range',
    schema: 'crumbs',
    crawlText:
      'Need more range in Berhampore or Murshidabad? We fit custom higher-AH battery upgrades and stock genuine batteries, tyres, panels, and controllers. Bring your e-scooter to Chunakhali Bus Stand for a quote, or compare Lithium Pro options on Activa and Zoom before buying new.',
  },
  {
    path: '/test-ride-berhampore',
    title: 'Free Test Ride Electric Scooter in Berhampore | Book Today',
    description:
      'Free electric scooter test rides in Berhampore. No appointment needed at Biswajit Power Hub, Chunakhali. No licence models. Call 096355 05436.',
    h1: 'Free Test Ride Electric Scooter in Berhampore — Book Today',
    schema: 'crumbs',
    crawlText:
      'Free supervised test rides are available at Biswajit Power Hub, Chunakhali Bus Stand, Berhampore. No appointment needed Monday to Saturday 9 AM to 8 PM. A driving licence is not required for our low-speed models. Try Activa, Zoom, Double Light, or Single Light before you buy.',
  },
  {
    path: '/exchange-old-scooter-berhampore',
    title: 'Exchange Old Scooter in Berhampore | Biswajit Power Hub',
    description:
      'Exchange your old petrol or electric scooter in Berhampore. Free valuation at Biswajit Power Hub, Chunakhali. Call 096355 05436.',
    h1: 'Exchange Old Scooter in Berhampore — Free Valuation',
    schema: 'crumbs',
    crawlText:
      'Exchange your old petrol or electric scooter for a no-licence EV at Biswajit Power Hub in Berhampore, Murshidabad. Free on-the-spot valuation at Chunakhali Bus Stand. Apply credit toward Single Light from ₹38,999 or other models, with EMI available on the balance.',
  },
  {
    path: '/contact',
    title: 'Visit Our Showroom — Chunakhali, Berhampore | Biswajit Power Hub',
    description:
      'Visit Biswajit Power Hub at Chunakhali Bus Stand, Berhampore. Electric scooter dealer. Call 096355 05436 or WhatsApp us.',
    h1: 'Visit Our Showroom — Chunakhali, Berhampore | Biswajit Power Hub',
    schema: 'contact',
  },
  {
    path: '/reviews',
    title: 'Customer Reviews — Biswajit Power Hub, Berhampore',
    description:
      'Customer reviews of Biswajit Power Hub electric scooters in Berhampore, Murshidabad. Leave a Google review after your visit.',
    h1: 'Customer Reviews — Biswajit Power Hub, Berhampore',
    schema: 'crumbs',
  },
  {
    path: '/about',
    title: 'About Biswajit Power Hub — EV Dealer in Berhampore, Murshidabad',
    description:
      'Trusted electric scooter showroom in Berhampore, Murshidabad. No licence EVs, battery upgrades, test rides at Chunakhali Bus Stand.',
    h1: 'About Biswajit Power Hub — Trusted EV Dealer in Berhampore, Murshidabad',
    schema: 'crumbs',
  },
  {
    path: '/compare',
    title: 'Compare Electric Scooters | Biswajit Power Hub',
    description:
      'Compare electric scooter models side by side — price, range, battery options. Biswajit Power Hub, Berhampore.',
    h1: 'Compare Electric Scooters',
    schema: 'crumbs',
  },
  {
    path: '/accessories',
    title: 'Spare Parts & Accessories | Biswajit Power Hub, Berhampore',
    description:
      'Genuine spare parts and body panels for electric scooters — batteries, tyres, panels, mirrors, and more.',
    h1: 'Spare Parts & Accessories',
    schema: 'crumbs',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions | Biswajit Power Hub',
    description: 'Terms of service for Biswajit Power Hub electric scooter dealership in Berhampore, West Bengal.',
    h1: 'Terms & Conditions',
    schema: 'crumbs',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Biswajit Power Hub',
    description: 'Privacy policy for Biswajit Power Hub website. How we handle your data at our Berhampore showroom.',
    h1: 'Privacy Policy',
    schema: 'crumbs',
  },
  {
    path: '/ad-landing',
    title: 'No Licence Electric Scooters in Berhampore — Test Ride Today',
    description:
      'No licence electric scooters in Berhampore. Test ride at Biswajit Power Hub, Chunakhali. Call 096355 05436.',
    h1: 'No Licence Electric Scooters in Berhampore — Test Ride Today',
    schema: 'none',
    noindex: true,
  },
  {
    path: '/dealership',
    title: 'Dealership Inquiry | Biswajit Power Hub',
    description: 'Internal dealership inquiry page — not part of the public catalogue.',
    h1: 'Dealership',
    schema: 'none',
    noindex: true,
  },
  {
    path: '/updates',
    title: 'Updates | Biswajit Power Hub',
    description: 'Internal updates page — not part of the public catalogue.',
    h1: 'Updates',
    schema: 'none',
    noindex: true,
  },
];

function humanizeId(id) {
  return String(id)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchCatalogRows(table, select = 'id,name') {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=name.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.warn(`[fallback-prerender] Supabase ${table} fetch failed:`, e.message);
    return [];
  }
}

/** Live catalog images/prices keyed by scooter id (Supabase when available). */
async function fetchScooterEnrichment() {
  const rows = await fetchCatalogRows('scooters', 'id,name,price,images,variants');
  const map = {};
  for (const row of rows) {
    if (!row?.id) continue;
    map[row.id] = row;
  }
  return map;
}

async function buildNoindexCatalogRoutes() {
  const scooters = await fetchCatalogRows('scooters');
  const accessories = await fetchCatalogRows('accessories');
  const routes = [];

  for (const row of scooters) {
    if (!row?.id || SEO_READY.has(row.id)) continue;
    const name = row.name || humanizeId(row.id);
    routes.push({
      path: `/scooters/${row.id}`,
      title: `${name} Electric Scooter | Biswajit Power Hub, Berhampore`,
      description: `${name} electric scooter details at Biswajit Power Hub, Berhampore. Contact the showroom for availability.`,
      h1: name,
      schema: 'none',
      noindex: true,
    });
  }

  for (const row of accessories) {
    if (!row?.id) continue;
    const name = row.name || humanizeId(row.id);
    routes.push({
      path: `/accessories/${row.id}`,
      title: `${name} | Biswajit Power Hub`,
      description: `${name} spare parts and accessories at Biswajit Power Hub, Berhampore.`,
      h1: name,
      schema: 'none',
      noindex: true,
    });
  }

  return routes;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function canonicalFor(path) {
  return path === '/' ? `${BASE}/` : `${BASE}${path}`;
}

function breadcrumbSchema(path, title) {
  const parts = path === '/' ? [] : path.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` }];
  let acc = '';
  parts.forEach((p, i) => {
    acc += `/${p}`;
    const name = i === parts.length - 1 ? title.split('—')[0].split('|')[0].trim() : p;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      item: `${BASE}${acc}`,
    });
  });
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function sellerRef() {
  return {
    '@type': 'LocalBusiness',
    name: 'BISWAJIT POWER HUB',
    url: BASE,
    logo: `${BASE}/logo-512.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chunakhali Bus Stand, Nimtala',
      addressLocality: 'Berhampore',
      addressRegion: 'West Bengal',
      postalCode: '742149',
      addressCountry: 'IN',
    },
  };
}

function offerForScooter(scooter, url) {
  const variants = Array.isArray(scooter.variants) ? scooter.variants : [];
  const prices = variants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n) && n > 0);
  const seller = sellerRef();
  if (prices.length > 1) {
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    return {
      '@type': 'AggregateOffer',
      url,
      price: String(low),
      lowPrice: String(low),
      highPrice: String(high),
      offerCount: String(prices.length),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller,
    };
  }
  const price = prices[0] || Number(scooter.price) || 0;
  return {
    '@type': 'Offer',
    url,
    price: String(price),
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    seller,
  };
}

function offerCatalogItems() {
  return SCOOTERS.map((scooter) => {
    const url = `${BASE}/scooters/${scooter.id}`;
    const offer = offerForScooter(scooter, url);
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

function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'MotorcycleDealer', 'Store', 'AutoDealer'],
    '@id': `${BASE}/#dealership`,
    name: 'BISWAJIT POWER HUB',
    url: BASE,
    logo: `${BASE}/logo-512.png`,
    image: [`${BASE}/logo-512.png`, `${BASE}/og-image.png`],
    description:
      'Premium low-speed electric scooter dealer in Berhampore, West Bengal. No licence, no registration on eligible models.',
    telephone: '+919635505436',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chunakhali Bus Stand, Nimtala',
      addressLocality: 'Berhampore',
      addressRegion: 'West Bengal',
      postalCode: '742149',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude: '24.0987', longitude: '88.2519' },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/biswajitpowerhub',
      'https://www.facebook.com/BiswajitPowerHub',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Electric Scooters',
      itemListElement: offerCatalogItems(),
    },
  };
}

function productSchema(route, enrichment = {}) {
  const id = route.productId;
  const seed = CATALOG[id] || {};
  const live = enrichment[id] || {};
  const name = route.productName || live.name || seed.name || 'Electric Scooter';
  const shortName = (seed.name || live.name || name).replace(/\s*Electric Scooter$/i, '');
  const variants = Array.isArray(live.variants) && live.variants.length
    ? live.variants
    : seed.variants || [];
  const prices = variants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n) && n > 0);
  const low = prices.length ? Math.min(...prices) : Number(live.price || seed.price) || 0;
  const high = prices.length ? Math.max(...prices) : low;
  const images = (Array.isArray(live.images) ? live.images : seed.images || []).filter(Boolean);
  const rating = ratingForScooter(shortName);
  const review = reviewsForScooter(shortName);
  const seller = sellerRef();

  const offers =
    prices.length > 1
      ? {
          '@type': 'AggregateOffer',
          url: canonicalFor(route.path),
          priceCurrency: 'INR',
          price: String(low),
          lowPrice: String(low),
          highPrice: String(high),
          offerCount: String(prices.length),
          availability: 'https://schema.org/InStock',
          seller,
        }
      : {
          '@type': 'Offer',
          url: canonicalFor(route.path),
          priceCurrency: 'INR',
          price: String(low || high || 0),
          availability: 'https://schema.org/InStock',
          seller,
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    sku: skuFor(id),
    mpn: id,
    image: images.length ? images : [`${BASE}/og-image.png`],
    description:
      seed.description ||
      `Premium low-speed ${name} available at Biswajit Power Hub, Berhampore. No licence required for eligible models.`,
    brand: { '@type': 'Brand', name: seed.brand || 'PowerHub' },
    ...(rating ? { aggregateRating: rating } : {}),
    ...(review ? { review } : {}),
    offers,
  };
}

function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need a licence to ride these electric scooters?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No licence or registration is required for our low-speed electric scooter models as they comply with RTO regulations for vehicles under 25 km/h.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the range of these electric scooters?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our scooters offer ranges from about 50 km to 120 km per charge depending on the model and battery option.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is your showroom located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We are located at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you provide warranty and servicing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all our electric scooters come with motor and controller warranty plus 3 free servicing sessions.',
        },
      },
    ],
  };
}

function schemasFor(route, enrichment = {}) {
  if (route.schema === 'none' || route.noindex) return [];
  const crumbs = breadcrumbSchema(route.path, route.h1 || route.title);
  if (route.schema === 'local') return [crumbs, localBusinessSchema()];
  if (route.schema === 'faq') return [crumbs, faqSchema()];
  if (route.schema === 'product') return [crumbs, productSchema(route, enrichment)];
  return [crumbs];
}

function crawlableBody(route) {
  const h1 = escapeHtml(route.h1 || route.title);
  const desc = escapeHtml(route.description);
  const extra = route.crawlText
    ? `<p>${escapeHtml(route.crawlText)}</p>`
    : `<p>Biswajit Power Hub is a trusted electric scooter dealer in Berhampore, Murshidabad. We offer low-speed no-licence models including Activa, Zoom, Single Light, and Double Light, plus battery upgrades, exchange offers, EMI guidance, and free test rides at Chunakhali Bus Stand. Call 096355 05436 or visit Monday to Saturday, 9:00 AM to 8:00 PM (Sunday closed).</p>`;

  // Visible HTML (not noscript): React createRoot replaces #root on client load.
  // Google can read this initial HTML without executing JavaScript.
  return `<main data-seo-prerender="true" style="font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1a1a1a;">
          <h1>${h1}</h1>
          <p>${desc}</p>
          ${extra}
          <p><strong>Location:</strong> Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149</p>
          <p><strong>Phone:</strong> <a href="tel:+919635505436">+91 96355 05436</a> · <a href="https://wa.me/919635505436">WhatsApp</a></p>
          <p><a href="${BASE}/scooters">Electric scooters in Berhampore</a> · <a href="${BASE}/best-electric-scooters-berhampore">Best electric scooters Berhampore</a> · <a href="${BASE}/contact">Visit showroom</a> · <a href="${BASE}/test-ride-berhampore">Free test ride</a></p>
        </main>`;
}

function injectMeta(html, route) {
  const url = canonicalFor(route.path);
  const title = escapeHtml(route.title);
  const desc = escapeHtml(route.description);
  const og = `${BASE}/og-image.png`;

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${desc}" />`,
  );
  if (/rel="canonical"/i.test(out)) {
    out = out.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${url}" />`);
  } else {
    out = out.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`);
  }
  out = out.replace(/property="og:title"\s+content="[^"]*"/i, `property="og:title" content="${title}"`);
  out = out.replace(/property="og:description"\s+content="[^"]*"/i, `property="og:description" content="${desc}"`);
  out = out.replace(/property="og:url"\s+content="[^"]*"/i, `property="og:url" content="${url}"`);
  out = out.replace(/property="og:image"\s+content="[^"]*"/i, `property="og:image" content="${og}"`);
  out = out.replace(/name="twitter:title"\s+content="[^"]*"/i, `name="twitter:title" content="${title}"`);
  out = out.replace(/name="twitter:description"\s+content="[^"]*"/i, `name="twitter:description" content="${desc}"`);
  out = out.replace(/name="twitter:image"\s+content="[^"]*"/i, `name="twitter:image" content="${og}"`);

  // Robots: replace existing or inject
  out = out.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  const robots = route.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large';
  out = out.replace('</head>', `    <meta name="robots" content="${robots}" />\n  </head>`);

  // hreflang
  out = out.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>\s*/gi, '');
  out = out.replace(
    '</head>',
    `    <link rel="alternate" hreflang="en-IN" href="${url}" />\n    <link rel="alternate" hreflang="x-default" href="${url}" />\n  </head>`,
  );

  // Optional GSC verification (set VITE_GOOGLE_SITE_VERIFICATION in Vercel)
  out = out.replace(/<meta\s+name="google-site-verification"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  if (GSC_VERIFICATION) {
    out = out.replace(
      '</head>',
      `    <meta name="google-site-verification" content="${escapeHtml(GSC_VERIFICATION)}" />\n  </head>`,
    );
  }

  // Strip previous injected ld+json from fallback runs; keep GA scripts
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');

  const scripts = schemasFor(route, route._enrichment || {})
    .map((s) => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n');
  if (scripts) out = out.replace('</head>', `${scripts}\n  </head>`);

  const ns = crawlableBody(route);
  if (/<div id="root">[\s\S]*?<\/div>/i.test(out)) {
    out = out.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">\n      ${ns}\n    </div>`);
  } else {
    out = out.replace('<div id="root"></div>', `<div id="root">\n      ${ns}\n    </div>`);
  }

  return out;
}

function outPathFor(path) {
  if (path === '/') return join(DIST, 'index.html');
  return join(DIST, path.replace(/^\//, ''), 'index.html');
}

const shellPath = join(DIST, 'index.html');
if (!existsSync(shellPath)) {
  console.error('[fallback-prerender] dist/index.html missing');
  process.exit(1);
}

const shell = readFileSync(shellPath, 'utf8');
const enrichment = await fetchScooterEnrichment();
const catalogNoindex = await buildNoindexCatalogRoutes();
const allRoutes = [
  ...ROUTES.map((r) => (r.schema === 'product' ? { ...r, _enrichment: enrichment } : r)),
  ...catalogNoindex,
];

let count = 0;
let noindexCount = 0;
for (const route of allRoutes) {
  const html = injectMeta(shell, route);
  const out = outPathFor(route.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, 'utf8');
  count += 1;
  if (route.noindex) noindexCount += 1;
  console.log(`[fallback-prerender] ${route.path}${route.noindex ? ' (noindex)' : ''}`);
}

console.log(
  `[fallback-prerender] wrote ${count} routes for ${BASE} (${noindexCount} noindex stubs)`,
);
