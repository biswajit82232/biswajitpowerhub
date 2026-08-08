import { Search } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export const catalogSelectClass =
  'h-9 rounded-lg px-2.5 text-sm ring-1 ring-line bg-surface focus:ring-2 focus:ring-brand-400 focus:outline-none appearance-none pr-7';

function StockToggle({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 shrink-0 rounded-lg px-2.5 text-xs font-semibold ring-1 transition whitespace-nowrap',
        active ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'bg-surface text-body ring-line',
      )}
    >
      In stock
    </button>
  );
}

/**
 * Compact search / sort bar for product listing pages.
 */
export function CatalogToolbar({
  searchPlaceholder,
  query,
  onQueryChange,
  searchAriaLabel,
  sort,
  onSortChange,
  sortOptions,
  stockOnly,
  onStockOnlyChange,
  countLabel,
  actions,
  leading,
  children,
}) {
  return (
    <div className="border-b border-line bg-surface-alt/40">
      <div className="container-px py-2">
        {leading}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="h-9 rounded-lg pl-8 pr-2.5 text-sm"
              aria-label={searchAriaLabel}
            />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto scrollbar-none">
            {children}
            <Select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className={cn(catalogSelectClass, 'w-[8.25rem] sm:w-36')}
              aria-label="Sort"
            >
              {sortOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <StockToggle active={stockOnly} onClick={() => onStockOnlyChange(!stockOnly)} />
          </div>
        </div>

        {(countLabel || actions) && (
          <div className="mt-1.5 flex items-center justify-between gap-2">
            {countLabel ? <p className="text-xs text-muted">{countLabel}</p> : <span />}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function CatalogSelect({ className, ...props }) {
  return <Select className={cn(catalogSelectClass, className)} {...props} />;
}
