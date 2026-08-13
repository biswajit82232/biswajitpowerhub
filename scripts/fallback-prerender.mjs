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
import { SERVICE_LOCATIONS } from '../src/data/locations.js';
import { BLOG_POSTS } from '../src/data/blogPosts.js';
import { ACCESSORIES } from '../src/data/accessories.js';
import { loadEnv } from './load-env.mjs';

const loadedEnv = loadEnv();
for (const [k, v] of Object.entries(loadedEnv)) {
  if (process.env[k] == null && v != null) process.env[k] = v;
}

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

const SCOOTER_SEO_META = {
  activa: {
    title: 'Activa Electric Scooter Berhampore — Price & Test Ride',
    name: 'Activa Electric Scooter',
    h1: 'Activa Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  'single-light': {
    title: 'Single Light Electric Scooter Berhampore — Price',
    name: 'Single Light Electric Scooter',
    h1: 'Single Light Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  'double-light': {
    title: 'Double Light Electric Scooter Berhampore — Price',
    name: 'Double Light Electric Scooter',
    h1: 'Double Light Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  zoom: {
    title: 'Zoom Electric Scooter Berhampore — Price & Test Ride',
    name: 'Zoom Electric Scooter',
    h1: 'Zoom Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
};

function formatINR(value) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Number(value));
}

function startingPriceOf(scooter) {
  const variants = Array.isArray(scooter?.variants) ? scooter.variants : [];
  const prices = variants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length) return Math.min(...prices);
  const p = Number(scooter?.price);
  return Number.isFinite(p) && p > 0 ? p : null;
}

/** Merge seed scooters with live Supabase enrichment (admin inventory). */
function mergeCatalog(enrichment = {}) {
  return SCOOTERS.map((seed) => {
    const live = enrichment[seed.id] || {};
    const variants =
      Array.isArray(live.variants) && live.variants.length ? live.variants : seed.variants;
    return {
      ...seed,
      ...live,
      id: seed.id,
      name: live.name || seed.name,
      price: live.price ?? seed.price,
      variants,
      description: live.description || seed.description,
    };
  }).sort((a, b) => (startingPriceOf(a) || 0) - (startingPriceOf(b) || 0));
}

function catalogFromPrice(catalog) {
  const prices = catalog.map(startingPriceOf).filter((n) => n != null);
  if (!prices.length) return null;
  return formatINR(Math.min(...prices));
}

function priceListPhrase(catalog) {
  return catalog
    .map((s) => {
      const p = formatINR(startingPriceOf(s));
      return p ? `${s.name} from ${p}` : s.name;
    })
    .join(', ');
}

function buildScooterSeo(id, catalog) {
  const meta = SCOOTER_SEO_META[id] || {};
  const scooter = catalog.find((s) => s.id === id) || CATALOG[id] || {};
  const price = formatINR(startingPriceOf(scooter));
  const short = (scooter.name || meta.name || 'Scooter').replace(/\s*Electric Scooter$/i, '');
  return {
    title: meta.title || `${short} Electric Scooter Berhampore — Price & Test Ride`,
    description: `Buy ${short} at Biswajit Power Hub, Chunakhali, Berhampore. No licence required.${price ? ` From ${price}.` : ''} Book test ride. Call 096355 05436.`,
    name: meta.name || `${short} Electric Scooter`,
    h1: meta.h1 || `${short} Electric Scooter in Berhampore — Price, Features & Test Ride`,
  };
}

function skuFor(id) {
  return `BPH-${String(id).toUpperCase().replace(/-/g, '_')}`;
}

