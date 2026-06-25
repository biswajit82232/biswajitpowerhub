import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initGoogleAnalytics,
  isGoogleAnalyticsConfigured,
  isGtagLoadedFromHtml,
  trackGAPageView,
} from '@/lib/googleAnalytics';

/** GA4 page views on SPA route changes (initial hit comes from index.html gtag). */
export function GoogleAnalytics() {
  const location = useLocation();
  const isFirstRoute = useRef(true);

  useEffect(() => {
    if (isGoogleAnalyticsConfigured) initGoogleAnalytics();
  }, []);

  useEffect(() => {
    if (!isGoogleAnalyticsConfigured) return;
    const path = location.pathname + location.search;

    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      if (isGtagLoadedFromHtml()) return;
    }

    trackGAPageView(path);
  }, [location.pathname, location.search]);

  return null;
}
