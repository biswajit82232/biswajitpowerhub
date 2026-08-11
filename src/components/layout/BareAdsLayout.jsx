import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { FloatingWhatsApp } from '@/components/common/FloatingWhatsApp';
import { MobileLocalCTA } from '@/components/common/MobileLocalCTA';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RouteLoader } from '@/components/ui/Loading';
import { usePageTracking } from '@/hooks/usePageTracking';

/** Minimal layout for ads landing — no header/footer nav */
export function BareAdsLayout() {
  usePageTracking();

  return (
    <div className="min-h-screen min-w-0 w-full overflow-x-clip">
      <GoogleAnalytics />
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader label="Loading" />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
      <MobileLocalCTA />
      <FloatingWhatsApp />
    </div>
  );
}
