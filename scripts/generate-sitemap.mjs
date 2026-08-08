/**
 * Build-time sitemap + robots.txt generator.
 * Uses Supabase scooters/accessories when env vars are set (Vercel build), else seed catalog.
 */
import { writeFileSync } from 'fs';
import { SCOOTERS } from '../src/data/scooters.js';

const BASE = (process.env.VITE_SITE_URL || 'https://biswajitpowerhub.in').replace(/\/$/, '');
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/scooters', priority: '0.9', changefreq: 'weekly' },
  { path: '/accessories', priority: '0.7', changefreq: 'weekly' },
  { path: '/reviews', priority: '0.7', changefreq: 'weekly' },
  { path: '/compare', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

async function fetchIds(table) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=id&order=name.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length) return rows.map((r) => r.id);
  } catch (e) {
    console.warn(`[sitemap] Supabase ${table} fetch failed:`, e.message);
  }
  return null;
}

async function fetchScooterIds() {
  return (await fetchIds('scooters')) || SCOOTERS.map((s) => s.id);
}

async function fetchAccessoryIds() {
  return (await fetchIds('accessories')) || [];
}

function urlEntry(loc, priority, changefreq) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const scooterIds = await fetchScooterIds();
const accessoryIds = await fetchAccessoryIds();

const urls = [
  ...STATIC_PAGES.map((p) => urlEntry(`${BASE}${p.path === '/' ? '/' : p.path}`, p.priority, p.changefreq)),
  ...scooterIds.map((id) => urlEntry(`${BASE}/scooters/${id}`, '0.85', 'weekly')),
  ...accessoryIds.map((id) => urlEntry(`${BASE}/accessories/${id}`, '0.6', 'monthly')),
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

Sitemap: ${BASE}/sitemap.xml
`;

writeFileSync('public/sitemap.xml', sitemap);
writeFileSync('public/robots.txt', robots);
console.log(
  `[sitemap] Generated ${urls.length} URLs for ${BASE} (${scooterIds.length} scooters, ${accessoryIds.length} accessories)`,
);
