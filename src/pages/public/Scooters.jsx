import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, GitCompare } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { ScooterCard } from '@/features/scooters/ScooterCard';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';

const SORTS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'range-desc': (a, b) => b.range - a.range,
};

export default function Scooters() {
  const { data: scooters, loading } = useAsync(() => getScooters(), []);
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

  return (
    <>
      <SEO
        title="Electric Scooters"
        description="Browse our full range of premium low-speed electric scooters. No licence, no registration required for eligible models."
        path="/scooters"
      />

      {/* Header */}
      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-12 sm:py-16">
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              Our Range
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">
              Find your perfect ride
            </h1>
            <p className="mt-3 max-w-xl text-body">
              Premium electric scooters for every budget and journey. Compare specs, calculate EMI,
              and book a test ride.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-[var(--header-offset)] z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="container-px flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search scooters…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11"
              aria-label="Search scooters"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted sm:block" />
              <Select value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-52 sm:pl-10" aria-label="Sort">
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="range-desc">Range: High to Low</option>
              </Select>
            </div>
            <button
              onClick={() => setStockOnly((v) => !v)}
              className={`tap-target shrink-0 rounded-xl px-4 text-sm font-semibold ring-1 transition ${
                stockOnly ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'bg-surface text-body ring-line'
              }`}
            >
              In stock
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-px py-10 sm:py-14">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? 'Loading…' : `${filtered.length} model${filtered.length !== 1 ? 's' : ''}`}
          </p>
          <Button to="/compare" variant="ghost" size="sm" icon={GitCompare}>
            Compare models
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filtered.map((s, i) => (
              <ScooterCard key={s.id} scooter={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
