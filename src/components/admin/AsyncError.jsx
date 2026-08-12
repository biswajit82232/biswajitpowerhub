import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Surface useAsync failures so empty states are not mistaken for “no data”.
 */
export function AsyncError({ error, onRetry, className }) {
  if (!error) return null;
  const message = error?.message || String(error) || 'Something went wrong.';

  return (
    <div
      role="alert"
      className={cn(
        'mb-4 flex flex-col gap-3 rounded-xl bg-red-50 px-3 py-3 ring-1 ring-red-100 sm:flex-row sm:items-center sm:px-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-700">Could not load data</p>
          <p className="mt-0.5 text-xs text-red-600/90">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button type="button" variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry} className="shrink-0">
          Retry
        </Button>
      )}
    </div>
  );
}
