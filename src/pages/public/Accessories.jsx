import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { AccessoryCard } from '@/features/accessories/AccessoryCard';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getAccessories } from '@/features/accessories/accessoryService';
import { ACCESSORY_CATEGORIES, PART_SECTIONS } from '@/data/accessories';

const SORTS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
};

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

  return (
    <>
      <SEO
        title="Spare Parts, Body Parts & Accessories"
        description="Genuine spare parts and body panels for electric scooters — batteries, tyres, panels, mirrors, and more. Available at our Berhampore showroom."
        path="/accessories"
      />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-12 sm:py-16">
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              Spare & Body Parts
            </span>
            <h1 className="mt-3 font-display text-display-lg font-extrabold text-heading">
              Parts for every repair
            </h1>
            <p className="mt-3 max-w-xl text-body">
              Genuine spare parts and body panels for electric scooters — batteries, brake pads,
              panels, mirrors, tyres, and accessories. Visit our showroom or enquire on WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="border-b border-line bg-surface">
        <div className="container-px flex gap-2 overflow-x-auto py-3 scrollbar-none">
          {PART_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSection(s.id); setCategory('all'); }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                section === s.id
                  ? 'bg-brand-gradient text-white shadow-soft'
                  : 'bg-surface-alt text-body ring-1 ring-line hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-[var(--header-offset)] z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="container-px flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search parts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11"
              aria-label="Search accessories"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted sm:block" />
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="sm:w-44 sm:pl-10"
                aria-label="Category"
              >
                <option value="all">All categories</option>
                {ACCESSORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-44" aria-label="Sort">
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </Select>
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

      <div className="container-px py-10 sm:py-14">
        <p className="mb-6 text-sm text-muted">
          {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filtered.map((a, i) => (
              <AccessoryCard key={a.id} accessory={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
