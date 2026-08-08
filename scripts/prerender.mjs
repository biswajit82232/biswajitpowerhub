/**
 * Post-build prerender — visits key public routes and writes static HTML into dist/
 * so crawlers receive real title/meta/content without executing the SPA.
 */
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = 4179;

const ROUTES = [
  '/',
  '/scooters',
  '/scooters/activa',
  '/scooters/single-light',
  '/scooters/double-light',
  '/scooters/zoom',
  '/contact',
  '/reviews',
  '/about',
  '/compare',
  '/terms',
  '/privacy',
  '/accessories',
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

function contentType(filePath) {
  return MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        let filePath = join(DIST, urlPath === '/' ? 'index.html' : urlPath);

        if (existsSync(filePath) && statSync(filePath).isDirectory()) {
          filePath = join(filePath, 'index.html');
        }

        if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
          // SPA fallback for client routes during prerender
          filePath = join(DIST, 'index.html');
        }

        const body = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType(filePath) });
        res.end(body);
      } catch {
        res.writeHead(500);
        res.end('error');
      }
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function outPathForRoute(route) {
  if (route === '/') return join(DIST, 'index.html');
  return join(DIST, route.replace(/^\//, ''), 'index.html');
}

async function main() {
  // Vercel build images lack Chrome system libs (libnss3, etc.) — use fallback-prerender.mjs instead
  if (process.env.SKIP_PRERENDER === '1' || process.env.VERCEL === '1') {
    console.warn(
      '[prerender] skipping browser prerender on Vercel/CI — fallback-prerender.mjs handles SEO HTML',
    );
    return;
  }

  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('[prerender] dist/index.html missing — run vite build first');
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.warn('[prerender] puppeteer not installed — skipping prerender');
    return;
  }

  let server;
  let browser;
  try {
    server = await startStaticServer();
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `http://127.0.0.1:${PORT}${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        // Wait for React + Helmet to settle
        await page.waitForFunction(
          () => {
            const title = document.title || '';
            const root = document.getElementById('root');
            return title.length > 5 && root && root.childElementCount > 0;
          },
          { timeout: 30000 },
        );
        await new Promise((r) => setTimeout(r, 400));

        const html = await page.content();
        const out = outPathForRoute(route);
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, html, 'utf8');
        console.log(`[prerender] ${route} → ${out.replace(ROOT, '.')}`);
      } catch (err) {
        console.warn(`[prerender] failed ${route}:`, err.message);
      } finally {
        await page.close();
      }
    }
    console.log('[prerender] done');
  } catch (err) {
    // Don't fail Vercel/CI builds when Chromium cannot launch
    console.warn('[prerender] skipped due to error:', err.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) server.close();
  }
}

main().catch((err) => {
  console.warn('[prerender] skipped:', err.message);
  process.exit(0);
});
