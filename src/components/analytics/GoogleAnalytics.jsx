import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initGoogleAnalytics,
  configureGoogleAds,
  isGoogleAnalyticsConfigured,
  isGtagLoadedFromHtml,
  trackGAPageView,
} from '@/lib/googleAnalytics';
import { initOutboundClickTracking } from '@/lib/outboundClickTracking';

/** GA4 page views on SPA route changes (initial hit sent by the idle gtag loader's config). */
export function GoogleAnalytics() {
  const location = useLocation();
  const isFirstRoute = useRef(true);

  useEffect(() => {
    if (isGoogleAnalyticsConfigured) {
      initGoogleAnalytics();
      configureGoogleAds();
      initOutboundClickTracking();
    }
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