function ratingForScooter(reviews, displayName) {
  const matched = (reviews || []).filter(
    (r) => Number(r.rating) > 0 && r.scooter?.toLowerCase() === displayName.toLowerCase(),
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

function reviewsForScooter(reviews, displayName, limit = 5) {
  const matched = (reviews || [])
    .filter((r) => Number(r.rating) > 0 && r.scooter?.toLowerCase() === displayName.toLowerCase())
    .slice(0, limit);
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

/** Site-wide AggregateRating from real approved reviews — mirrors src/lib/schemaHelpers.js
 *  siteAggregateRating(). Returns null (omit from schema) when there are none yet. */
function siteAggregateRatingForBuild(reviews) {
  const valid = (reviews || []).filter((r) => Number(r?.rating) > 0);
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

/** Review[] from real approved reviews — mirrors siteReviewsSchema(). */
function siteReviewsSchemaForBuild(reviews, limit = 5) {
  const valid = (reviews || []).filter((r) => Number(r?.rating) > 0).slice(0, limit);
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

function buildRoutes(catalog) {
  const fromPrice = catalogFromPrice(catalog);
  const fromBit = fromPrice ? ` From ${fromPrice}.` : '';
  const pricesPhrase = priceListPhrase(catalog);

  return [
  {
    path: '/',
    title: 'Best Electric Scooter Dealer Berhampore | Biswajit Power Hub',
    description:
      `Biswajit Power Hub — best electric scooters in Berhampore, Murshidabad. No licence.${fromBit} Call 096355 05436 for test ride at Chunakhali.`,
    h1: 'Biswajit Power Hub — Best Electric Scooter Dealer in Berhampore, Murshidabad',
    schema: 'local',
    crawlText:
      `Best electric scooters in Berhampore at Biswajit Power Hub, Chunakhali Bus Stand, Murshidabad. Popular models: Activa, Zoom, Single Light and Double Light — no licence required.${fromBit} Why choose Biswajit Power Hub? Honest pricing, free test rides, EMI, and custom battery upgrades with genuine spare parts. Visit any day 9 AM to 8:30 PM. Call 096355 05436. FAQ covers licence rules, live showroom prices, range, EMI.`,
  },
  {
    path: '/scooters',
    title: 'Electric Scooters in Berhampore | Activa, Zoom & More',
    description:
      'Compare all low-speed electric scooters at Biswajit Power Hub. No licence required. Test rides available at Chunakhali, Berhampore.',
    h1: 'Electric Scooters in Berhampore',
    schema: 'faq',
  },
  ...Object.keys(SCOOTER_SEO_META).map((id) => {
    const seo = buildScooterSeo(id, catalog);
    return {
      path: `/scooters/${id}`,
      title: seo.title,
      description: seo.description,
      h1: seo.h1 || seo.name,
      schema: 'product',
      productName: seo.name,
      productId: id,
    };
  }),
  {
    path: '/best-electric-scooters-berhampore',
    title: 'Best Electric Scooters in Berhampore (2026) | Biswajit Power Hub',
    description:
      `Compare the best electric scooters in Berhampore${fromPrice ? ` from ${fromPrice}` : ''}. Live showroom prices. No licence. Test ride at Chunakhali. Call 096355 05436.`,
    h1: 'Best Electric Scooters in Berhampore (2026) — Top Models Compared',
    schema: 'crumbs',
    crawlText:
      `Compare Activa, Zoom, Double Light, and Single Light at Biswajit Power Hub in Berhampore and Murshidabad. Every model is a low-speed electric scooter with no licence and no RTO registration required.${fromBit} Current starting prices: ${pricesPhrase}. Visit Chunakhali Bus Stand for a free test ride, EMI options, and custom battery upgrades.`,
  },
  {
    path: '/low-budget-electric-scooters-berhampore',
    title: `Low Budget Electric Scooters Berhampore${fromPrice ? ` | From ${fromPrice}` : ''}`,
    description:
      `Affordable electric scooters in Berhampore${fromPrice ? ` from ${fromPrice}` : ''}. Low budget, no licence models. EMI available. Visit Biswajit Power Hub, Chunakhali. Call 096355 05436.`,
    h1: `Low Budget Electric Scooters in Berhampore & Murshidabad${fromPrice ? ` — Starting ${fromPrice}` : ''}`,
    schema: 'crumbs',
    crawlText:
      `Looking for a cheap electric scooter in Berhampore? Current starting prices: ${pricesPhrase}. Save on petrol with home charging around ₹0.30 to ₹0.50 per km. Ask about EMI options at our Murshidabad showroom near Chunakhali Bus Stand.`,
  },
  {
    path: '/no-licence-electric-scooters-west-bengal',
    title: 'No Licence Electric Scooters in West Bengal (2026) Guide',
    description:
      `No licence, no registration electric scooters in West Bengal${fromPrice ? ` from ${fromPrice}` : ''}. Legal low-speed EVs at Biswajit Power Hub, Berhampore. Test ride today. Call 096355 05436.`,
    h1: 'No Licence Electric Scooters in West Bengal (2026) — Complete Guide',
    schema: 'crumbs',
    crawlText:
      `Eligible low-speed electric scooters under 25 km/h can be ridden in West Bengal without a driving licence or RTO registration. Biswajit Power Hub in Berhampore stocks Activa, Zoom, Single Light, and Double Light.${fromBit} Test ride at Chunakhali, Murshidabad, any day 9 AM to 8:30 PM.`,
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
      'Free supervised test rides are available at Biswajit Power Hub, Chunakhali Bus Stand, Berhampore. No appointment needed any day 9 AM to 8:30 PM. A driving licence is not required for our low-speed models. Try Activa, Zoom, Double Light, or Single Light before you buy.',
  },
  {
    path: '/electric-scooter-near-me-berhampore',
    title: 'Electric Scooter Near Me Berhampore | Biswajit Power Hub',
    description:
      'Electric scooter near me in Berhampore? Visit Biswajit Power Hub at Chunakhali Bus Stand — no licence models, free test ride, EMI. Call 096355 05436.',
    h1: 'Electric Scooter Near Me in Berhampore — Local Dealer at Chunakhali',
    schema: 'near-me',
    crawlText:
      'Looking for an electric scooter near me in Berhampore? Biswajit Power Hub is at Chunakhali Bus Stand, Nimtala. Free test rides, no licence on eligible models, EMI guidance. Call 096355 05436. Serving Murshidabad towns including Kandi, Jiaganj, Beldanga, Domkal and more.',
  },
  {
    path: '/areas-we-serve',
    title: 'Areas We Serve — Murshidabad Electric Scooters | Biswajit Power Hub',
    description:
      'Biswajit Power Hub serves Berhampore, Cossimbazar, Lalbagh, Jiaganj, Kandi, Domkal, Lalgola and more. Visit Chunakhali showroom. Call 096355 05436.',
    h1: 'Areas We Serve — Murshidabad',
    schema: 'areas',
    crawlText:
      'One showroom in Berhampore serving Murshidabad: Berhampore, Cossimbazar, Murshidabad Lalbagh, Jiaganj, Azimganj, Raninagar, Beldanga, Nabagram, Hariharpara, Chaltia Gora Bazar, Daulatabad, Domkal, Lalgola, Kandi, Bhagawangola.',
  },

  {
    path: '/contact',
    title: 'Showroom Near Chunakhali, Berhampore | Biswajit Power Hub',
    description:
      'Electric scooter showroom near Chunakhali Bus Stand, Berhampore. Serving Murshidabad towns — free test ride. Call 096355 05436 or WhatsApp us.',
    h1: 'Visit Our Showroom — Chunakhali, Berhampore | Biswajit Power Hub',
    schema: 'contact',
  },
  {
    path: '/community',
    title: 'Our Community — Biswajit Power Hub, Berhampore',
    description:
      'Join the Biswajit Power Hub community in Berhampore, Murshidabad. Rider stories, showroom tips, and experiences from Chunakhali customers.',
    h1: 'Our Community — Biswajit Power Hub, Berhampore',
    schema: 'community',
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
    path: '/service',
    title: 'Service & Battery Upgrades | Biswajit Power Hub',
    description:
      '3 free servicing, warranty support, and custom battery upgrades at Biswajit Power Hub, Chunakhali Bus Stand, Berhampore.',
    h1: 'Service & Battery Upgrades',
    schema: 'crumbs',
  },
  {
    path: '/finance',
    title: 'Finance & EMI | Biswajit Power Hub Berhampore',
    description:
      'Easy EMI and finance options for electric scooters at Biswajit Power Hub, Berhampore. Calculate savings vs petrol.',
    h1: 'Finance & EMI Options',
    schema: 'crumbs',
  },
  {
    path: '/offers',
    title: 'Offers & Promotions | Biswajit Power Hub Berhampore',
    description:
      'Current offers and deals on electric scooters at Biswajit Power Hub, Chunakhali, Berhampore.',
    h1: 'Offers & Promotions',
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
  ...SERVICE_LOCATIONS.map((loc) => ({
    path: loc.path,
    title: loc.title,
    description: loc.description,
    h1: loc.h1,
    schema: 'location',
    locationName: loc.name,
    locationFaqs: loc.faqs || [],
    crawlText: `${loc.intro} ${loc.highlights.join(' ')} Showroom: Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad. Call 096355 05436.`,
  })),
  {
    path: '/guides',
    title: 'EV Guides for Berhampore & Murshidabad | Power Hub',
    description:
      'Guides for Murshidabad EV buyers: no-licence rules, electric vs petrol cost, battery upgrades, EMI tips, and first-time buyer checklist.',
    h1: 'Electric Scooter Guides — Berhampore & Murshidabad',
    schema: 'crumbs',
    crawlText:
      'Practical electric scooter guides for Berhampore and Murshidabad riders from Biswajit Power Hub — no-licence rules, running cost, battery upgrades, EMI, and first-time buyer tips.',
  },
  ...BLOG_POSTS.map((post) => ({
    path: post.path,
    title: `${post.title} | Biswajit Power Hub`,
    description: post.description,
    h1: post.h1,
    schema: 'crumbs',
    crawlText: `${post.intro} ${post.sections.map((s) => `${s.h2}. ${s.p}`).join(' ')}`,
  })),
  {
    path: '/ad-landing',
    title: 'No Licence Electric Scooters in Berhampore — Test Ride Today',
    description:
      'No licence electric scooters in Berhampore. Test ride at Biswajit Power Hub, Chunakhali. Call 096355 05436.',
    h1: 'No Licence Electric Scooters in Berhampore — Test Ride Today',
    schema: 'none',
    noindex: true,
  },
  ];
}

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

/** Live approved reviews (Supabase) — same source of truth as getApprovedReviews()
 *  on the client. Falls back to the local seed file only when Supabase env vars
 *  are missing or the request fails, so the build never crashes. */
async function fetchApprovedReviewsForBuild() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return REVIEWS.filter((r) => r.status === 'approved');

  try {
    const res = await fetch(
      `${url}/rest/v1/reviews?select=*&status=eq.approved&order=created_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return Array.isArray(rows)
      ? rows.map((row) => ({
          id: row.id,
          name: row.name,
          rating: Number(row.rating),
          review: row.review,
          scooter: row.scooter,
          created_at: row.created_at,
        }))
      : [];
  } catch (e) {
    console.warn('[fallback-prerender] Supabase reviews fetch failed, using seed data:', e.message);
    return REVIEWS.filter((r) => r.status === 'approved');
  }
}

/** Live homepage hero URL for early LCP preload in static HTML. */
async function fetchHeroImageUrlForBuild() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const photosRes = await fetch(
      `${url}/rest/v1/site_settings?select=photos&id=eq.1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (photosRes.ok) {
      const rows = await photosRes.json();
      const hero = rows?.[0]?.photos?.hero?.url;
      if (typeof hero === 'string' && hero) return hero;
    }
  } catch (e) {
    console.warn('[fallback-prerender] site photos fetch failed:', e.message);
  }

  try {
    const finRes = await fetch(
      `${url}/rest/v1/finance_settings?select=hero_image_url&id=eq.1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (finRes.ok) {
      const rows = await finRes.json();
      const hero = rows?.[0]?.hero_image_url;
      if (typeof hero === 'string' && hero) return hero;
    }
  } catch (e) {
    console.warn('[fallback-prerender] finance hero fetch failed:', e.message);
  }

  return null;
}

function optimizeStorageUrl(src, width, quality, height) {
  const OBJECT = '/storage/v1/object/public/';
  const RENDER = '/storage/v1/render/image/public/';
  if (!src || !src.includes(OBJECT)) return src;
  const base = src.replace(OBJECT, RENDER);
  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality),
    height: String(height),
    resize: 'cover',
  });
  return `${base}${base.includes('?') ? '&' : '?'}${params.toString()}`;
}

/** Build <link rel=preload> for homepage hero (discoverable before JS). */
function heroPreloadTags(heroUrl) {
  if (!heroUrl) return '';
  const widths = [480, 640, 960, 1280];
  const baseW = 960;
  const baseH = 420;
  const quality = 58;
  const primary = 480;
  const href = optimizeStorageUrl(heroUrl, primary, quality, Math.round((baseH / baseW) * primary));
  const srcSet = widths
    .map((w) => {
      const h = Math.round((baseH / baseW) * w);
      return `${optimizeStorageUrl(heroUrl, w, quality, h)} ${w}w`;
    })
    .join(', ');
  const safeHref = escapeHtml(href);
  const safeSrcSet = escapeHtml(srcSet);
  return `    <link rel="preload" as="image" href="${safeHref}" imagesrcset="${safeSrcSet}" imagesizes="100vw" fetchpriority="high" />\n`;
}

/** Early visible LCP image in static HTML (replaced when React mounts). */
function heroLcpImg(heroUrl) {
  if (!heroUrl) return '';
  const widths = [480, 640, 960];
  const baseW = 960;
  const baseH = 420;
  const quality = 58;
  const primary = 480;
  const href = optimizeStorageUrl(heroUrl, primary, quality, Math.round((baseH / baseW) * primary));
  const srcSet = widths
    .map((w) => {
      const h = Math.round((baseH / baseW) * w);
      return `${optimizeStorageUrl(heroUrl, w, quality, h)} ${w}w`;
    })
    .join(', ');
  return `<img src="${escapeHtml(href)}" srcset="${escapeHtml(srcSet)}" sizes="100vw" width="960" height="420" alt="Biswajit Power Hub electric scooter showroom at Chunakhali Bus Stand Berhampore Murshidabad" fetchpriority="high" decoding="async" style="width:100%;aspect-ratio:16/7;object-fit:cover;object-position:center;display:block;min-height:220px;background:#e8eef5" />`;
}

async function buildNoindexCatalogRoutes() {
  const scooters = await fetchCatalogRows('scooters');
  const accessories = await fetchCatalogRows('accessories');
  const routes = [];
  const seedAccessoryIds = new Set(
    ACCESSORIES.filter((a) => String(a.description || '').trim().length >= 40).map((a) => a.id),
  );

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

  // Always union seed catalog + live Supabase rows so sitemap URLs never 404 when
  // production has a different (or empty) accessories table than local seeds.
  const byId = new Map();
  for (const a of ACCESSORIES) {
    if (!a?.id) continue;
    byId.set(String(a.id), {
      id: a.id,
      name: a.name,
      description: a.description,
    });
  }
  for (const row of accessories) {
    if (!row?.id) continue;
    const id = String(row.id);
    const prev = byId.get(id) || {};
    byId.set(id, {
      id,
      name: row.name || prev.name,
      description: row.description || prev.description,
    });
  }

  for (const row of byId.values()) {
    if (!row?.id) continue;
    const name = row.name || humanizeId(row.id);
    const desc = String(row.description || '').trim();
    const indexable = desc.length >= 40 || seedAccessoryIds.has(row.id);
    routes.push({
      path: `/accessories/${row.id}`,
      title: `${name} | Biswajit Power Hub, Berhampore`,
      description:
        desc ||
        `${name} spare parts and accessories at Biswajit Power Hub, Chunakhali, Berhampore. Call 096355 05436.`,
      h1: name,
      schema: indexable ? 'crumbs' : 'none',
      noindex: !indexable,
      crawlText: indexable
        ? `${name}. ${desc} Genuine EV spare parts at Biswajit Power Hub, Berhampore, Murshidabad.`
        : undefined,
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
    name: 'Biswajit Power Hub',
    url: BASE,
    logo: `${BASE}/logo-512.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chunakhali Bus Stand, Nimtala, Murshidabad',
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
    name: 'Biswajit Power Hub',
    url: BASE,
    logo: `${BASE}/logo-512.png`,
    image: [`${BASE}/logo-512.png`, `${BASE}/og-image.png`],
    description:
      'Premium low-speed electric scooter dealer in Berhampore, West Bengal. No licence, no registration on eligible models.',
    telephone: '+919635505436',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chunakhali Bus Stand, Nimtala, Murshidabad',
      addressLocality: 'Berhampore',
      addressRegion: 'West Bengal',
      postalCode: '742149',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude: '24.116865', longitude: '88.2914134' },
    hasMap: 'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '20:30',
      },
    ],
    sameAs: [
      'https://www.instagram.com/biswajitpowerhub',
      'https://www.facebook.com/BiswajitPowerHub',
      'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7',
    ],
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
  };
}

function faqFromItems(faqs) {
  if (!faqs?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

function webPageAboutDealership({ name, url, description, areaServed }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url,
    description,
    about: {
      '@type': 'LocalBusiness',
      '@id': `${BASE}/#dealership`,
      name: 'Biswajit Power Hub',
      url: BASE,
      telephone: '+919635505436',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Chunakhali Bus Stand, Nimtala, Murshidabad',
        addressLocality: 'Berhampore',
        addressRegion: 'West Bengal',
        postalCode: '742149',
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: '24.116865', longitude: '88.2914134' },
      hasMap: 'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7',
      image: `${BASE}/logo-512.png`,
      areaServed: areaServed || ['Berhampore', 'Murshidabad', 'West Bengal'],
    },
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Biswajit Power Hub',
    url: BASE,
    logo: `${BASE}/logo-512.png`,
    sameAs: [
      'https://www.instagram.com/biswajitpowerhub',
      'https://www.facebook.com/BiswajitPowerHub',
      'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7',
    ],
  };
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Biswajit Power Hub',
    url: BASE,
  };
}

function itemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Electric Scooters at Biswajit Power Hub',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Activa Electric Scooter', url: `${BASE}/scooters/activa` },
      { '@type': 'ListItem', position: 2, name: 'Zoom Electric Scooter', url: `${BASE}/scooters/zoom` },
      { '@type': 'ListItem', position: 3, name: 'Single Light Electric Scooter', url: `${BASE}/scooters/single-light` },
      { '@type': 'ListItem', position: 4, name: 'Double Light Electric Scooter', url: `${BASE}/scooters/double-light` },
    ],
  };
}

