import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, EVENT } from '@/lib/tracking';
import { captureFromLocation } from '@/lib/attribution';

/** Fire a page_view event on every route change. Capture UTM first. */
export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    captureFromLocation(location);
    trackEvent(EVENT.PAGE_VIEW, { path: location.pathname });
  }, [location.pathname, location.search]);
}
