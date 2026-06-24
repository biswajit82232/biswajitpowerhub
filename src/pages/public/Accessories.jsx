import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { CatalogToolbar, CatalogSelect } from '@/components/catalog/CatalogToolbar';
import { AccessoryCard } from '@/features/accessories/AccessoryCard';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getAccessories } from '@/features/accessories/accessoryService';
import { ACCESSORY_CATEGORIES, PART_SECTIONS } from '@/data/accessories';

const SORTS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
};

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'name-asc', label: 'Name A–Z' },
];

export default function Accessories() {
  const { data: accessories, loading } = useAsync(() => getAccessories(), []);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('price-asc');
  const [section, setSection] = useState('all');
  const [category, setCategory] = useState('all');
  const [stockOnly, setStockOnly] = useState(false);

  const activeSection = PART_SECTIONS.find((s) => s.id === section);

  const filtered = useMemo(() => {
    let list = [...(accessories || [])];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.compatibility || '').toLowerCase().includes(q)
      );
    }
    if (section !== 'all' && activeSection?.categories) {
      list = list.filter((a) => activeSection.categories.includes(a.category));
    }
    if (category !== 'all') list = list.filter((a) => a.category === category);
    if (stockOnly) list = list.filter((a) => a.stock !== 'out_of_stock');
    list.sort(SORTS[sort]);
    return list;
  }, [accessories, query, sort, section, category, stockOnly, activeSection]);

  const countLabel = loading
    ? 'Loading…'
    : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;

  return (
    <>
      <SEO
        title="Spare Parts, Body Parts & Accessories"
        description="Genuine spare parts and body panels for electric scooters — batteries, tyres, panels, mirrors, and more. Available at our Berhampore showroom."
        path="/accessories"
      />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-6 sm:py-8">
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 sm:text-xs">
              Spare & Body Parts
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-heading sm:text-display-lg">
              Parts for every repair
            </h1>
            <p className="mt-2 max-w-xl text-sm text-body sm:text-base">
              Genuine spare parts and body panels — batteries, brake pads, panels, mirrors, and more.
            </p>
          </Reveal>
        </div>
      </section>

      <CatalogToolbar
        leading={
          <div className="mb-1.5 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {PART_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setSection(s.id); setCategory('all'); }}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  section === s.id
                    ? 'bg-brand-gradient text-white shadow-soft'
                    : 'bg-surface-alt text-body ring-1 ring-line hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
        searchPlaceholder="Search parts…"
        query={query}
        onQueryChange={setQuery}
        searchAriaLabel="Search accessories"
        sort={sort}
        onSortChange={setSort}
        sortOptions={SORT_OPTIONS}
        stockOnly={stockOnly}
        onStockOnlyChange={setStockOnly}
        countLabel={countLabel}
      >
        <CatalogSelect
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="hidden w-32 sm:block"
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {ACCESSORY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </CatalogSelect>
      </CatalogToolbar>

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
            title="No parts found"
            description="Try adjusting your search or filters."
            action={
              <Button variant="secondary" onClick={() => { setQuery(''); setSection('all'); setCategory('all'); setStockOnly(false); }}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filtered.map((a, i) => (
              <AccessoryCard key={a.id} accessory={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
