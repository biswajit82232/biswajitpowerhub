import { Users, Flame, PhoneCall, CalendarCheck, Eye, Calculator, Bike, Star, Zap, TrendingUp, PhoneForwarded } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { BarChart } from '@/components/admin/Charts';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getOverview, getEventAggregates } from '@/features/analytics/analyticsService';
import { getPopularityEngine } from '@/features/analytics/popularityService';
import { getScooters } from '@/features/scooters/scooterService';
import { getLeads } from '@/features/leads/leadService';
import { computeValueBadges, VALUE_BADGE_DEFS } from '@/lib/valueBadges';
import { FOLLOW_UP } from '@/lib/purchaseReadiness';
import { timeAgo } from '@/lib/utils';

const PRIORITY_TONE = {
  [FOLLOW_UP.IMMEDIATE]: 'hot',
  [FOLLOW_UP.TODAY]: 'warm',
  [FOLLOW_UP.LATER]: 'cold',
};

export default function Dashboard() {
  const { data: overview, loading } = useAsync(() => getOverview(), []);
  const { data: agg } = useAsync(() => getEventAggregates(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const { data: popularity } = useAsync(() => getPopularityEngine(), []);
  const { data: leads } = useAsync(() => getLeads(), []);

  const o = overview || {};
  const badgeMap = computeValueBadges(scooters || []);
  const callQueue = (leads || []).filter((l) => l.priority !== FOLLOW_UP.LATER).slice(0, 5);
  const highIntent = (leads || []).filter((l) => l.readinessPercent >= 60).length;

  const resolveName = (id) => scooters?.find((s) => s.id === id || s.name === id)?.name || id;

  return (
    <>
      <SEO title="Dashboard" noindex />
      <AdminHeader title="Dashboard" subtitle="Smart insights — who to call, what's trending, best value picks." />

      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Leads" value={o.totalLeads || 0} tone="brand" />
          <StatCard icon={Flame} label="Hot Leads" value={o.hotLeads || 0} tone="red" />
          <StatCard icon={Zap} label="High Intent (60%+)" value={highIntent} tone="amber" />
          <StatCard icon={PhoneCall} label="Callback Requests" value={o.callbacks || 0} tone="accent" />
          <StatCard icon={CalendarCheck} label="Test Ride Requests" value={o.testRides || 0} tone="amber" />
          <StatCard icon={Eye} label="Website Visits" value={o.visits || 0} tone="slate" />
          <StatCard icon={Calculator} label="Calculator Usage" value={(agg?.emiUsage || 0) + (agg?.simulatorUsage || 0)} tone="brand" />
          <StatCard icon={Bike} label="Models Listed" value={scooters?.length || 0} tone="accent" />
        </div>
      )}

      {/* Follow-up queue */}
      <div className="mt-8 rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-heading">Who to call first</h2>
            <p className="mt-1 text-sm text-muted">Ranked by purchase readiness and behaviour signals.</p>
          </div>
          <Button to="/admin/leads" variant="secondary" size="sm">All leads</Button>
        </div>
        <div className="mt-5 space-y-3">
          {callQueue.length ? callQueue.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-alt px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-heading">{l.name || 'Anonymous'} · {l.phone || 'No phone'}</p>
                <p className="text-xs text-muted">{l.interested_scooter || l.last_source || 'Website visitor'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={PRIORITY_TONE[l.priority]} icon={PhoneForwarded}>{l.priorityLabel}</Badge>
                <span className="rounded-full bg-heading px-2.5 py-1 text-xs font-bold text-white">
                  🔥 {l.readinessPercent}%
                </span>
                <span className="text-xs text-muted">{timeAgo(l.lastActivityAt || l.updated_at)}</span>
              </div>
            </div>
          )) : (
            <EmptyState title="No urgent follow-ups" description="High-intent visitors will appear here automatically." className="border-0 bg-transparent py-6" />
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Popularity engine */}
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
            <TrendingUp className="h-5 w-5 text-orange-500" /> Popularity engine
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">🔥 Most viewed this week</p>
              {popularity?.mostViewedWeek?.length ? (
                <ul className="mt-2 space-y-2">
                  {popularity.mostViewedWeek.map((row, i) => (
                    <li key={row.id} className="flex justify-between text-sm">
                      <span className="font-medium text-heading">{i + 1}. {resolveName(row.id)}</span>
                      <span className="text-muted">{row.views || row.value} views</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">No view data yet.</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">⭐ Top purchase intent this month</p>
              {popularity?.mostIntentMonth?.length ? (
                <ul className="mt-2 space-y-2">
                  {popularity.mostIntentMonth.map((row, i) => (
                    <li key={row.id} className="flex justify-between text-sm">
                      <span className="font-medium text-heading">{i + 1}. {resolveName(row.id)}</span>
                      <span className="text-muted">High interest</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">No intent signals yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Best value badges */}
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
            <Star className="h-5 w-5 text-amber-500" /> Best value badges
          </h2>
          <p className="mt-1 text-sm text-muted">Auto-assigned from specs — shown on scooter cards.</p>
          <ul className="mt-5 space-y-3">
            {Object.values(VALUE_BADGE_DEFS).map((def) => {
              const winnerId = [...badgeMap.entries()].find(([, badges]) =>
                badges.some((b) => b.id === def.id))?.[0];
              return (
                <li key={def.id} className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3 text-sm">
                  <span>{def.emoji} {def.label}</span>
                  <span className="font-semibold text-heading">
                    {winnerId ? resolveName(winnerId) : '—'}
                  </span>
                </li>
              );
            })}
          </ul>
          <Button to="/admin/inventory" variant="ghost" className="mt-4 w-full">Manage inventory</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
          <h2 className="font-display text-lg font-bold text-heading">Most viewed scooters (all time)</h2>
          <div className="mt-6">
            {agg?.mostViewed?.length ? (
              <BarChart data={agg.mostViewed} />
            ) : (
              <EmptyState title="No view data yet" description="Scooter views will appear here as visitors browse." className="border-0 bg-transparent py-8" />
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
          <h2 className="font-display text-lg font-bold text-heading">Engagement</h2>
          <div className="mt-5 space-y-3">
            {[
              { label: 'WhatsApp clicks', value: agg?.whatsappClicks || 0 },
              { label: 'Call clicks', value: agg?.callClicks || 0 },
              { label: 'EMI calculator used', value: agg?.emiUsage || 0 },
              { label: 'EV simulator used', value: agg?.simulatorUsage || 0 },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
                <span className="text-sm font-medium text-body">{row.label}</span>
                <span className="font-display text-lg font-extrabold text-heading">{row.value}</span>
              </div>
            ))}
          </div>
          <Button to="/admin/analytics" variant="ghost" className="mt-4 w-full">
            View full analytics
          </Button>
        </div>
      </div>
    </>
  );
}
