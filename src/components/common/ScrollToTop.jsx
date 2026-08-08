import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Scroll to top on every route change (skips hash navigation). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) return;
    scrollToTop();
  }, [pathname, hash]);

  return null;
}

export { scrollToTop };
