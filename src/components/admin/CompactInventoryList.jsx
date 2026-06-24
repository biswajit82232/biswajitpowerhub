import { cn } from '@/lib/utils';

export function CompactInventoryList({ children, className }) {
  return (
    <div className={cn('divide-y divide-line overflow-hidden rounded-xl bg-surface ring-1 ring-line shadow-soft', className)}>
      {children}
    </div>
  );
}

export function CompactInventoryItem({ image, title, meta, tags, stockSelect, actions }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 sm:gap-2.5 sm:px-3 sm:py-2.5">
      <div className="shrink-0">{image}</div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <p className="truncate text-sm font-semibold text-heading">{title}</p>
          {tags && <div className="flex shrink-0 items-center gap-1">{tags}</div>}
        </div>
        {meta && <p className="truncate text-xs text-muted">{meta}</p>}
      </div>
      {stockSelect && <div className="hidden shrink-0 sm:block">{stockSelect}</div>}
      <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
    </div>
  );
}

export function CompactInventoryMobileStock({ children }) {
  return (
    <div className="border-t border-line/80 px-2 py-1.5 sm:hidden [&_select]:h-8 [&_select]:w-full [&_select]:text-xs">
      {children}
    </div>
  );
}