function productSchema(route, enrichment = {}, reviews = []) {
  const id = route.productId;
  const seed = CATALOG[id] || {};
  const live = enrichment[id] || {};
  const name = route.productName || live.name || seed.name || 'Electric Scooter';
  const shortName = (seed.name || live.name || name).replace(/\s*Electric Scooter$/i, '');
  // Prefer live Supabase catalog when available so admin price updates match schema.
  const variants =
    Array.isArray(live.variants) && live.variants.length
      ? live.variants
      : seed.variants || [];
  const prices = variants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n) && n > 0);
  const low = prices.length
    ? Math.min(...prices)
    : Number(live.price || seed.price || 0);
  const high = prices.length ? Math.max(...prices) : low;
  const images = (Array.isArray(live.images) ? live.images : seed.images || []).filter(Boolean);
  const rating = ratingForScooter(reviews, shortName);
  const review = reviewsForScooter(reviews, shortName);
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

function faqSchema(catalog = SCOOTERS) {
  const fromPrice = catalogFromPrice(catalog);
  const pricesPhrase = priceListPhrase(catalog);
  const priceAnswer = fromPrice
    ? `At Biswajit Power Hub, electric scooters start from ${fromPrice}. Current starting prices: ${pricesPhrase}. EMI options are available — confirm today’s offer at the showroom.`
    : 'At Biswajit Power Hub, electric scooter prices depend on model and battery pack. Ask for today’s starting price and EMI at our Berhampore showroom.';

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need a licence to ride your electric scooters?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No! Our low-speed electric scooters (under 25 km/h) require no driving licence and no RTO registration in West Bengal as per the Central Motor Vehicles Act. You can ride them legally without any paperwork.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the price of electric scooters in Berhampore?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: priceAnswer,
        },
      },
      {
        '@type': 'Question',
        name: 'What is the range per full charge?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Range varies by model and battery option. Check each scooter page for current figures, or ask at the showroom. We also offer custom battery upgrades at our Berhampore showroom for customers who need extended range.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer test rides in Berhampore?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Free test rides are available at our Chunakhali showroom in Berhampore, Murshidabad. No appointment is needed — visit us any day, 9 AM to 8:30 PM.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you provide EMI or financing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, EMI and financing options are available on all models. Contact us on WhatsApp at 096355 05436 or visit our showroom for details.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is your showroom located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We are located at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad — 742149, West Bengal. We are right at the bus stand, easy to find from anywhere in Murshidabad district.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you sell batteries and spare parts separately?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we stock genuine spare parts including batteries, tyres, body panels, mirrors, and controllers. We also specialize in custom battery upgrades for extra range.',
        },
      },
    ],
  };
}

