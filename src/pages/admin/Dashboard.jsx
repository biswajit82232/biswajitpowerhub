import { Link } from 'react-router-dom';
import {
  Users, Flame, PhoneCall, CalendarCheck, Eye, Calculator, Bike, Star, Zap, TrendingUp,
  PhoneForwarded, Wrench, Mail, MessageCircle, Phone, Inbox,
} from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { BarChart } from '@/components/admin/Charts';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ResetAllCountsButton } from '@/components/admin/ResetAllCountsButton';
import { useAsync } from '@/hooks/useAsync';
import { getOverview, getEventAggregates } from '@/features/analytics/analyticsService';
import { getPopularityEngine } from '@/features/analytics/popularityService';
import { getScooters } from '@/features/scooters/scooterService';
import { getLeads } from '@/features/leads/leadService';
import { getTodayQueue, QUEUE_KIND_LABEL } from '@/features/admin/inboxService';
import { computeValueBadges, VALUE_BADGE_DEFS } from '@/lib/valueBadges';
import { FOLLOW_UP } from '@/lib/purchaseReadiness';
import { timeAgo } from '@/lib/utils';
import { telUrl, whatsappCustomerUrl } from '@/config/site';

const PRIORITY_TONE = {
  [FOLLOW_UP.IMMEDIATE]: 'hot',
  [FOLLOW_UP.TODAY]: 'warm',
  [FOLLOW_UP.LATER]: 'cold',
};

