import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, EVENT } from '@/lib/tracking';

/** Fire a page_view event on every route change. */
export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    trackEvent(EVENT.PAGE_VIEW, { path: location.pathname });
  }, [location.pathname]);
}
