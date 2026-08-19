import { useMemo, useState } from 'react';
import { DealerProductCard } from '@/features/scooters/DealerProductCard';
import { ScooterCardSkeleton } from '@/components/ui/Skeleton';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { useSite } from '@/context/SiteSettingsContext';
import { useAsync } from '@/hooks/useAsync';
import { getScooterInsights } from '@/features/analytics/popularityService';
import { getScooterDiscoveryTags, sortScootersByFame } from '@/lib/catalogRank';
import { DEFAULT_RANGE_TABS } from '@/config/site';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';
import { RANGE_TAB_KEYS } from '@/i18n/messages';

function matchesTab(scooter, tabId) {
  if (tabId === 'all') return true;
  if (tabId === 'no-licence') return !!scooter.noLicence;
  if (tabId === 'budget') return !!scooter.isBudget;
  if (tabId === 'premium') return !!scooter.isPremium;
  return true;
}

/**
 * Explore Our Range — smart-sorted famous models first, with discovery badges.
 */
export function ExploreRange({ scooters = [], loading = false, title }) {
  const { t } = useLocale();
  const heading = title || t('home.explore');
  const { site } = useSite();
  const tabs = useMemo(() => {
    const raw = Array.isArray(site.rangeTabs) && site.rangeTabs.length
      ? site.rangeTabs
      : DEFAULT_RANGE_TABS;
    return raw.filter((t) => t.enabled !== false);
  }, [site.rangeTabs]);

  const [tab, setTab] = useState('all');
  const { photos } = useSitePhotos();
  const scooterKey = (scooters || []).map((s) => s.id).join('|');
  const { data: insights } = useAsync(
    () =>
      new Promise((resolve) => {
        const run = () => {
          getScooterInsights(scooters || []).then(resolve).catch(() => resolve(null));
        };
        // Don't compete with hero LCP / first paint for popularity RPCs.
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(run, { timeout: 4000 });
        } else {
          setTimeout(run, 2000);
        }
      }),
    [scooterKey],
  );

  const activeTab = tabs.some((t) => t.id === tab) ? tab : (tabs[0]?.id || 'all');

  const ranked = useMemo(() => {
    const list = scooters || [];
    if (!insights) return list;
    return sortScootersByFame(list, insights);
  }, [scooters, insights]);

  const filtered = useMemo(
    () => ranked.filter((s) => matchesTab(s, activeTab)),
    [ranked, activeTab],
  );

  return (
    <section id="models" className="bg-white py-10 sm:py-14" aria-labelledby="explore-heading">
      <div className="container-px">
        <h2 id="explore-heading" className="dealer-section-title text-center">
          {heading}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-xs text-muted sm:text-sm">
          {t('home.exploreHint')}
        </p>

        {tabs.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setTab(tabItem.id)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition sm:px-5 sm:text-sm',
                  activeTab === tabItem.id
                    ? 'border-navy bg-navy text-white'
                    : 'border-navy/40 bg-white text-navy hover:border-navy',
                )}
              >
                {RANGE_TAB_KEYS[tabItem.id] ? t(RANGE_TAB_KEYS[tabItem.id]) : tabItem.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 border-b border-line" />

        <div className="mt-8 grid min-h-[34rem] content-start gap-8 sm:min-h-[36rem] sm:grid-cols-2 lg:min-h-[22rem] lg:grid-cols-3 lg:gap-10">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ScooterCardSkeleton key={i} />)
            : filtered.length > 0
              ? filtered.map((s) => (
                  <DealerProductCard
                    key={s.id}
                    scooter={s}
                    imageOverride={photos?.models?.[s.id]?.url}
                    tags={getScooterDiscoveryTags(s, insights)}
                  />
                ))
              : (
                  <p className="col-span-full mt-2 text-center text-sm text-muted">
                    {scooters?.length > 0
                      ? t('home.emptyTab')
                      : t('home.emptyStock')}
                  </p>
                )}
        </div>
      </div>
    </section>
  );
}
