import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initGoogleAnalytics,
  isGoogleAnalyticsConfigured,
  trackGAPageView,
} from '@/lib/googleAnalytics';

/** GA4 page views on public route changes (deferred script load). */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (isGoogleAnalyticsConfigured) initGoogleAnalytics();
  }, []);

  useEffect(() => {
    if (!isGoogleAnalyticsConfigured) return;
    const path = location.pathname + location.search;
    trackGAPageView(path);
  }, [location.pathname, location.search]);

  return null;
}
