import { Link } from 'react-router-dom';
import {
  PhoneCall, CalendarCheck, Eye, Star, Flame, TrendingUp,
  PhoneForwarded, Wrench, Mail, MessageCircle, Phone, Inbox, Users,
} from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getOverview, getEventAggregates } from '@/features/analytics/analyticsService';
import { getPopularityEngine } from '@/features/analytics/popularityService';
import { getScooters } from '@/features/scooters/scooterService';
import { getLeads } from '@/features/leads/leadService';
import { getTodayQueue, QUEUE_KIND_LABEL } from '@/features/admin/inboxService';
import { FOLLOW_UP } from '@/lib/purchaseReadiness';
import { timeAgo, cn } from '@/lib/utils';
import { telUrl, whatsappCustomerUrl } from '@/config/site';

const PRIORITY_TONE = {
  [FOLLOW_UP.IMMEDIATE]: 'hot',
  [FOLLOW_UP.TODAY]: 'warm',
  [FOLLOW_UP.LATER]: 'cold',
};

function Kpi({ to, icon: Icon, label, value, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    accent: 'bg-accent-50 text-accent-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  const body = (
    <div className="flex items-center gap-2 rounded-xl bg-surface p-2.5 ring-1 ring-line sm:gap-2.5 sm:p-3">
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9', tones[tone])}>
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="font-display text-lg font-extrabold leading-none text-heading sm:text-xl">{value ?? 0}</p>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block transition hover:opacity-90">{body}</Link> : body;
}

function RankList({ title, rows, empty }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{title}</p>
      {rows?.length ? (
        <ul className="mt-1.5 space-y-1">
          {rows.slice(0, 3).map((row, i) => (
            <li key={`${title}-${row.id || row.label}`} className="flex items-baseline justify-between gap-2 text-xs sm:text-sm">
              <span className="min-w-0 truncate font-medium text-heading">{i + 1}. {row.label}</span>
              <span className="shrink-0 text-muted">{row.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-xs text-muted">{empty}</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: overview, loading } = useAsync(() => getOverview(), []);
  const { data: agg } = useAsync(() => getEventAggregates(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const { data: popularity } = useAsync(() => getPopularityEngine(), []);
  const { data: leads } = useAsync(() => getLeads(), []);
  const { data: todayQueue } = useAsync(() => getTodayQueue(8), []);

  const o = overview || {};
  const callQueue = (leads || []).filter((l) => l.priority !== FOLLOW_UP.LATER).slice(0, 5);
  const highIntent = (leads || []).filter((l) => l.readinessPercent >= 60).length;
  const resolveName = (id) => scooters?.find((s) => s.id === id || s.name === id)?.name || id;

  const weekRows = (popularity?.mostViewedWeek || []).map((r) => ({
    id: r.id,
    label: resolveName(r.id),
    value: `${r.views || r.value} views`,
  }));
  const monthRows = (popularity?.mostViewedMonth || []).map((r) => ({
    id: r.id,
    label: resolveName(r.id),
    value: `${r.views || r.value} views`,
  }));
  const intentRows = (popularity?.mostIntentMonth || []).map((r) => ({
    id: r.id,
    label: resolveName(r.id),
    value: 'High interest',
  }));

  return (
    <>
      <AdminSEO title="Dashboard" />
      <AdminHeader title="Dashboard" subtitle="Open work · who to call · what’s trending." />

      {/* Ops KPIs — tappable */}
      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi to="/admin/callbacks" icon={Inbox} label="Needs action" value={o.needsAction} tone="red" />
          <Kpi to="/admin/callbacks" icon={PhoneCall} label="Callbacks" value={o.callbacks} tone="accent" />
          <Kpi to="/admin/test-rides" icon={CalendarCheck} label="Test rides" value={o.testRides} tone="amber" />
          <Kpi to="/admin/service-bookings" icon={Wrench} label="Service" value={o.serviceBookings} tone="brand" />
          <Kpi to="/admin/messages" icon={Mail} label="Messages" value={o.unreadMessages} tone="brand" />
          <Kpi to="/admin/reviews" icon={Star} label="Reviews" value={o.pendingReviews} tone="amber" />
        </div>
      )}

      {/* Insight strip */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi to="/admin/leads" icon={Users} label="Leads" value={o.totalLeads} tone="slate" />
        <Kpi to="/admin/leads" icon={Flame} label="Hot leads" value={o.hotLeads} tone="red" />
        <Kpi icon={Flame} label="High intent" value={highIntent} tone="amber" />
        <Kpi to="/admin/analytics" icon={Eye} label="Visitors" value={o.visits} tone="slate" />
        <Kpi to="/admin/analytics" icon={Eye} label="Views / mo" value={o.viewsMonth} tone="accent" />
        <Kpi to="/admin/analytics" icon={Eye} label="Views all" value={o.viewsAllTime} tone="slate" />
      </div>

      {/* Work queue */}
      <section className="mt-4 rounded-xl bg-surface p-3 ring-1 ring-line sm:mt-5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-bold text-heading sm:text-base">Work queue</h2>
          <span className="text-[11px] font-medium text-muted">{(todayQueue || []).length} open</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {(todayQueue || []).length ? todayQueue.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg bg-surface-alt px-2.5 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={item.urgency >= 3 ? 'hot' : item.urgency >= 2 ? 'warm' : 'cold'}>
                    {QUEUE_KIND_LABEL[item.kind] || item.kind}
                  </Badge>
                  <p className="truncate text-sm font-semibold text-heading">{item.title}</p>
                </div>
                <p className="truncate text-[11px] text-muted">{item.sla} · {item.subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {item.phone && (
                  <>
                    <a href={telUrl(item.phone)} className="tap-target rounded-lg bg-brand-50 p-2 text-brand-600" aria-label="Call">
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={whatsappCustomerUrl(item.phone, `Hi ${item.title}, this is BISWAJIT POWER HUB.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="tap-target rounded-lg bg-[#25D366]/10 p-2 text-[#1da851]"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </>
                )}
                <Link to={item.href} className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-brand-700 ring-1 ring-brand-100">
                  Open
                </Link>
              </div>
            </div>
          )) : (
            <EmptyState title="Inbox clear" description="New requests appear here." className="border-0 bg-transparent py-4" />
          )}
        </div>
      </section>

      {/* Call first */}
      <section className="mt-3 rounded-xl bg-surface p-3 ring-1 ring-line sm:mt-4 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-bold text-heading sm:text-base">Who to call first</h2>
          <Button to="/admin/leads" variant="ghost" size="sm" className="h-8 px-2 text-xs">All leads</Button>
        </div>
        <div className="mt-2 space-y-1.5">
          {callQueue.length ? callQueue.map((l) => (
            <div key={l.id} className="flex items-center gap-2 rounded-lg bg-surface-alt px-2.5 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">
                  {l.name || 'Anonymous'}{l.phone ? ` · ${l.phone}` : ''}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <Badge tone={PRIORITY_TONE[l.priority]} icon={PhoneForwarded}>{l.priorityLabel}</Badge>
                  <span className="text-[11px] font-bold text-heading">{l.readinessPercent}%</span>
                  {l.slaBreach && <Badge tone="hot">SLA</Badge>}
                  <span className="text-[11px] text-muted">{timeAgo(l.lastActivityAt || l.updated_at)}</span>
                </div>
              </div>
              {l.phone && (
                <div className="flex shrink-0 gap-1">
                  <a href={telUrl(l.phone)} className="tap-target rounded-lg bg-brand-50 p-2 text-brand-600" aria-label="Call">
                    <Phone className="h-4 w-4" />
                  </a>
                  <a
                    href={whatsappCustomerUrl(l.phone, `Hi ${l.name || 'there'}, this is BISWAJIT POWER HUB.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="tap-target rounded-lg bg-[#25D366]/10 p-2 text-[#1da851]"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )) : (
            <EmptyState title="No urgent follow-ups" className="border-0 bg-transparent py-4" />
          )}
        </div>
      </section>

      {/* Trends + engagement — one compact block */}
      <section className="mt-3 rounded-xl bg-surface p-3 ring-1 ring-line sm:mt-4 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 font-display text-sm font-bold text-heading sm:text-base">
            <TrendingUp className="h-4 w-4 text-orange-500" /> Trends
          </h2>
          <Button to="/admin/analytics" variant="ghost" size="sm" className="h-8 px-2 text-xs">Analytics</Button>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <RankList title="This week" rows={weekRows} empty="No views yet" />
          <RankList title="This month" rows={monthRows} empty="No monthly views" />
          <RankList title="Intent this month" rows={intentRows} empty="No intent yet" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-line pt-3 sm:grid-cols-4">
          {[
            { label: 'WA clicks', value: agg?.whatsappClicks || 0 },
            { label: 'Calls', value: agg?.callClicks || 0 },
            { label: 'EMI used', value: agg?.emiUsage || 0 },
            { label: 'Simulator', value: agg?.simulatorUsage || 0 },
          ].map((row) => (
            <div key={row.label} className="rounded-lg bg-surface-alt px-2.5 py-2 text-center">
              <p className="font-display text-base font-extrabold text-heading">{row.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{row.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
