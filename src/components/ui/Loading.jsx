import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 22 }) {
  return <Loader2 style={{ width: size, height: size }} className={cn('animate-spin text-brand-500', className)} />;
}

/**
 * Slim gradient progress bar at the very top of the viewport.
 * Pair with RouteLoader when the page body would otherwise collapse.
 */
export function PageLoader() {
  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden"
    >
      <div
        className="h-full w-full origin-left animate-[page-progress_1.2s_ease-in-out_infinite] bg-gradient-to-r from-brand-400 via-cyan-400 to-teal-400"
      />
    </div>
  );
}

/** In-flow loading shell — keeps layout height so the page does not jump to the footer. */
export function RouteLoader({ children, className, label = 'Loading page' }) {
  return (
    <div
      className={cn(
        'min-h-[calc(100vh-var(--header-offset)-10rem)] w-full',
        className,
      )}
      aria-busy="true"
      aria-label={label}
    >
      <PageLoader />
      {children ?? (
        <div className="flex items-center justify-center py-24">
          <Spinner size={28} />
        </div>
      )}
    </div>
  );
}
