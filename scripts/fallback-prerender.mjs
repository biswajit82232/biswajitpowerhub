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

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const BASE = (process.env.VITE_SITE_URL || 'https://biswajitpowerhub.in').replace(/\/$/, '');
const SEO_READY = new Set(SEO_READY_SCOOTER_IDS);

const SCOOTER_SEO = {
  activa: {
    title: 'Activa Electric Scooter — Price & Specs | Biswajit Power Hub, Berhampore',
    description:
      'Buy Activa electric scooter in Berhampore. No licence, no registration. Long-range comfort. 1 year warranty. Visit our showroom today.',
    name: 'Activa Electric Scooter',
  },
  'single-light': {
    title: 'Single Light Electric Scooter — 80km Range | No Licence | Berhampore',
    description:
      'Affordable Single Light e-scooter at Biswajit Power Hub. 80 km range, home charging, no licence needed. Call 096355 05436.',
    name: 'Single Light Electric Scooter',
  },
  'double-light': {
    title: 'Double Light Electric Scooter — Dual Headlight | Berhampore',
    description:
      'Stylish Double Light electric scooter in Berhampore. Low speed, no registration. Visit Chunakhali Bus Stand showroom.',
    name: 'Double Light Electric Scooter',
  },
  zoom: {
    title: 'Zoom Electric Scooter — Sporty & Efficient | Biswajit Power Hub',
    description:
      'Sporty Zoom e-scooter available in Berhampore. No licence required. Low running cost. Test ride today at Chunakhali.',
    name: 'Zoom Electric Scooter',
  },
};

const ROUTES = [
  {
    path: '/',
    title: 'Electric Scooter Dealer in Berhampore | Biswajit Power Hub',
    description:
      'Buy premium low-speed electric scooters in Berhampore, West Bengal. No licence, no registration. Activa, Single Light, Double Light, Zoom models. 1 year warranty.',
    h1: 'Biswajit Power Hub — Premium Electric Scooters in Berhampore',
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
    h1: seo.name,
    schema: 'product',
    productName: seo.name,
    productId: id,
  })),
  {
    path: '/contact',
    title: 'Visit Our Showroom — Chunakhali, Berhampore | Biswajit Power Hub',
    description:
      'Visit Biswajit Power Hub at Chunakhali Bus Stand, Berhampore. Electric scooter dealer. Call 096355 05436 or WhatsApp us.',
    h1: 'Visit Our Showroom in Berhampore',
    schema: 'contact',
  },
  {
    path: '/reviews',
    title: 'Customer Reviews & Testimonials | Biswajit Power Hub, Berhampore',
    description:
      'See what customers say about Biswajit Power Hub. Premium electric scooters and battery solutions in Berhampore.',
    h1: 'Customer Reviews',
    schema: 'crumbs',
  },
  {
    path: '/about',
    title: 'About Biswajit Power Hub — EV Dealer in Berhampore, Murshidabad',
    description:
      'Trusted multi-brand electric scooter showroom in Berhampore, West Bengal. Batteries, E-Rickshaws, and E-Scooty at Chunakhali.',
    h1: 'About Biswajit Power Hub',
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

async function fetchCatalogRows(table) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=id,name&order=name.asc`, {
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

function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'MotorcycleDealer', 'Store'],
    '@id': `${BASE}/#dealership`,
    name: 'BISWAJIT POWER HUB',
    url: BASE,
    image: `${BASE}/logo-512.png`,
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
  };
}

function productSchema(name, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: `${BASE}/logo-512.png`,
    description: `Premium low-speed electric scooter available at Biswajit Power Hub, Berhampore.`,
    brand: { '@type': 'Brand', name: 'PowerHub' },
    offers: {
      '@type': 'Offer',
      url: canonicalFor(path),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'LocalBusiness',
        name: 'BISWAJIT POWER HUB',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Chunakhali Bus Stand, Nimtala',
          addressLocality: 'Berhampore',
          addressRegion: 'West Bengal',
          postalCode: '742149',
          addressCountry: 'IN',
        },
      },
    },
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

function schemasFor(route) {
  if (route.schema === 'none' || route.noindex) return [];
  const crumbs = breadcrumbSchema(route.path, route.h1 || route.title);
  if (route.schema === 'local') return [crumbs, localBusinessSchema()];
  if (route.schema === 'faq') return [crumbs, faqSchema()];
  if (route.schema === 'product') return [crumbs, productSchema(route.productName, route.path)];
  return [crumbs];
}

function noscriptBlock(route) {
  return `<noscript>
        <main style="font-family: 'Plus Jakarta Sans', Inter, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1a1a1a;">
          <h1>${escapeHtml(route.h1 || route.title)}</h1>
          <p>${escapeHtml(route.description)}</p>
          <p><strong>Location:</strong> Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149</p>
          <p><strong>Phone:</strong> <a href="tel:+919635505436">096355 05436</a></p>
          <p><a href="${BASE}/scooters">View Scooters</a> · <a href="${BASE}/contact">Contact</a> · <a href="https://wa.me/919635505436?text=Hi%2C%20I%20want%20to%20know%20about%20electric%20scooters">WhatsApp</a></p>
        </main>
      </noscript>`;
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

  // Strip previous injected ld+json from fallback runs; keep GA scripts
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');

  const scripts = schemasFor(route)
    .map((s) => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n');
  if (scripts) out = out.replace('</head>', `${scripts}\n  </head>`);

  const ns = noscriptBlock(route);
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
const catalogNoindex = await buildNoindexCatalogRoutes();
const allRoutes = [...ROUTES, ...catalogNoindex];

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
