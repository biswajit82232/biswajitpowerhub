/**
 * Build-time sitemap + robots.txt generator.
 * Includes static pages, SEO landings, location pages, guides, and SEO-ready scooters.
 * Accessory detail URLs with substantive seed copy are included; thin stubs stay out.
 */
import { writeFileSync } from 'fs';
import { SEO_READY_SCOOTER_IDS } from '../src/data/seoReady.js';
import { SERVICE_LOCATIONS } from '../src/data/locations.js';
import { BLOG_POSTS } from '../src/data/blogPosts.js';
import { ACCESSORIES } from '../src/data/accessories.js';

const BASE = (process.env.VITE_SITE_URL || 'https://biswajitpowerhub.in').replace(/\/$/, '');
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/scooters', priority: '0.9', changefreq: 'weekly' },
  { path: '/best-electric-scooters-berhampore', priority: '0.9', changefreq: 'weekly' },
  { path: '/electric-scooter-near-me-berhampore', priority: '0.9', changefreq: 'weekly' },
  { path: '/battery-scooty-berhampore', priority: '0.9', changefreq: 'weekly' },
  { path: '/areas-we-serve', priority: '0.85', changefreq: 'weekly' },
  { path: '/low-budget-electric-scooters-berhampore', priority: '0.85', changefreq: 'weekly' },
  { path: '/no-licence-electric-scooters-west-bengal', priority: '0.85', changefreq: 'weekly' },
  { path: '/battery-upgrade-berhampore', priority: '0.8', changefreq: 'monthly' },
  { path: '/test-ride-berhampore', priority: '0.8', changefreq: 'monthly' },
  ...SERVICE_LOCATIONS.map((l) => ({ path: l.path, priority: '0.85', changefreq: 'weekly' })),
  { path: '/guides', priority: '0.8', changefreq: 'weekly' },
  ...BLOG_POSTS.map((p) => ({ path: p.path, priority: '0.75', changefreq: 'monthly' })),
  { path: '/accessories', priority: '0.65', changefreq: 'weekly' },
  { path: '/community', priority: '0.7', changefreq: 'weekly' },
  { path: '/compare', priority: '0.5', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/service', priority: '0.7', changefreq: 'monthly' },
  { path: '/finance', priority: '0.75', changefreq: 'monthly' },
  { path: '/offers', priority: '0.7', changefreq: 'weekly' },
  { path: '/contact', priority: '0.85', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

function urlEntry(loc, priority, changefreq) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const scooterIds = [...SEO_READY_SCOOTER_IDS];
const indexableAccessories = ACCESSORIES.filter(
  (a) => a?.id && String(a.description || '').trim().length >= 40,
);

const urls = [
  ...STATIC_PAGES.map((p) => urlEntry(`${BASE}${p.path === '/' ? '/' : p.path}`, p.priority, p.changefreq)),
  ...scooterIds.map((id) => urlEntry(`${BASE}/scooters/${id}`, '0.85', 'weekly')),
  ...indexableAccessories.map((a) => urlEntry(`${BASE}/accessories/${a.id}`, '0.5', 'monthly')),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dealership
Disallow: /updates
Disallow: /ad-landing

Sitemap: ${BASE}/sitemap.xml
`;

writeFileSync('public/sitemap.xml', sitemap);
writeFileSync('public/robots.txt', robots);
console.log(
  `[sitemap] Generated ${urls.length} URLs for ${BASE} (${scooterIds.length} scooters, ${SERVICE_LOCATIONS.length} locations, ${BLOG_POSTS.length} guides, ${indexableAccessories.length} accessories)`,
);