function schemasFor(route, enrichment = {}, reviews = []) {
  if (route.schema === 'none' || route.noindex) return [];
  const crumbs = breadcrumbSchema(route.path, route.h1 || route.title);
  const catalog = route._catalog || mergeCatalog(enrichment);
  if (route.schema === 'local') {
    return [crumbs, localBusinessSchema(), organizationSchema(), websiteSchema(), faqSchema(catalog)];
  }
  if (route.schema === 'faq') {
    return [crumbs, itemListSchema(), faqSchema(catalog)];
  }
  if (route.schema === 'product') return [crumbs, productSchema(route, enrichment, reviews)];
  if (route.schema === 'community' || route.path === '/community') {
    const aggregateRating = siteAggregateRatingForBuild(reviews);
    const reviewList = siteReviewsSchemaForBuild(reviews);
    return [
      crumbs,
      {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'MotorcycleDealer', 'Store'],
        '@id': `${BASE}/#dealership`,
        name: 'Biswajit Power Hub',
        url: BASE,
        logo: `${BASE}/logo-512.png`,
        image: `${BASE}/logo-512.png`,
        description:
          'Premium low-speed electric scooter dealer in Berhampore, West Bengal. No licence, no registration on eligible models.',
        telephone: '+919635505436',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Chunakhali Bus Stand, Nimtala, Murshidabad',
          addressLocality: 'Berhampore',
          addressRegion: 'West Bengal',
          postalCode: '742149',
          addressCountry: 'IN',
        },
        geo: { '@type': 'GeoCoordinates', latitude: '24.116865', longitude: '88.2914134' },
        hasMap: 'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7',
        ...(aggregateRating ? { aggregateRating } : {}),
        ...(reviewList ? { review: reviewList } : {}),
      },
    ];
  }
  if (route.schema === 'near-me') {
    const faq = faqFromItems([
      {
        question: 'Where is an electric scooter showroom near me in Berhampore?',
        answer:
          'Biswajit Power Hub is at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149. Search BISWAJIT POWER HUB on Google Maps or call 096355 05436.',
      },
      {
        question: 'Do I need a licence for electric scooters near Berhampore?',
        answer:
          'Eligible low-speed models (≤25 km/h) generally need no driving licence and no RTO registration in West Bengal. Confirm the class for your model at our Chunakhali showroom.',
      },
      {
        question: 'Can I test ride today near Chunakhali?',
        answer:
          'Yes — free supervised test rides during showroom hours (open all days 9:00 AM – 8:30 PM). No appointment required.',
      },
    ]);
    return [
      crumbs,
      ...(faq ? [faq] : []),
      webPageAboutDealership({
        name: 'Electric Scooter Near Me in Berhampore',
        url: canonicalFor(route.path),
        description: route.description,
        areaServed: SERVICE_LOCATIONS.map((l) => l.name),
      }),
    ];
  }
  if (route.schema === 'areas') {
    return [
      crumbs,
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Areas served by Biswajit Power Hub in Murshidabad',
        itemListElement: SERVICE_LOCATIONS.map((l, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `Electric scooters for ${l.name}`,
          url: `${BASE}${l.path}`,
        })),
      },
      webPageAboutDealership({
        name: route.h1 || route.title,
        url: canonicalFor(route.path),
        description: route.description,
        areaServed: SERVICE_LOCATIONS.map((l) => l.name),
      }),
    ];
  }
  if (route.schema === 'location') {
    const faq = faqFromItems(route.locationFaqs);
    return [
      crumbs,
      ...(faq ? [faq] : []),
      webPageAboutDealership({
        name: route.h1 || route.title,
        url: canonicalFor(route.path),
        description: route.description,
        areaServed: [route.locationName, 'Murshidabad', 'West Bengal', 'Berhampore'],
      }),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Electric scooter sales for ${route.locationName || 'Murshidabad'}`,
        provider: { '@id': `${BASE}/#dealership` },
        areaServed: {
          '@type': 'City',
          name: route.locationName || 'Murshidabad',
          containedInPlace: { '@type': 'AdministrativeArea', name: 'Murshidabad' },
        },
        serviceType: 'Electric scooter sales, test rides, battery upgrades',
      },
    ];
  }
  if (route.schema === 'contact' || route.path === '/contact' || route.path === '/about') {
    return [crumbs, localBusinessSchema()];
  }
  return [crumbs];
}

