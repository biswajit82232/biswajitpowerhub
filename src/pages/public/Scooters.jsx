import { useMemo, useState } from 'react';
import { Search, GitCompare, ChevronDown } from 'lucide-react';
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
import { BATTERY_UPGRADE_TAGLINE } from '@/config/site';
import { breadcrumbList, faqPageSchema, SCOOTER_FAQS } from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

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

  const scootersJsonLd = useMemo(() => {
    const list = scooters || [];
    return [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Scooters', path: '/scooters' },
      ]),
      faqPageSchema(SCOOTER_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Electric Scooters at Biswajit Power Hub',
        itemListElement: list.slice(0, 8).map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${s.name} Electric Scooter`,
          url: `https://biswajitpowerhub.in/scooters/${s.id}`,
        })),
      },
    ];
  }, [scooters]);

  return (
    <>
      <SEO
        title="Electric Scooters in Berhampore | Activa, Zoom, Single & Double Light | BPH"
        description="Compare all low-speed electric scooters at Biswajit Power Hub. No licence required. Test rides available at Chunakhali, Berhampore."
        path="/scooters"
        jsonLd={scootersJsonLd}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-surface-alt/50">
        <div className="container-px py-6 sm:py-8">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Scooters' }]} />
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
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted sm:text-sm">
              {BATTERY_UPGRADE_TAGLINE}
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

        <section className="mt-12 border-t border-line pt-10 sm:mt-16 sm:pt-14" aria-labelledby="scooter-faq-heading">
          <Reveal>
            <h2 id="scooter-faq-heading" className="font-display text-xl font-extrabold text-heading sm:text-2xl">
              Frequently asked questions
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Quick answers about licences, range, warranty, and our Berhampore showroom.
            </p>
            <div className="mt-6 divide-y divide-line rounded-2xl ring-1 ring-line">
              {SCOOTER_FAQS.map((faq) => (
                <details key={faq.question} className="group px-4 py-3 sm:px-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-heading marker:content-none [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 pb-1 text-sm leading-relaxed text-body">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
