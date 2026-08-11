import { Search } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const STOCK_FILTERS = [
  { value: 'all', label: 'All stock' },
  { value: 'in_stock', label: 'In stock' },
  { value: 'low_stock', label: 'Few left' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

export function InventoryStockSelect({ value, onChange, className, fullWidth = false }) {
  return (
    <Select
      value={value}
      onChange={onChange}
      aria-label="Update stock"
      className={cn(
        'h-9 rounded-xl px-2.5 text-xs',
        fullWidth ? 'w-full' : 'w-full sm:w-[8rem]',
        className,
      )}
    >
      <option value="in_stock">In Stock</option>
      <option value="low_stock">Few Left</option>
      <option value="out_of_stock">Out of Stock</option>
    </Select>
  );
}

/**
 * Search + stock filter toolbar for catalog lists.
 * Optional summary chips: { all, in_stock, low_stock, out_of_stock }
 */
export function InventoryToolbar({
  search,
  onSearchChange,
  stockFilter = 'all',
  onStockFilterChange,
  searchPlaceholder = 'Search…',
  counts,
  extraFilter,
  className,
}) {
  return (
    <div className={cn('mb-4 space-y-3', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={2.2}
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 pl-9 text-sm"
            aria-label="Search inventory"
          />
        </div>
        <Select
          value={stockFilter}
          onChange={(e) => onStockFilterChange(e.target.value)}
          className="h-10 w-full shrink-0 rounded-xl px-3 text-sm sm:w-[10.5rem]"
          aria-label="Filter by stock"
        >
          {STOCK_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
              {counts && opt.value !== 'all' && counts[opt.value] != null
                ? ` (${counts[opt.value]})`
                : opt.value === 'all' && counts?.all != null
                  ? ` (${counts.all})`
                  : ''}
            </option>
          ))}
        </Select>
        {extraFilter}
      </div>

      {counts && (
        <div className="flex flex-wrap gap-1.5">
          <SummaryChip
            active={stockFilter === 'all'}
            onClick={() => onStockFilterChange('all')}
            label="All"
            count={counts.all}
          />
          <SummaryChip
            active={stockFilter === 'in_stock'}
            onClick={() => onStockFilterChange('in_stock')}
            label="In stock"
            count={counts.in_stock}
            tone="success"
          />
          <SummaryChip
            active={stockFilter === 'low_stock'}
            onClick={() => onStockFilterChange('low_stock')}
            label="Few left"
            count={counts.low_stock}
            tone="warning"
          />
          <SummaryChip
            active={stockFilter === 'out_of_stock'}
            onClick={() => onStockFilterChange('out_of_stock')}
            label="Out"
            count={counts.out_of_stock}
            tone="danger"
          />
        </div>
      )}
    </div>
  );
}

function SummaryChip({ label, count, active, onClick, tone = 'neutral' }) {
  const tones = {
    neutral: active ? 'bg-navy text-white' : 'bg-surface-alt text-body hover:bg-slate-100',
    success: active ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    warning: active ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100',
    danger: active ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
        tones[tone],
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'opacity-90' : 'opacity-70')}>{count ?? 0}</span>
    </button>
  );
}