const MAPS_URL = 'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7';

/** Per-route H2 sections for crawlable HTML (Google reads this without JS). */
function pageH2s(catalog = SCOOTERS) {
  const fromPrice = catalogFromPrice(catalog);
  const fromBit = fromPrice ? ` from ${fromPrice}` : '';
  const pricesPhrase = priceListPhrase(catalog);
  const entry = catalog[0];
  const entryLine = entry
    ? `${entry.name}${formatINR(startingPriceOf(entry)) ? ` from ${formatINR(startingPriceOf(entry))}` : ''}`
    : 'our entry model';

  return {
  '/': [
    {
      h2: 'Best Electric Scooters in Berhampore',
      p: `If you are searching for the best electric scooters in Berhampore, Biswajit Power Hub is the local showroom built for Murshidabad families who want clean mobility without licence paperwork. Every model we sell is a low-speed electric scooter (≤25 km/h) — no driving licence and no RTO registration for eligible units — so your on-road cost stays close to the showroom price. From school runs in Berhampore town to weekly markets across Murshidabad, riders choose us for honest pricing, free test rides at Chunakhali Bus Stand, and after-sales support you can walk into. Current starting prices: ${pricesPhrase}. Typical home charging lands around ₹0.30–₹0.50 per km, with 3 free servicing and 1 year motor and controller warranty included.`,
    },
    {
      h2: 'Popular Models: Activa, Zoom, Single Light & Double Light',
      p: 'Popular models at Biswajit Power Hub — Activa, Zoom, Single Light, and Double Light — are stocked for quick test rides in Berhampore. Activa suits riders who need more range for Berhampore–Kandi or Berhampore–Jalangi routes. Zoom feels planted and premium for office commutes across Murshidabad. Double Light balances comfort and price for family errands, while Single Light keeps the cash outlay lowest for first-time EV buyers. Every model carries a No Licence Required badge for eligible low-speed use, with EMI guidance and free test rides.',
    },
    {
      h2: 'Why Choose Biswajit Power Hub?',
      p: 'Why choose Biswajit Power Hub over online-only sellers? Because electric scooters in Berhampore are a showroom decision — battery feel, seat height, and real-world range matter more than a brochure. We explain Central Motor Vehicles rules for low-speed EVs in West Bengal in plain language, help you pick between Standard and Lithium Pro packs where available, and never rush a Murshidabad customer into the wrong model. Customers also trust us for transparent EMI slabs and walk-in servicing.',
    },
    {
      h2: 'Custom Battery Upgrades & Spare Parts',
      p: 'Need more kilometres for Berhampore–Kandi runs? We specialise in custom battery upgrades and stock genuine spare parts — batteries, tyres, body panels, mirrors, and controllers. Many Murshidabad riders upgrade an existing chassis instead of buying brand new when the frame is still strong. Bring your e-scooter to Chunakhali for a fitment quote.',
    },
    {
      h2: 'Visit Our Showroom — Chunakhali Bus Stand, Berhampore',
      p: 'Visit our showroom at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal — 742149. Landmark: right at the bus stand, easy to find from anywhere in Murshidabad district. Hours: Open all days 9:00 AM – 8:30 PM. We do not sell online — call, WhatsApp, or get directions and meet us in person for a free test ride.',
    },
    {
      h2: 'Frequently Asked Questions',
      p: `Common questions cover licence rules for low-speed EVs in West Bengal, showroom prices${fromBit}, range per charge, free test rides in Berhampore, EMI financing, showroom location at Chunakhali, and spare parts plus battery upgrades. Call 096355 05436 for anything not listed here.`,
    },
  ],
  '/best-electric-scooters-berhampore': [
    {
      h2: 'Top Electric Scooters Compared',
      p: `Shoppers searching for the best electric scooters in Berhampore usually want three things: a fair on-road price, zero licence paperwork, and a showroom they can trust in Murshidabad. Biswajit Power Hub specialises in low-speed electric scooters that meet those needs — with home charging, 3 free servicing, and 1 year motor and controller warranty on every purchase. Current starting prices: ${pricesPhrase}. Every eligible model is built for no-licence use across West Bengal. Typical home charging lands around ₹0.30–₹0.50 per km.`,
    },
    {
      h2: 'Which Model is Best for You?',
      p: `Choosing the best e-scooter in Murshidabad depends on daily kilometres, budget, and who will ride. Longer Berhampore–Kandi or Berhampore–Jalangi routes favour Activa. Premium daily commute feel points to Zoom. Families who want comfort without a high ticket often prefer Double Light. First-time buyers watching every rupee usually land on ${entryLine}. All models are low-speed (≤25 km/h) with EMI options available at the Chunakhali showroom. Still unsure? Sit on each scooter during a free test ride.`,
    },
    {
      h2: 'Why Buy From Biswajit Power Hub?',
      p: 'Unlike online-only sellers, we run a physical showroom at Chunakhali Bus Stand so you can check battery options, ask about battery upgrades, and leave with clear EMI numbers — not pressure selling. Customers across Berhampore and Murshidabad choose us for honest pricing, genuine spares, walk-in servicing, and plain-language explanations of Central Motor Vehicles rules for low-speed EVs. Ready to compare in person? Call 096355 05436 or visit any day, 9 AM to 8:30 PM.',
    },
  ],
  '/low-budget-electric-scooters-berhampore': [
    {
      h2: 'Most Affordable Electric Scooters in Murshidabad',
      p: `The most affordable electric scooters in Murshidabad start at Biswajit Power Hub with ${entryLine}. It is ideal for school drops, market runs, and short Berhampore town hops. Like all our low-speed EVs, eligible units need no driving licence and no RTO registration. Current lineup starting prices: ${pricesPhrase}. True low-budget electric scooters for Berhampore families who still want warranty, servicing, and a real showroom at Chunakhali Bus Stand.`,
    },
    {
      h2: 'Save Money With Low Running Costs',
      p: 'Petrol scooters in Murshidabad often cost ₹150–₹300+ per week in fuel for daily city use. Our electric scooters typically run at about ₹0.30–₹0.50 per km with home charging. Example: 30 km/day ≈ ₹270–₹450 per month in electricity versus ₹2,000+ in petrol for many Berhampore riders. Over a year, that savings often covers a large part of your EMI — which is why low budget does not mean low value when you buy electric at Biswajit Power Hub.',
    },
    {
      h2: 'EMI Options Available',
      p: 'Financing is available on all models — ask at the counter for current EMI slabs. Many Berhampore and Murshidabad families choose a low monthly payment while keeping cash free for accessories or a spare charger. Visit Open all days 9 AM–8:30 PM, or call 096355 05436 for today’s stock and EMI options. Free test rides — no appointment needed.',
    },
  ],
  '/no-licence-electric-scooters-west-bengal': [
    {
      h2: 'Do You Need a Licence for Electric Scooters?',
      p: 'Do you need a licence for electric scooters in West Bengal? For eligible low-speed models — maximum speed not exceeding 25 km/h under Central Motor Vehicles rules — the answer is generally no driving licence and no RTO registration the way petrol scooters require. That is exactly the category Biswajit Power Hub stocks in Berhampore for Murshidabad families who want simple, legal ownership. High-speed electric scooters still need licence and registration — our team at Chunakhali explains the difference in plain language.',
    },
    {
      h2: 'Which Models Require No Registration?',
      p: `Every showroom model we sell is a low-speed (≤25 km/h) electric scooter designed for no-licence use: Activa, Zoom, Double Light, and Single Light.${fromPrice ? ` Prices start from ${fromPrice}.` : ''} You charge at home, pay a fraction of petrol cost per kilometre, and skip registration queues across Murshidabad. Current starting prices: ${pricesPhrase}.`,
    },
    {
      h2: 'Legal Low-Speed EVs in West Bengal',
      p: 'Legal low-speed EVs in West Bengal are popular because they remove paperwork friction while cutting running costs. Common myths we hear in Berhampore: any electric scooter is licence-free (false — only low-speed eligible models), and no paperwork means no service (false — we include 3 free servicing and motor/controller warranty). Book a free test ride at Chunakhali Bus Stand — no appointment needed Open all days 9 AM–8:30 PM. Call 096355 05436 for stock.',
    },
  ],
  '/battery-upgrade-berhampore': [
    {
      h2: "Increase Your Scooter's Range",
      p: "Increase your scooter's range with a custom battery upgrade at Biswajit Power Hub in Berhampore. Many Murshidabad riders love their low-speed e-scooter but wish one charge covered Berhampore–Kandi or longer market days. A higher ampere-hour (AH) pack — or stepping up to Lithium Pro on eligible models — stretches kilometres between plugs. Range depends on model and pack — check live inventory or ask at the showroom. WhatsApp 096355 05436 with your scooter make and current AH for a quick estimate.",
    },
    {
      h2: 'Battery Upgrade Process',
      p: 'Bring your e-scooter to Biswajit Power Hub near Chunakhali Bus Stand, Berhampore. We inspect the controller, connectors, and chassis, recommend a compatible pack, share clear pricing, and schedule fitment — usually the same visit when parts are in stock. Hours: Open all days 9:00 AM – 8:30 PM. If your scooter is ageing overall, compare Activa and Zoom Lithium Pro options, then decide with our team. Pair upgrades with a free test ride or browse spare parts and accessories at Chunakhali across Murshidabad.',
    },
  ],
  '/test-ride-berhampore': [
    {
      h2: 'How to Book a Free Test Ride',
      p: 'How to book a free test ride in Berhampore: simply walk into Biswajit Power Hub at Chunakhali Bus Stand any day between 9:00 AM and 8:30 PM. No appointment is required for our low-speed models. Prefer a heads-up? Call or WhatsApp 096355 05436 and tell us which scooter you want to try — Activa, Zoom, Double Light, or Single Light. Bring your phone number for EMI follow-up; a driving licence is not required for our low-speed models. Ask about genuine spare parts and battery upgrades after the ride.',
    },
    {
      h2: 'What to Expect at Our Showroom',
      p: 'Expect a friendly walkthrough of no-licence rules in West Bengal, side-by-side comparison of Activa, Zoom, Single Light, and Double Light, and a supervised ride on safe nearby roads around Chunakhali when weather and traffic allow. Address: Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149. After the ride we can discuss EMI, battery upgrades, and today’s on-road price for riders across Murshidabad.',
    },
  ],
  '/community': [
    {
      h2: 'What Our Community Says',
      p: 'Real stories from riders across Berhampore and Murshidabad who chose Activa, Zoom, Single Light, or Double Light at our Chunakhali showroom — no licence models, honest pricing, and walk-in support. Customers praise free test rides, clear EMI guidance, battery upgrade options, and the convenience of a showroom right at Chunakhali Bus Stand. Visit Open all days 9 AM–8:30 PM or call 096355 05436 to experience the same service that earned these testimonials across Murshidabad.',
    },
    {
      h2: 'Join Our Community',
      p: 'Bought from our Chunakhali showroom? Your Google review helps other Berhampore and Murshidabad riders find Biswajit Power Hub. Search Biswajit Power Hub Berhampore on Google and leave a review after your visit, or share your story with Our Community on this page. We appreciate honest feedback about models, EMI, and after-sales support.',
    },
  ],
  '/about': [
    {
      h2: 'Our Story',
      p: 'Our story begins in Berhampore, Murshidabad — where rising petrol costs and complicated paperwork kept everyday families from switching to electric. Biswajit Power Hub opened at Chunakhali Bus Stand to make clean, low-cost mobility practical: low-speed electric scooters that need no driving licence and no RTO registration on eligible models. From day one we focused on showroom honesty — sit on the scooter, take a free test ride, and leave with clear EMI numbers.',
    },
    {
      h2: 'Why We Started Biswajit Power Hub',
      p: 'Murshidabad deserved a trusted electric scooter dealer who explains West Bengal no-licence rules in plain language and stands behind every sale. We built a showroom culture around everyday affordability, low running cost with home charging, and after-sales support you can actually visit at Chunakhali Bus Stand, Berhampore.',
    },
  ],
  '/contact': [
    {
      h2: 'Visit Our Showroom in Berhampore',
      p: 'Find Biswajit Power Hub at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal — 742149. Landmark: Near Chunakhali Bus Stand. We do not sell online — visit for free test rides, EMI guidance, and battery upgrades. Get directions on Google Maps or call before you arrive.',
    },
    {
      h2: 'Contact Information',
      p: 'Phone +91 96355 05436 · WhatsApp chat available · Hours Open all days 9:00 AM – 8:30 PM. Reach us from anywhere in Murshidabad district — we are right at the bus stand.',
    },
  ],
  '/scooters': [
    {
      h2: 'Electric Scooters with No Licence Required',
      p: 'Browse Activa, Zoom, Single Light, and Double Light at Biswajit Power Hub in Berhampore. Every eligible model is a low-speed electric scooter with No Licence Required for West Bengal riders, home charging, EMI options, and free test rides at Chunakhali Bus Stand, Murshidabad.',
    },
    {
      h2: `Compare Prices${fromPrice ? ` Starting ${fromPrice}` : ''}`,
      p: `${pricesPhrase}. Visit our showroom Open all days 9 AM–8:30 PM or call 096355 05436 for today’s stock and colours across Murshidabad.`,
    },
  ],
  };
}

