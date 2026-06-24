import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { PageLoader } from '@/components/ui/Loading';
import { usePageTracking } from '@/hooks/usePageTracking';

function FadeOutlet() {
  const location = useLocation();
  const isFirst = useRef(true);
  const ref = useRef(null);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.classList.remove('animate-page-fade-in');
    void el.offsetHeight;
    el.classList.add('animate-page-fade-in');
  }, [location.pathname]);

  return (
    <div ref={ref} className="min-w-0">
      <Outlet />
    </div>
  );
}

export function PublicLayout() {
  usePageTracking();

  return (
    <div className="flex min-h-screen min-w-0 w-full flex-col overflow-x-clip">
      <ScrollToTop />
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-clip pt-[var(--header-offset)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Suspense fallback={<PageLoader />}>
          <FadeOutlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
