import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Scroll to top on every route change; honour hash anchors (e.g. #callback). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '');
      // Wait a tick for lazy page content
      const t = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => window.clearTimeout(t);
    }
    scrollToTop();
    return undefined;
  }, [pathname, hash]);

  return null;
}

export { scrollToTop };
