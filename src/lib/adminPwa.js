/** Admin-only PWA — manifest + service worker scoped to /admin */

const MANIFEST = '/admin/manifest.webmanifest';
const SW_URL = '/admin/sw.js';
const SW_SCOPE = '/admin/';
const MARKER = 'data-admin-pwa';

let deferredPrompt = null;

function upsertLink(rel, href, extra = {}) {
  let el = document.querySelector(`link[rel="${rel}"][${MARKER}]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    el.setAttribute(MARKER, '');
    document.head.appendChild(el);
  }
  el.href = href;
  Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
}

function upsertMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"][${MARKER}]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    el.setAttribute(MARKER, '');
    document.head.appendChild(el);
  }
  el.content = content;
}

export function setupAdminPwa() {
  upsertLink('manifest', MANIFEST);
  upsertLink('apple-touch-icon', '/admin/apple-touch-icon.png');
  upsertMeta('mobile-web-app-capable', 'yes');
  upsertMeta('apple-mobile-web-app-capable', 'yes');
  upsertMeta('apple-mobile-web-app-title', 'BPH Admin');
  upsertMeta('apple-mobile-web-app-status-bar-style', 'default');
  upsertMeta('theme-color', '#2563EB');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).then((reg) => {
      reg.update();
    }).catch(() => {});
  }
}

export function teardownAdminPwa() {
  document.querySelectorAll(`[${MARKER}]`).forEach((el) => el.remove());
}

export function bindInstallPrompt() {
  const onPrompt = (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('admin-pwa-installable'));
  };
  window.addEventListener('beforeinstallprompt', onPrompt);
  return () => window.removeEventListener('beforeinstallprompt', onPrompt);
}

export async function promptAdminInstall() {
  if (!deferredPrompt) return { ok: false, reason: 'unavailable' };
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return { ok: outcome === 'accepted', reason: outcome };
}

export function isAdminStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
  );
}

export function isAdminInstallDismissed() {
  try {
    return localStorage.getItem('bph_admin_pwa_dismiss') === '1';
  } catch {
    return false;
  }
}

export function dismissAdminInstall() {
  try {
    localStorage.setItem('bph_admin_pwa_dismiss', '1');
  } catch (_) { /* ignore */ }
}

export function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

export function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isMobileDevice() {
  return isAndroid() || isIos();
}

export function hasInstallPrompt() {
  return Boolean(deferredPrompt);
}

export function isSecureForPwa() {
  return window.isSecureContext === true;
}
