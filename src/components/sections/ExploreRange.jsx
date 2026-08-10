import { useMemo, useState } from 'react';
import { DealerProductCard } from '@/features/scooters/DealerProductCard';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { useSite } from '@/context/SiteSettingsContext';
import { DEFAULT_RANGE_TABS } from '@/config/site';
import { cn } from '@/lib/utils';

function matchesTab(scooter, tabId) {
  if (tabId === 'all') return true;
  if (tabId === 'no-licence') return !!scooter.noLicence;
  if (tabId === 'budget') return !!scooter.isBudget;
  if (tabId === 'premium') return !!scooter.isPremium;
  return true;
}

/**
 * Explore Our Range — dealer tabs + product grid on white background.
 * Tabs/labels come from admin Settings; membership from scooter tags.
 */
export function ExploreRange({ scooters = [], loading = false, title = 'Explore Our Range' }) {
  const { site } = useSite();
  const tabs = useMemo(() => {
    const raw = Array.isArray(site.rangeTabs) && site.rangeTabs.length
      ? site.rangeTabs
      : DEFAULT_RANGE_TABS;
    return raw.filter((t) => t.enabled !== false);
  }, [site.rangeTabs]);

  const [tab, setTab] = useState('all');
  const { photos } = useSitePhotos();

  const activeTab = tabs.some((t) => t.id === tab) ? tab : (tabs[0]?.id || 'all');

  const filtered = useMemo(
    () => (scooters || []).filter((s) => matchesTab(s, activeTab)),
    [scooters, activeTab],
  );

  return (
    <section id="models" className="bg-white py-10 sm:py-14" aria-labelledby="explore-heading">
      <div className="container-px">
        <h2 id="explore-heading" className="dealer-section-title text-center">
          {title}
        </h2>

        {tabs.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition sm:px-5 sm:text-sm',
                  activeTab === t.id
                    ? 'border-navy bg-navy text-white'
                    : 'border-navy/40 bg-white text-navy hover:border-navy',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 border-b border-line" />

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <ScooterCardSkeleton key={i} />)
            : filtered.map((s) => (
                <DealerProductCard
                  key={s.id}
                  scooter={s}
                  imageOverride={photos?.models?.[s.id]?.url}
                />
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">No models in this category yet.</p>
        )}
      </div>
    </section>
  );
}
