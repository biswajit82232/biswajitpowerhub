import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { PageLoader } from '@/components/ui/Loading';
import { usePageTracking } from '@/hooks/usePageTracking';

export function PublicLayout() {
  const location = useLocation();
  usePageTracking();

  return (
    <div className="flex min-h-screen flex-col bg-sky-fade">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-[var(--header-height)]">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
