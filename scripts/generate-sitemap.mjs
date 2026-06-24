/**
 * Build-time sitemap + robots.txt generator.
 * Uses Supabase scooters when env vars are set (Vercel build), else seed catalog.
 */
import { writeFileSync } from 'fs';
import { SCOOTERS } from '../src/data/scooters.js';

const BASE = (process.env.VITE_SITE_URL || 'https://biswajitpowerhub.vercel.app').replace(/\/$/, '');
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/scooters', priority: '0.9', changefreq: 'weekly' },
  { path: '/reviews', priority: '0.7', changefreq: 'weekly' },
  { path: '/compare', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

async function fetchScooterIds() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return SCOOTERS.map((s) => s.id);

  try {
    const res = await fetch(`${url}/rest/v1/scooters?select=id&order=name.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length) return rows.map((r) => r.id);
  } catch (e) {
    console.warn('[sitemap] Supabase fetch failed, using seed catalog:', e.message);
  }
  return SCOOTERS.map((s) => s.id);
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

const urls = [
  ...STATIC_PAGES.map((p) => urlEntry(`${BASE}${p.path}`, p.priority, p.changefreq)),
  ...scooterIds.map((id) => urlEntry(`${BASE}/scooters/${id}`, '0.85', 'weekly')),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${BASE}/sitemap.xml
`;

writeFileSync('public/sitemap.xml', sitemap);
writeFileSync('public/robots.txt', robots);
console.log(`[sitemap] Generated ${STATIC_PAGES.length + scooterIds.length} URLs for ${BASE}`);
