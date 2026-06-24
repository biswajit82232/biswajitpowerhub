import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 22 }) {
  return <Loader2 style={{ width: size, height: size }} className={cn('animate-spin text-brand-500', className)} />;
}

/** Full-section centered loader (used for Suspense fallbacks). */
export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner size={28} />
      <p className="text-sm font-medium">{label}…</p>
    </div>
  );
}
