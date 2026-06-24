import { useMemo, useState } from 'react';
import { Search, GitCompare } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { ScooterCardWithInsights } from '@/features/scooters/ScooterCardWithInsights';
import { getScooterInsights } from '@/features/analytics/popularityService';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';

const SORTS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'range-desc': (a, b) => b.range - a.range,
};

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'range-desc', label: 'Range ↓' },
];

export default function Scooters() {
  const { data: scooters, loading } = useAsync(() => getScooters(), []);
  const { data: insights } = useAsync(
    () => (scooters?.length ? getScooterInsights(scooters) : Promise.resolve(null)),
    [scooters?.length],
  );
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('price-asc');
  const [stockOnly, setStockOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = [...(scooters || [])];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q)
      );
    }
    if (stockOnly) list = list.filter((s) => s.stock !== 'out_of_stock');
    list.sort(SORTS[sort]);
    return list;
  }, [scooters, query, sort, stockOnly]);

  const countLabel = loading
    ? 'Loading…'
    : `${filtered.length} model${filtered.length !== 1 ? 's' : ''}`;

  return (
    <>
      <SEO
        title="Electric Scooters"
        description="Browse our full range of premium low-speed electric scooters. No licence, no registration required for eligible models."
        path="/scooters"
      />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-6 sm:py-8">
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 sm:text-xs">
              Our Range
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-heading sm:text-display-lg">
              Find your perfect ride
            </h1>
            <p className="mt-2 max-w-xl text-sm text-body sm:text-base">
              Premium electric scooters for every budget. Compare specs, calculate EMI, and book a test ride.
            </p>
          </Reveal>
        </div>
      </section>

      <CatalogToolbar
        searchPlaceholder="Search scooters…"
        query={query}
        onQueryChange={setQuery}
        searchAriaLabel="Search scooters"
        sort={sort}
        onSortChange={setSort}
        sortOptions={SORT_OPTIONS}
        stockOnly={stockOnly}
        onStockOnlyChange={setStockOnly}
        countLabel={countLabel}
        actions={
          <Button to="/compare" variant="ghost" size="sm" icon={GitCompare} className="h-7 px-2 text-xs">
            Compare
          </Button>
        }
      />

      <div className="container-px py-6 sm:py-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ScooterCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No scooters found"
            description="Try adjusting your search or filters."
            action={
              <Button variant="secondary" onClick={() => { setQuery(''); setStockOnly(false); }}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filtered.map((s, i) => (
              <ScooterCardWithInsights key={s.id} scooter={s} index={i} insights={insights} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