const MODEL_H2S = [
  {
    h2: 'Why riders in Berhampore choose this model',
    p: 'This low-speed electric scooter at Biswajit Power Hub in Berhampore, Murshidabad needs no driving licence and no RTO registration on eligible units. Charge at home for roughly ₹0.30–₹0.50 per km, with 3 free servicing and 1 year motor and controller warranty. Visit Chunakhali Bus Stand for a free test ride, EMI guidance, and spare-parts support.',
  },
  {
    h2: 'Price, range & showroom support in Murshidabad',
    p: 'On-road pricing depends on variant. Our team explains Standard vs Lithium Pro packs where available, fits genuine spare parts, and never rushes a decision. Open all days 9 AM–8:30 PM. Call 096355 05436 before you visit to confirm colour and stock across Murshidabad.',
  },
];

function sectionsHtml(route) {
  const catalog = route._catalog || SCOOTERS;
  let sections = pageH2s(catalog)[route.path];
  if (!sections && route.path?.startsWith('/scooters/') && route.schema === 'product') {
    sections = MODEL_H2S.map((s) => ({
      h2: s.h2.replace('this model', route.productName || 'this scooter'),
      p: s.p,
    }));
  }
  if (!sections) {
    sections = [
      {
        h2: 'Biswajit Power Hub — Berhampore & Murshidabad',
        p:
          route.crawlText ||
          'Visit Biswajit Power Hub at Chunakhali Bus Stand, Berhampore, Murshidabad for low-speed no-licence electric scooters, EMI, battery upgrades, and free test rides. Call 096355 05436. Open all days 9 AM–8:30 PM.',
      },
      {
        h2: 'Visit Our Showroom',
        p: 'Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149. Get directions on Google Maps or WhatsApp us before you arrive.',
      },
    ];
  }
  return sections
    .map(
      (s) =>
        `<section style="margin-top:2rem;padding-top:1rem;border-top:1px solid #e5e5e5;"><h2 style="font-size:1.35rem;margin:0 0 0.75rem;color:#1a1a1a;">${escapeHtml(s.h2)}</h2><p style="margin:0;line-height:1.7;">${escapeHtml(s.p)}</p></section>`,
    )
    .join('\n');
}

