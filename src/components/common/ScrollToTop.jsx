import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to top on every route change (skips hash navigation). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, hash]);
  return null;
}