export default function Dashboard() {
  const { data: overview, loading, refetch: refetchOverview } = useAsync(() => getOverview(), []);
  const { data: agg, refetch: refetchAgg } = useAsync(() => getEventAggregates(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const { data: popularity, refetch: refetchPopularity } = useAsync(() => getPopularityEngine(), []);
  const { data: leads, refetch: refetchLeads } = useAsync(() => getLeads(), []);
  const { data: todayQueue, refetch: refetchQueue } = useAsync(() => getTodayQueue(12), []);

  const refetchAll = () => {
    refetchOverview();
    refetchAgg();
    refetchPopularity();
    refetchLeads();
    refetchQueue();
  };

  const o = overview || {};
  const badgeMap = computeValueBadges(scooters || []);
  const callQueue = (leads || []).filter((l) => l.priority !== FOLLOW_UP.LATER).slice(0, 5);
  const highIntent = (leads || []).filter((l) => l.readinessPercent >= 60).length;
  const resolveName = (id) => scooters?.find((s) => s.id === id || s.name === id)?.name || id;

  return (
    <>
      <SEO title="Dashboard" noindex />
      <AdminHeader
        title="Dashboard"
        subtitle="Open work first — then who to call, what's trending, best value."
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Inbox} label="Needs action" value={o.needsAction || 0} tone="red" />
          <StatCard icon={PhoneCall} label="Open callbacks" value={o.callbacks || 0} tone="accent" />
          <StatCard icon={CalendarCheck} label="Open test rides" value={o.testRides || 0} tone="amber" />
          <StatCard icon={Wrench} label="Open service" value={o.serviceBookings || 0} tone="brand" />
          <StatCard icon={Mail} label="Unread messages" value={o.unreadMessages || 0} tone="brand" />
          <StatCard icon={Star} label="Pending reviews" value={o.pendingReviews || 0} tone="amber" />
          <StatCard icon={Users} label="Total leads" value={o.totalLeads || 0} tone="slate" />
          <StatCard icon={Eye} label="Unique visitors" value={o.visits || 0} tone="slate" />
          <StatCard icon={Flame} label="Hot leads" value={o.hotLeads || 0} tone="red" />
          <StatCard icon={Zap} label="High intent (60%+)" value={highIntent} tone="amber" />
          <StatCard icon={Calculator} label="Calculator usage" value={(agg?.emiUsage || 0) + (agg?.simulatorUsage || 0)} tone="brand" />
          <StatCard icon={Bike} label="Models listed" value={scooters?.length || 0} tone="accent" />
        </div>
      )}

      {/* Unified today queue */}
      <div className="mt-6 rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:mt-8 sm:rounded-2xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-heading sm:text-lg">Today&apos;s work queue</h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">Open callbacks, rides, service, messages, and reviews — oldest urgent first.</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
          {(todayQueue || []).length ? todayQueue.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-xl bg-surface-alt px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={item.urgency >= 3 ? 'hot' : item.urgency >= 2 ? 'warm' : 'cold'}>
                    {QUEUE_KIND_LABEL[item.kind] || item.kind}
                  </Badge>
                  <p className="font-semibold text-heading">{item.title}</p>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">{item.subtitle}</p>
                <p className="mt-1 text-[11px] font-medium text-amber-700">{item.sla} · {item.when}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.phone && (
                  <>
                    <a href={telUrl(item.phone)} className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call">
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={whatsappCustomerUrl(item.phone, `Hi ${item.title}, this is BISWAJIT POWER HUB.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="tap-target rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </>
                )}
                <Link to={item.href} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                  Open
                </Link>
              </div>
            </div>
          )) : (
            <EmptyState title="Inbox clear" description="New requests will show here automatically." className="border-0 bg-transparent py-6" />
          )}
        </div>
      </div>

      {/* Follow-up queue */}
      <div className="mt-6 rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:mt-8 sm:rounded-2xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-heading sm:text-lg">Who to call first</h2>
            <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">Ranked by purchase readiness, freshness, and SLA.</p>
          </div>
          <Button to="/admin/leads" variant="secondary" size="sm" className="w-full sm:w-auto">All leads</Button>
        </div>
        <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
          {callQueue.length ? callQueue.map((l) => (
            <div key={l.id} className="flex flex-col gap-2 rounded-xl bg-surface-alt px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
              <div className="min-w-0">
                <p className="font-semibold text-heading">{l.name || 'Anonymous'} · {l.phone || 'No phone'}</p>
                <p className="text-xs text-muted">{l.interested_scooter || l.last_source || 'Website visitor'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={PRIORITY_TONE[l.priority]} icon={PhoneForwarded}>{l.priorityLabel}</Badge>
                <span className="rounded-full bg-heading px-2.5 py-1 text-xs font-bold text-white">
                  {l.readinessPercent}%
                </span>
                {l.slaBreach && <Badge tone="hot">SLA</Badge>}
                <span className="text-xs text-muted">{timeAgo(l.lastActivityAt || l.updated_at)}</span>
                {l.phone && (
                  <>
                    <a href={telUrl(l.phone)} className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call">
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={whatsappCustomerUrl(l.phone, `Hi ${l.name || 'there'}, this is BISWAJIT POWER HUB.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="tap-target rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          )) : (
            <EmptyState title="No urgent follow-ups" description="High-intent visitors will appear here automatically." className="border-0 bg-transparent py-6" />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
            <TrendingUp className="h-5 w-5 text-orange-500" /> Popularity engine
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Most viewed this week</p>
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
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Top purchase intent this month</p>
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

        <div className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-heading sm:text-lg">
            <Star className="h-5 w-5 text-amber-500" /> Best value badges
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm">Auto-assigned from specs — shown on scooter cards.</p>
          <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
            {Object.values(VALUE_BADGE_DEFS).map((def) => {
              const winnerId = [...badgeMap.entries()].find(([, badges]) =>
                badges.some((b) => b.id === def.id))?.[0];
              return (
                <li key={def.id} className="flex flex-col gap-0.5 rounded-xl bg-surface-alt px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
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

      <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
          <h2 className="font-display text-base font-bold text-heading sm:text-lg">Most viewed scooters</h2>
          <div className="mt-4 sm:mt-6">
            {agg?.mostViewed?.length ? (
              <BarChart data={agg.mostViewed} />
            ) : (
              <EmptyState title="No view data yet" description="Scooter views will appear here as visitors browse." className="border-0 bg-transparent py-8" />
            )}
          </div>
        </div>

        <div className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
          <h2 className="font-display text-base font-bold text-heading sm:text-lg">Engagement</h2>
          <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
            {[
              { label: 'Unique visitors', value: agg?.uniqueVisitors || o.visits || 0 },
              { label: 'WhatsApp clicks', value: agg?.whatsappClicks || 0 },
              { label: 'Call clicks', value: agg?.callClicks || 0 },
              { label: 'EMI calculator used', value: agg?.emiUsage || 0 },
              { label: 'EV simulator used', value: agg?.simulatorUsage || 0 },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2.5 sm:px-4 sm:py-3">
                <span className="text-xs font-medium text-body sm:text-sm">{row.label}</span>
                <span className="font-display text-lg font-extrabold text-heading">{row.value}</span>
              </div>
            ))}
          </div>
          <Button to="/admin/analytics" variant="ghost" className="mt-4 w-full">
            View full analytics
          </Button>
        </div>
      </div>

      <div className="mt-8 flex justify-center border-t border-line pt-6 sm:mt-10">
        <ResetAllCountsButton onReset={refetchAll} className="w-full sm:w-auto" />
      </div>
    </>
  );
}
