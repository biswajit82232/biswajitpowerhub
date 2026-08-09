import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * Capture-phase fallback for tel: / maps clicks that lack an explicit onClick.
 * Existing Button handlers still fire; trackGAEvent dedupes within ~600ms.
 */

function closestAnchor(el) {
  if (!el || typeof el.closest !== 'function') return null;
  return el.closest('a[href]');
}

function isMapsHref(href) {
  if (!href) return false;
  try {
    const u = new URL(href, window.location.origin);
    const host = u.hostname.replace(/^www\./, '');
    return (
      host === 'maps.app.goo.gl' ||
      host === 'goo.gl' ||
      host === 'maps.google.com' ||
      (host === 'google.com' && u.pathname.startsWith('/maps')) ||
      (host.endsWith('google.com') && u.pathname.includes('/maps'))
    );
  } catch {
    return /maps\.app\.goo\.gl|google\.[^/]+\/maps|maps\.google\./i.test(href);
  }
}

function onDocumentClick(ev) {
  const a = closestAnchor(ev.target);
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (!href || href.startsWith('#')) return;

  if (/^tel:/i.test(href)) {
    trackEvent(EVENT.CALL_CLICK, { from: a.dataset.trackFrom || 'tel-link' });
    return;
  }

  if (isMapsHref(href)) {
    trackEvent(EVENT.DIRECTIONS_CLICK, { from: a.dataset.trackFrom || 'maps-link' });
  }
}

let attached = false;

export function initOutboundClickTracking() {
  if (attached || typeof document === 'undefined') return;
  attached = true;
  document.addEventListener('click', onDocumentClick, true);
}
