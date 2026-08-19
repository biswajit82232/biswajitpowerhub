/** Meta Page Plugin — official iframe, no app token. Width is 180–500px. */

const PLUGIN_MIN_W = 180;
const PLUGIN_MAX_W = 500;
const PLUGIN_MIN_H = 70;
const PLUGIN_MAX_H = 800;

/** Page Plugin prefers facebook.com/{pageId}; /p/Name-ID links still work as hrefs. */
export function facebookPluginHref(pageUrl) {
  if (!pageUrl || typeof pageUrl !== 'string') return '';
  let parsed;
  try {
    parsed = new URL(pageUrl.trim());
  } catch {
    return '';
  }
  if (!/^https?:$/i.test(parsed.protocol) || !/^(www\.)?facebook\.com$/i.test(parsed.hostname)) {
    return '';
  }
  const path = parsed.pathname.replace(/\/+$/, '');
  const fromPretty = path.match(/\/p\/.+-(\d{10,})$/i);
  if (fromPretty) return `https://www.facebook.com/${fromPretty[1]}`;
  const fromId = path.match(/^\/(\d{10,})$/);
  if (fromId) return `https://www.facebook.com/${fromId[1]}`;
  return `https://www.facebook.com${path}`;
}

export function facebookPagePluginSrc(pageUrl, width = PLUGIN_MAX_W, height = 620) {
  const href = facebookPluginHref(pageUrl);
  if (!href) return '';
  const w = Math.min(PLUGIN_MAX_W, Math.max(PLUGIN_MIN_W, Math.round(Number(width) || PLUGIN_MAX_W)));
  const h = Math.min(PLUGIN_MAX_H, Math.max(PLUGIN_MIN_H, Math.round(Number(height) || 620)));
  const q = new URLSearchParams({
    href,
    tabs: 'timeline',
    width: String(w),
    height: String(h),
    small_header: 'false',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'false',
  });
  return `https://www.facebook.com/plugins/page.php?${q.toString()}`;
}
