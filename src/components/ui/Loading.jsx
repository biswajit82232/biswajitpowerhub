import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 22 }) {
  return <Loader2 style={{ width: size, height: size }} className={cn('animate-spin text-brand-500', className)} />;
}

/**
 * Slim gradient progress bar at the very top of the viewport.
 * Used as the Suspense fallback — invisible and non-disruptive.
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
