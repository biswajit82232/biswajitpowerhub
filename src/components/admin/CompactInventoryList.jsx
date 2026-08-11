import { cn } from '@/lib/utils';

export function CompactInventoryList({ children, className }) {
  return (
    <div
      className={cn(
        'divide-y divide-line overflow-hidden rounded-2xl bg-surface ring-1 ring-line shadow-soft',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Clean inventory row: title / meta / tags left; stock + actions right.
 * Stock sits in the same flow on mobile (no second strip).
 */
export function CompactInventoryItem({ image, title, meta, tags, stockSelect, actions }) {
  return (
    <div className="px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex items-start gap-3">
        <div className="shrink-0">{image}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading sm:text-[0.9375rem]">{title}</p>
              {meta && <p className="mt-0.5 truncate text-xs text-muted">{meta}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:hidden">{actions}</div>
          </div>

          {tags && <div className="mt-1.5 flex flex-wrap items-center gap-1">{tags}</div>}

          <div className="mt-2.5 flex items-center gap-2 sm:mt-0 sm:hidden">
            {stockSelect && <div className="min-w-0 flex-1">{stockSelect}</div>}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {stockSelect && <div className="shrink-0">{stockSelect}</div>}
          <div className="flex items-center gap-1">{actions}</div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Prefer stockSelect on CompactInventoryItem — kept for older call sites */
export function CompactInventoryMobileStock({ children }) {
  return (
    <div className="border-t border-line/80 px-3 py-2 sm:hidden [&_select]:h-9 [&_select]:w-full [&_select]:text-xs">
      {children}
    </div>
  );
}
