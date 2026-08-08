/**
 * Generate favicon / PWA / OG assets from public/brand-logo.png (real BPH logo).
 * Usage: node scripts/generate-brand-pngs.mjs
 */
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const ADMIN = join(PUBLIC, 'admin');
const SOURCE = join(PUBLIC, 'brand-logo.png');

const BRAND = { r: 37, g: 99, b: 235 }; // brand-600-ish blue
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function squareOnBg(input, size, bg, paddingRatio = 0.12) {
  const pad = Math.round(size * paddingRatio);
  const inner = size - pad * 2;
  const resized = await sharp(input)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toBuffer();
}

async function makeTransparent(inputBuf) {
  // Turn near-white pixels transparent so logo works on dark/light UI
  const { data, info } = await sharp(inputBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error('[brand-pngs] public/brand-logo.png missing — drop the real BPH logo there first');
    process.exit(1);
  }

  const meta = await sharp(SOURCE).metadata();
  console.log(`[brand-pngs] source ${meta.width}×${meta.height}`);

  // Trim excess white border, then make transparent
  const trimmed = await sharp(SOURCE).trim({ threshold: 20 }).png().toBuffer();
  const transparent = await makeTransparent(trimmed);

  // Master logo used in UI (transparent)
  await sharp(transparent).png().toFile(join(PUBLIC, 'logo.png'));
  console.log('[brand-pngs] wrote public/logo.png');

  // Header / preload sized copy
  await sharp(transparent)
    .resize(384, 384, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(PUBLIC, 'logo-192.png'));
  console.log('[brand-pngs] wrote public/logo-192.png');

  await sharp(transparent)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(PUBLIC, 'logo-512.png'));
  console.log('[brand-pngs] wrote public/logo-512.png');

  // Favicons / apple touch (white / brand pads for clarity at small sizes)
  const favicon = await squareOnBg(transparent, 48, WHITE, 0.08);
  await sharp(favicon).png().toFile(join(PUBLIC, 'favicon.png'));
  console.log('[brand-pngs] wrote public/favicon.png');

  const apple = await squareOnBg(transparent, 180, WHITE, 0.1);
  await sharp(apple).png().toFile(join(PUBLIC, 'apple-touch-icon.png'));
  console.log('[brand-pngs] wrote public/apple-touch-icon.png');

  // OG 1200×630 — real black logo on clean light canvas with brand accent bars
  const ogLogo = await sharp(transparent)
    .resize(780, 420, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const accentBar = await sharp({
    create: { width: 1200, height: 10, channels: 3, background: BRAND },
  })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: { r: 248, g: 250, b: 252 } },
  })
    .composite([
      { input: ogLogo, gravity: 'centre' },
      { input: accentBar, top: 0, left: 0 },
      { input: accentBar, top: 620, left: 0 },
    ])
    .png()
    .toFile(join(PUBLIC, 'og-image.png'));
  console.log('[brand-pngs] wrote public/og-image.png');

  // Admin PWA icons
  for (const size of [96, 144, 192, 512]) {
    const buf = await squareOnBg(transparent, size, WHITE, 0.12);
    await sharp(buf).png().toFile(join(ADMIN, `icon-${size}.png`));
    console.log(`[brand-pngs] wrote public/admin/icon-${size}.png`);
  }
  await sharp(apple).png().toFile(join(ADMIN, 'apple-touch-icon.png'));
  console.log('[brand-pngs] wrote public/admin/apple-touch-icon.png');

  // Simple SVG favicon wrapper pointing browsers that prefer SVG to PNG via foreignObject isn't ideal —
  // write a square SVG that embeds the brand look as a link-friendly mark (PNG remains primary).
  console.log('[brand-pngs] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
