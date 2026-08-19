import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { DealerPageHero } from '@/components/common/DealerPageHero';
import { CatalogToolbar, CatalogSelect } from '@/components/catalog/CatalogToolbar';
import { AccessoryCard } from '@/features/accessories/AccessoryCard';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getAccessories } from '@/features/accessories/accessoryService';
import { ACCESSORY_CATEGORIES, PART_SECTIONS } from '@/data/accessories';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';

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
  const { t } = useLocale();
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

  const accessoriesJsonLd = useMemo(
    () =>
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Parts & Accessories', path: '/accessories' },
      ]),
    [],
  );

  return (
    <>
      <SEO
        title="Spare Parts & Accessories | Biswajit Power Hub, Berhampore"
        description="Genuine spare parts and body panels for electric scooters — batteries, tyres, panels, mirrors, and more. Available at our Berhampore showroom."
        path="/accessories"
        jsonLd={accessoriesJsonLd}
        titleTemplate={false}
      />

      <DealerPageHero
        eyebrow={t('acc.eyebrow')}
        title={t('acc.h1')}
        subtitle={t('acc.sub')}
        breadcrumbs={[{ name: t('crumb.home'), to: '/' }, { name: t('acc.h1') }]}
      />

      <CatalogToolbar
        leading={
          <div className="mb-1.5 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {PART_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setSection(s.id); setCategory('all'); }}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide transition',
                  section === s.id
                    ? 'border-navy bg-navy text-white'
                    : 'border-navy/40 bg-white text-navy hover:border-navy',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
        searchPlaceholder={t('acc.search')}
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
          className="w-full min-w-0 sm:w-32"
          aria-label="Category"
        >
          <option value="all">{t('acc.allCat')}</option>
          {ACCESSORY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </CatalogSelect>
      </CatalogToolbar>

      <div className="container-px py-6 sm:py-8">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
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
              <Button variant="dealerSecondary" onClick={() => { setQuery(''); setSection('all'); setCategory('all'); setStockOnly(false); }}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((a, i) => (
              <AccessoryCard key={a.id} accessory={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
