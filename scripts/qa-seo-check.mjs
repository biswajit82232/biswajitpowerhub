/**
 * Lightweight post-build SEO sanity check (no test runner in package.json).
 * Run after `npm run build`.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
const routes = [
  '/',
  '/scooters',
  '/scooters/activa',
  '/scooters/zoom',
  '/scooters/single-light',
  '/scooters/double-light',
  '/best-electric-scooters-berhampore',
  '/low-budget-electric-scooters-berhampore',
  '/no-licence-electric-scooters-west-bengal',
  '/battery-upgrade-berhampore',
  '/test-ride-berhampore',
  '/contact',
  '/reviews',
  '/about',
  '/compare',
  '/accessories',
  '/terms',
  '/privacy',
  '/ad-landing',
  '/dealership',
  '/updates',
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
    route !== '/ad-landing' &&
    route !== '/dealership' &&
    route !== '/updates'
  ) {
    issues.push('no-canonical');
  }
  if (
    (route === '/ad-landing' || route === '/dealership' || route === '/updates') &&
    !/noindex/i.test(html)
  ) {
    issues.push('missing-noindex');
  }
  if (route === '/' && !html.includes('24.116865')) issues.push('stale-geo');
  if (route === '/' && !html.includes('LocalBusiness')) issues.push('missing-localbusiness');
  if (route === '/' && !html.includes('hasMap')) issues.push('missing-hasMap');
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
if (locs.length < 18) {
  log('FAIL sitemap too small');
  fail += 1;
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