function modelCardsHtml(catalog = SCOOTERS) {
  const models = catalog.map((s) => ({
    id: s.id,
    name: s.name,
    price: formatINR(startingPriceOf(s)) || 'Ask showroom',
  }));
  return `<div style="display:grid;gap:1rem;margin:1.5rem 0;">${models
    .map(
      (m) => `<article style="border:1px solid #e5e5e5;border-radius:12px;padding:1rem;background:#fff;">
      <img src="${BASE}/og-image.png" alt="${escapeHtml(m.name)} electric scooter at Biswajit Power Hub Berhampore" width="600" height="400" loading="lazy" style="width:100%;max-width:100%;height:auto;border-radius:8px;background:#e0e0e0;" />
      <p style="margin:0.75rem 0 0;font-weight:700;">${escapeHtml(m.name)}</p>
      <p style="margin:0.25rem 0;"><span style="display:inline-block;background:#25d366;color:#fff;font-size:0.75rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;">✓ No Licence Required</span></p>
      <p style="margin:0.35rem 0;">From ${escapeHtml(m.price)}</p>
      <p style="margin:0;"><a href="${BASE}/scooters/${m.id}">View Details</a></p>
    </article>`,
    )
    .join('')}</div>`;
}

function crawlableBody(route, heroUrl = null) {
  const h1 = escapeHtml(route.h1 || route.title);
  const desc = escapeHtml(route.description);
  const showCards = route.path === '/' || route.path === '/scooters';
  const catalog = route._catalog || SCOOTERS;
  const homeLcp = route.path === '/' ? heroLcpImg(heroUrl) : '';
  // Don't eagerly fetch heavy OG art on home — it steals bandwidth from the real LCP hero.
  const midImage =
    route.path === '/' && heroUrl
      ? ''
      : `<img src="${BASE}/og-image.png" alt="Biswajit Power Hub electric scooter showroom at Chunakhali Bus Stand Berhampore Murshidabad" width="1200" height="600" loading="lazy" decoding="async" style="width:100%;max-width:100%;height:auto;border-radius:12px;background:#e0e0e0;margin:1rem 0;" />`;

  // Visible HTML (not noscript): React createRoot replaces #root on client load.
  // Google and curl verification read this initial HTML without executing JavaScript.
  return `
${homeLcp}
<nav aria-label="Showroom CTAs" style="display:flex;flex-wrap:wrap;gap:0.5rem;padding:0.75rem 1rem;background:#0f0f0f;">
  <a href="tel:+919635505436" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0.75rem 1.25rem;background:#2563EB;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;">Call: 096355 05436</a>
  <a href="https://wa.me/919635505436" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0.75rem 1.25rem;background:#25d366;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;">WhatsApp</a>
  <a href="${MAPS_URL}" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0.75rem 1.25rem;background:#4285f4;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;">Get Directions</a>
</nav>
<main data-seo-prerender="true" style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:20px 16px 120px;line-height:1.6;color:#4a4a4a;">
  <h1 style="color:#1a1a1a;font-size:1.75rem;line-height:1.25;">${h1}</h1>
  <p>${desc}</p>
  ${midImage}
  ${sectionsHtml(route)}
  ${showCards ? `<h2 style="font-size:1.35rem;color:#1a1a1a;margin-top:2rem;">Popular Models: Activa, Zoom, Single Light &amp; Double Light</h2>${modelCardsHtml(catalog)}` : ''}
  <p style="margin-top:2rem;"><a href="${BASE}/scooters">Electric scooters in Berhampore</a> · <a href="${BASE}/best-electric-scooters-berhampore">Best electric scooters Berhampore</a> · <a href="${BASE}/contact">Visit showroom</a> · <a href="${BASE}/test-ride-berhampore">Free test ride</a></p>
</main>
<footer style="background:#0f0f0f;color:#fff;padding:2rem 1rem 6rem;">
  <div style="max-width:960px;margin:0 auto;display:grid;gap:1.5rem;">
    <div>
      <img src="${BASE}/logo.png" alt="Biswajit Power Hub logo" width="160" height="160" style="height:40px;width:auto;background:#fff;border-radius:8px;padding:4px;" />
      <p style="font-weight:700;margin:0.75rem 0 0.25rem;">Biswajit Power Hub</p>
      <p style="margin:0;color:#ccc;">Premium Electric Scooters in Berhampore, Murshidabad</p>
    </div>
    <div>
      <p style="font-weight:700;letter-spacing:0.08em;font-size:0.75rem;color:#aaa;text-transform:uppercase;">Quick Links</p>
      <p style="margin:0.5rem 0;"><a href="${BASE}/" style="color:#ddd;">Home</a> · <a href="${BASE}/scooters" style="color:#ddd;">Scooters</a> · <a href="${BASE}/best-electric-scooters-berhampore" style="color:#ddd;">Best in Berhampore</a> · <a href="${BASE}/low-budget-electric-scooters-berhampore" style="color:#ddd;">Low Budget</a> · <a href="${BASE}/no-licence-electric-scooters-west-bengal" style="color:#ddd;">No Licence</a> · <a href="${BASE}/battery-upgrade-berhampore" style="color:#ddd;">Battery Upgrade</a> · <a href="${BASE}/test-ride-berhampore" style="color:#ddd;">Test Ride</a> · <a href="${BASE}/accessories" style="color:#ddd;">Accessories</a> · <a href="${BASE}/compare" style="color:#ddd;">Compare</a> · <a href="${BASE}/community" style="color:#ddd;">Our Community</a> · <a href="${BASE}/offers" style="color:#ddd;">Offers</a> · <a href="${BASE}/finance" style="color:#ddd;">Finance</a> · <a href="${BASE}/service" style="color:#ddd;">Service</a> · <a href="${BASE}/about" style="color:#ddd;">About</a> · <a href="${BASE}/contact" style="color:#ddd;">Contact</a></p>
    </div>
    <div>
      <p style="font-weight:700;letter-spacing:0.08em;font-size:0.75rem;color:#aaa;text-transform:uppercase;">Contact</p>
      <address style="font-style:normal;margin:0.5rem 0;color:#ddd;line-height:1.6;">
        Chunakhali Bus Stand, Nimtala<br />
        Berhampore, Murshidabad<br />
        West Bengal — 742149
      </address>
      <p style="margin:0.5rem 0;">Phone: <a href="tel:+919635505436" style="color:#fff;">+91 96355 05436</a></p>
      <p style="margin:0.5rem 0;">WhatsApp: <a href="https://wa.me/919635505436" style="color:#fff;">Chat on WhatsApp</a></p>
      <p style="margin:0.5rem 0;color:#ddd;">Hours: Open all days 9:00 AM – 8:30 PM</p>
      <p style="margin:0.75rem 0;"><a href="${MAPS_URL}" style="display:inline-flex;min-height:48px;align-items:center;padding:0.75rem 1.25rem;background:#4285f4;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;">Get Directions</a></p>
    </div>
  </div>
  <p style="text-align:center;margin:2rem 0 0;color:#999;font-size:0.875rem;">© 2026 Biswajit Power Hub. Electric Scooter Dealer in Berhampore, Murshidabad.</p>
  <p style="text-align:center;margin:0.5rem 0 0;color:#ccc;font-size:0.875rem;">Best Electric Scooters in Berhampore | No Licence Required | Low Running Cost</p>
  <p style="text-align:center;margin:0.75rem 0 0;font-size:0.875rem;"><a href="${BASE}/terms" style="color:#bbb;">Terms of Service</a> · <a href="${BASE}/privacy" style="color:#bbb;">Privacy Policy</a> · <a href="${BASE}/about" style="color:#bbb;">About</a></p>
</footer>
<div role="navigation" aria-label="Call or get directions" style="position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;gap:0.5rem;padding:0.5rem;padding-bottom:calc(0.5rem + env(safe-area-inset-bottom));background:#1a1a1a;">
  <a href="tel:+919635505436" style="flex:1;display:flex;min-height:48px;align-items:center;justify-content:center;background:#2563EB;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;">Call</a>
  <a href="${MAPS_URL}" style="flex:1;display:flex;min-height:48px;align-items:center;justify-content:center;background:#4285f4;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;">Directions</a>
</div>
<a href="https://wa.me/919635505436" aria-label="Chat on WhatsApp" style="position:fixed;right:1rem;bottom:calc(4.5rem + env(safe-area-inset-bottom));z-index:9998;width:56px;height:56px;border-radius:999px;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.25);">WA</a>`;
}

