/**
 * Rasterize public/favicon.svg into logo/favicon PNGs for OG + PWA icons.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SVG_PATH = join(PUBLIC, 'favicon.svg');

const SIZES = [
  { file: 'favicon.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'logo-192.png', size: 192 },
  { file: 'logo-512.png', size: 512 },
];

async function main() {
  if (!existsSync(SVG_PATH)) {
    console.error('[brand-pngs] favicon.svg missing');
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.warn('[brand-pngs] puppeteer not installed — skip');
    process.exit(0);
  }

  const svg = readFileSync(SVG_PATH, 'utf8');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const { file, size } of SIZES) {
      const page = await browser.newPage();
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(
        `<!doctype html><html><body style="margin:0;background:transparent">${svg.replace(
          'width="64"',
          `width="${size}"`,
        ).replace('height="64"', `height="${size}"`)}</body></html>`,
        { waitUntil: 'load' },
      );
      const buf = await page.screenshot({ type: 'png', omitBackground: false });
      writeFileSync(join(PUBLIC, file), buf);
      console.log(`[brand-pngs] wrote public/${file} (${size}×${size})`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
