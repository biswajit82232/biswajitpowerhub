import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Compact pull-to-refresh indicator — small spinner, no large pill.
 */
export function AdminPullRefresh({ pullPx, refreshing, threshold = 48 }) {
  const visible = refreshing || pullPx > 4;
  const ready = pullPx >= threshold;
  const height = refreshing ? 28 : Math.min(pullPx, 36);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center"
      style={{ height }}
      aria-hidden
    >
      <div
        className={cn(
          'mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface ring-1 ring-line transition-opacity',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        <RefreshCw
          className={cn(
            'h-3.5 w-3.5 text-brand-600',
            refreshing && 'animate-spin',
            !refreshing && ready && 'text-brand-700',
          )}
        />
      </div>
    </div>
  );
}
