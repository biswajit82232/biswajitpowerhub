/**
 * Lightweight post-build SEO sanity check (no test runner in package.json).
 * Run after `npm run build`.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SERVICE_LOCATIONS } from '../src/data/locations.js';

const DIST = 'dist';
const routes = [
  '/',
  '/scooters',
  '/scooters/activa',
  '/scooters/zoom',
  '/scooters/single-light',
  '/scooters/double-light',
  '/best-electric-scooters-berhampore',
  '/electric-scooter-near-me-berhampore',
  '/battery-scooty-berhampore',
  '/areas-we-serve',
  '/low-budget-electric-scooters-berhampore',
  '/no-licence-electric-scooters-west-bengal',
  '/battery-upgrade-berhampore',
  '/test-ride-berhampore',
  ...SERVICE_LOCATIONS.map((l) => l.path),
  '/guides',
  '/guides/no-licence-electric-scooter-rules-west-bengal',
  '/guides/electric-vs-petrol-cost-berhampore',
  '/guides/battery-upgrade-guide-berhampore',
  '/guides/first-time-buyer-guide-murshidabad',
  '/guides/emi-finance-tips-electric-scooter',
  '/contact',
  '/community',
  '/about',
  '/service',
  '/finance',
  '/offers',
  '/compare',
  '/accessories',
  '/terms',
  '/privacy',
  '/social',
  '/ad-landing',
];

function htmlPath(route) {
  if (route === '/') return join(DIST, 'index.html');
  return join(DIST, route.slice(1), 'index.html');
}

let fail = 0;
const log = (msg) => console.log(msg);

for (const route of routes) {
  const p = htmlPath(route);
  if (!existsSync(p)) {
    log(`FAIL missing ${route}`);
    fail += 1;
    continue;
  }
  const html = readFileSync(p, 'utf8');
  const issues = [];
  if (!/<title>[^<]+<\/title>/i.test(html)) issues.push('no-title');
  if (!/name=["']description["']/i.test(html)) issues.push('no-description');
  if (
    !/rel=["']canonical["']/i.test(html) &&
    route !== '/ad-landing'
  ) {
    issues.push('no-canonical');
  }
  if (
    route === '/ad-landing' &&
    !/noindex/i.test(html)
  ) {
    issues.push('missing-noindex');
  }
  if (route === '/' && !html.includes('24.116865')) issues.push('stale-geo');
  if (route === '/' && !html.includes('LocalBusiness')) issues.push('missing-localbusiness');
  if (route === '/' && !html.includes('hasMap')) issues.push('missing-hasMap');
  if (route === '/' && !html.includes('openingHoursSpecification') && !html.includes('OpeningHoursSpecification')) {
    issues.push('missing-hours');
  }
  if (route === '/') {
    const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const valid = blocks.some((m) => {
      try {
        const parsed = JSON.parse(m[1]);
        const nodes = Array.isArray(parsed) ? parsed : [parsed];
        return nodes.some((n) => n && n['@type'] && n.name && (n.url || n['@id']));
      } catch {
        return false;
      }
    });
    if (!valid) issues.push('jsonld-incomplete');
    const homeLd = blocks.map((m) => m[1]).join('\n');
    if (homeLd.includes('"aggregateRating"') || homeLd.includes('"reviewBody"')) {
      issues.push('homepage-must-not-embed-reviews');
    }
    if (homeLd.includes('hasOfferCatalog') || homeLd.includes('gt-90') || homeLd.includes('dubble-light')) {
      issues.push('homepage-must-not-embed-product-offers');
    }
  }
  if (route === '/community' && !/Our Community/i.test(html)) issues.push('missing-community-copy');
  if (route === '/contact' && !html.includes('LocalBusiness')) issues.push('missing-localbusiness');
  if (issues.length) {
    log(`FAIL ${route}: ${issues.join(', ')}`);
    fail += 1;
  } else {
    log(`OK ${route}`);
  }
}

const sm = readFileSync('public/sitemap.xml', 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
log(`sitemap urls: ${locs.length}`);
if (locs.length < 30) {
  log('FAIL sitemap too small');
  fail += 1;
}
if (!locs.some((u) => u.includes('/guides'))) {
  log('FAIL sitemap missing guides');
  fail += 1;
}
if (!locs.some((u) => u.includes('electric-scooters-kandi'))) {
  log('FAIL sitemap missing location pages');
  fail += 1;
}

const notFound = join(DIST, '404.html');
if (!existsSync(notFound) || !/noindex/i.test(readFileSync(notFound, 'utf8'))) {
  log('FAIL missing 404.html with noindex');
  fail += 1;
} else {
  log('OK 404.html');
}

const robots = readFileSync('public/robots.txt', 'utf8');
for (const needle of ['Disallow: /admin', 'Disallow: /ad-landing', 'Sitemap:']) {
  if (!robots.includes(needle)) {
    log(`FAIL robots missing ${needle}`);
    fail += 1;
  }
}

const siteSrc = readFileSync('src/config/site.js', 'utf8');
if (!siteSrc.includes('encodeURIComponent(message)') || siteSrc.includes('encodeURICommand')) {
  log('FAIL whatsappCustomerUrl encode helper broken');
  fail += 1;
} else {
  log('OK whatsappCustomerUrl');
}
if (!siteSrc.includes('BISWAJIT%20POWER%20HUB') && !siteSrc.includes('!2sBISWAJIT')) {
  log('FAIL maps embed missing shop name');
  fail += 1;
} else {
  log('OK maps named embed');
}
if (!siteSrc.includes("latitude: '24.116865'")) {
  log('FAIL geo coords in site.js');
  fail += 1;
} else {
  log('OK geo coords');
}

if (fail) {
  console.error(`\nQA failed: ${fail} issue(s)`);
  process.exit(1);
}
console.log('\nALL_CHECKS_PASSED');
