/**
 * Deep GSC-risk audit against dist/ + public sitemap/robots.
 * Run after `npm run build`. Exit 1 on errors.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { SERVICE_LOCATIONS } from '../src/data/locations.js';

const DIST = 'dist';
const SITE = 'https://biswajitpowerhub.in';
const issues = [];

function push(sev, route, msg) {
  issues.push({ sev, route, msg });
}

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name === 'index.html' || name === '404.html') out.push(p);
  }
  return out;
}

function routeFromFile(f) {
  const rel = f
    .replace(/\\/g, '/')
    .replace(/^dist\//, '')
    .replace(/\/index\.html$/, '')
    .replace(/index\.html$/, '');
  if (rel === '404.html') return '/404';
  return rel === '' ? '/' : `/${rel}`;
}

function metaContent(html, name) {
  const re1 = new RegExp(
    `name=["']${name}["'][^>]*content=["']([^"']*)["']`,
    'i',
  );
  const re2 = new RegExp(
    `content=["']([^"']*)["'][^>]*name=["']${name}["']`,
    'i',
  );
  return (html.match(re1) || html.match(re2) || [])[1] || '';
}

function attr(html, rel, attrName = 'href') {
  const re1 = new RegExp(
    `rel=["']${rel}["'][^>]*${attrName}=["']([^"']*)["']`,
    'i',
  );
  const re2 = new RegExp(
    `${attrName}=["']([^"']*)["'][^>]*rel=["']${rel}["']`,
    'i',
  );
  return (html.match(re1) || html.match(re2) || [])[1] || '';
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('FAIL: dist/ missing — run npm run build first');
  process.exit(1);
}

const files = walkHtml(DIST);
const titles = new Map();
const descs = new Map();
const canons = new Map();
const stubs = new Set(['/ad-landing', '/404']);

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const route = routeFromFile(f);
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
  const desc = metaContent(html, 'description');
  const robots = metaContent(html, 'robots');
  const canon = attr(html, 'canonical');
  const noindex = /noindex/i.test(robots) || /noindex/i.test(html);
  const h1 =
    (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]
      ?.replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim() || '';
  const verification = metaContent(html, 'google-site-verification');

  if (verification && (verification.includes('%') || verification === 'undefined')) {
    push('error', route, `broken google-site-verification: ${verification}`);
  }

  if (!title && route !== '/404') push('error', route, 'missing title');
  if (!desc && !noindex && route !== '/404') push('error', route, 'missing description');
  if (!canon && !noindex && route !== '/404') push('error', route, 'missing canonical');
  if (canon && !canon.startsWith(SITE)) push('error', route, `canonical host mismatch: ${canon}`);
  if (canon && canon.includes('www.')) push('error', route, `www canonical: ${canon}`);
  if (canon && /\/$/.test(canon) && canon !== `${SITE}/`) {
    push('warn', route, `canonical trailing slash: ${canon}`);
  }

  if (title && (title.length < 25 || title.length > 70)) {
    push('warn', route, `title length ${title.length}: ${title}`);
  }
  if (desc && (desc.length < 70 || desc.length > 170)) {
    push('warn', route, `desc length ${desc.length}`);
  }
  if (!noindex && !h1 && route !== '/404') {
    push('warn', route, 'missing h1 in prerender HTML');
  }

  // Soft-404 risk: very thin body text for indexable pages
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!noindex && !stubs.has(route) && text.length < 400) {
    push('warn', route, `thin prerender text (${text.length} chars)`);
  }

  const scripts = [
    ...html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi),
  ];
  for (const m of scripts) {
    try {
      const data = JSON.parse(m[1]);
      const list = Array.isArray(data) ? data : [data];
      for (const s of list) {
        if (!s['@type']) push('error', route, 'schema missing @type');
        const types = Array.isArray(s['@type']) ? s['@type'] : [s['@type']];
        if (types.includes('LocalBusiness')) {
          if (!s.address) push('error', route, 'LocalBusiness missing address');
          if (!s.name) push('error', route, 'LocalBusiness missing name');
          if (s.aggregateRating) {
            const rv = Number(s.aggregateRating.ratingValue);
            const rc = Number(s.aggregateRating.reviewCount);
            if (!(rv >= 1 && rv <= 5)) push('error', route, `bad ratingValue ${rv}`);
            if (!(rc >= 1)) push('error', route, `bad reviewCount ${rc}`);
            if (!s.aggregateRating.bestRating) {
              push('warn', route, 'AggregateRating missing bestRating');
            }
          }
          if (Array.isArray(s.review)) {
            for (const rev of s.review) {
              const ir = rev?.itemReviewed?.['@type'];
              if (ir && ir !== 'LocalBusiness' && !String(ir).includes('LocalBusiness')) {
                push('error', route, `LocalBusiness.review itemReviewed is ${ir}`);
              }
            }
          }
        }
        if (types.includes('WebPage') && s.about) {
          const aboutTypes = Array.isArray(s.about['@type']) ? s.about['@type'] : [s.about['@type']];
          if (aboutTypes.includes('LocalBusiness') && !s.about.address) {
            push('error', route, 'WebPage.about LocalBusiness missing address');
          }
        }
        if (types.includes('FAQPage') && (!s.mainEntity || !s.mainEntity.length)) {
          push('error', route, 'empty FAQPage');
        }
        if (types.includes('BreadcrumbList') && (!s.itemListElement || !s.itemListElement.length)) {
          push('error', route, 'empty BreadcrumbList');
        }
        if (types.includes('Product') && s.offers) {
          const offers = Array.isArray(s.offers) ? s.offers : [s.offers];
          for (const o of offers) {
            if (o.price == null || o.price === '') {
              push('error', route, 'Product offer missing price');
            }
            if (o.priceCurrency && o.priceCurrency !== 'INR') {
              push('warn', route, `unexpected currency ${o.priceCurrency}`);
            }
          }
        }
      }
    } catch (e) {
      push('error', route, `invalid JSON-LD: ${e.message}`);
    }
  }

  if (title) {
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(route);
  }
  if (desc) {
    if (!descs.has(desc)) descs.set(desc, []);
    descs.get(desc).push(route);
  }
  if (canon) {
    if (!canons.has(canon)) canons.set(canon, []);
    canons.get(canon).push(route);
  }

  if (noindex && !stubs.has(route) && !route.startsWith('/admin')) {
    if (!route.startsWith('/accessories/') && !route.startsWith('/scooters/')) {
      push('warn', route, 'unexpected noindex');
    }
  }
}

for (const [t, rs] of titles) {
  if (rs.length > 1) push('error', rs.join(', '), `duplicate title: ${t}`);
}
for (const [, rs] of descs) {
  if (rs.length > 1) push('warn', rs.join(', '), `duplicate description (${rs.length} pages)`);
}
for (const [c, rs] of canons) {
  if (rs.length > 1) push('error', rs.join(', '), `duplicate canonical ${c}`);
}

const sm = readFileSync('public/sitemap.xml', 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const smPaths = locs.map((u) => {
  const p = u.replace(SITE, '');
  return p === '' || p === '/' ? '/' : p.replace(/\/$/, '');
});

for (const loc of locs) {
  if (!loc.startsWith(SITE)) push('error', loc, 'sitemap loc wrong host');
  if (loc.includes('www.')) push('error', loc, 'sitemap uses www');
  if (loc !== `${SITE}/` && loc.endsWith('/')) push('warn', loc, 'sitemap trailing slash');
  if (loc.startsWith('http://')) push('error', loc, 'sitemap uses http');
}

for (const p of smPaths) {
  const file = p === '/' ? join(DIST, 'index.html') : join(DIST, p.slice(1), 'index.html');
  if (!existsSync(file)) {
    push('error', p, 'sitemap URL missing prerender HTML');
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
      /content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html)) {
    push('error', p, 'noindex page listed in sitemap');
  }
}

// Every location must be in sitemap
for (const l of SERVICE_LOCATIONS) {
  if (!smPaths.includes(l.path)) push('error', l.path, 'location missing from sitemap');
}

const robots = readFileSync('public/robots.txt', 'utf8');
for (const needle of ['Disallow: /admin', 'Disallow: /ad-landing', 'Sitemap:']) {
  if (!robots.includes(needle)) push('error', '/robots.txt', `missing ${needle}`);
}
if (robots.includes('Disallow: /') && !robots.includes('Allow: /')) {
  push('error', '/robots.txt', 'blocks entire site');
}

// Near-me vs Berhampore uniqueness
const nearHtml = readFileSync(join(DIST, 'electric-scooter-near-me-berhampore', 'index.html'), 'utf8');
const berhHtml = readFileSync(join(DIST, 'electric-scooters-berhampore', 'index.html'), 'utf8');
const nearTitle = (nearHtml.match(/<title>([^<]+)/) || [])[1];
const berhTitle = (berhHtml.match(/<title>([^<]+)/) || [])[1];
if (nearTitle === berhTitle) {
  push('error', '/electric-scooter-near-me-berhampore', 'same title as berhampore location');
}

const errs = issues.filter((i) => i.sev === 'error');
const warns = issues.filter((i) => i.sev === 'warn');
console.log(`FILES ${files.length}  SITEMAP ${locs.length}  LOCATIONS ${SERVICE_LOCATIONS.length}`);
console.log(`ERRORS ${errs.length}`);
for (const i of errs) console.log(`E  ${i.route} :: ${i.msg}`);
console.log(`WARNINGS ${warns.length}`);
for (const i of warns) console.log(`W  ${i.route} :: ${i.msg}`);

if (errs.length) {
  console.error(`\nGSC_DEEP_AUDIT_FAILED: ${errs.length} error(s)`);
  process.exit(1);
}
console.log('\nGSC_DEEP_AUDIT_PASSED');