function injectMeta(html, route, { heroUrl } = {}) {
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

  // Local geo meta (reinforces Murshidabad targeting for crawlers reading static HTML)
  out = out.replace(/<meta\s+name="geo\.(region|placename|position)"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  out = out.replace(/<meta\s+name="ICBM"\s+content="[^"]*"\s*\/?>\s*/gi, '');
  out = out.replace(
    '</head>',
    `    <meta name="geo.region" content="IN-WB" />
    <meta name="geo.placename" content="Berhampore, Murshidabad" />
    <meta name="geo.position" content="24.116865;88.2914134" />
    <meta name="ICBM" content="24.116865, 88.2914134" />
  </head>`,
  );

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

  // Homepage LCP: strip any prior hero preload, then inject early-discoverable tags
  out = out.replace(
    /<link\s+rel="preload"\s+as="image"[^>]*>\s*/gi,
    '',
  );
  if (route.path === '/' && heroUrl) {
    out = out.replace('</head>', `${heroPreloadTags(heroUrl)}  </head>`);
  }

  // Strip previous injected ld+json from fallback runs; keep GA scripts
  out = out.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '');

  const scripts = schemasFor(route, route._enrichment || {}, route._reviews || [])
    .map((s) => `    <script type="application/ld+json" data-prerender-jsonld="true">${JSON.stringify(s)}</script>`)
    .join('\n');
  if (scripts) out = out.replace('</head>', `${scripts}\n  </head>`);

  const ns = crawlableBody(route, heroUrl);
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
const liveCatalog = mergeCatalog(enrichment);
const liveReviews = await fetchApprovedReviewsForBuild();
const heroUrl = await fetchHeroImageUrlForBuild();
console.log(`[fallback-prerender] using ${liveReviews.length} approved review(s) for rating schema`);
console.log(
  `[fallback-prerender] catalog from-price ${catalogFromPrice(liveCatalog) || 'n/a'} (${liveCatalog.length} models)`,
);
console.log(`[fallback-prerender] homepage hero preload ${heroUrl ? 'yes' : 'no'}`);
const catalogNoindex = await buildNoindexCatalogRoutes();
const allRoutes = [
  ...buildRoutes(liveCatalog).map((r) => ({
    ...r,
    _catalog: liveCatalog,
    ...(r.schema === 'product' ? { _enrichment: enrichment } : {}),
    _reviews: liveReviews,
  })),
  ...catalogNoindex,
];

let count = 0;
let noindexCount = 0;
for (const route of allRoutes) {
  const html = injectMeta(shell, route, { heroUrl });
  const out = outPathFor(route.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, 'utf8');
  count += 1;
  if (route.noindex) noindexCount += 1;
  console.log(`[fallback-prerender] ${route.path}${route.noindex ? ' (noindex)' : ''}`);
}

/** True HTTP 404 document for unknown URLs (Vercel serves with 404 when no SPA catch-all). */
const notFoundRoute = {
  path: '/404',
  title: 'Page Not Found | Biswajit Power Hub',
  description: 'This page does not exist. Browse electric scooters or visit our Berhampore showroom.',
  h1: 'Page Not Found',
  schema: 'none',
  noindex: true,
  crawlText:
    'Page not found. Browse electric scooters at Biswajit Power Hub, Chunakhali Bus Stand, Berhampore, or contact the showroom on 096355 05436.',
};
writeFileSync(join(DIST, '404.html'), injectMeta(shell, notFoundRoute, { heroUrl: null }), 'utf8');
console.log('[fallback-prerender] wrote /404.html');

console.log(
  `[fallback-prerender] wrote ${count} routes for ${BASE} (${noindexCount} noindex stubs)`,
);
