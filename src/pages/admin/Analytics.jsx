import { MessageCircle, Phone, Calculator, Gauge, Eye, TrendingUp, Users, Flame, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AsyncError } from '@/components/admin/AsyncError';
import { StatCard } from '@/components/admin/StatCard';
import { BarChart, DonutChart } from '@/components/admin/Charts';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { getEventAggregates, getOverview, getChannelCloseRates } from '@/features/analytics/analyticsService';
import { getPopularityEngine } from '@/features/analytics/popularityService';
import { getScooters } from '@/features/scooters/scooterService';

function RankList({ title, rows, empty }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{title}</p>
      {rows?.length ? (
        <ul className="mt-1.5 space-y-1">
          {rows.slice(0, 5).map((row, i) => (
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

export default function Analytics() {
  const { data: agg, loading, error, refetch } = useAsync(() => getEventAggregates(), []);
  const { data: overview } = useAsync(() => getOverview(), []);
  const { data: popularity } = useAsync(() => getPopularityEngine(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const { data: channels } = useAsync(() => getChannelCloseRates(), []);

  const o = overview || {};
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

  const sourceData = [
    { label: 'WhatsApp', value: agg?.whatsappClicks || 0, color: '#25D366' },
    { label: 'Call', value: agg?.callClicks || 0, color: '#3B82F6' },
    { label: 'EMI calc', value: agg?.emiUsage || 0, color: '#14B8A6' },
    { label: 'Simulator', value: agg?.simulatorUsage || 0, color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  return (
    <>
      <AdminSEO title="Analytics" />
      <AdminHeader
        title="Analytics"
        subtitle="Visitors, popular models, and ads vs SEO views + close-rate."
      />

      <AsyncError error={error} onRetry={refetch} />

      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
            <StatCard icon={Eye} label="Unique visitors" value={o.visits || 0} tone="slate" />
            <StatCard icon={Eye} label="Views / month" value={o.viewsMonth || 0} tone="accent" />
            <StatCard icon={Eye} label="Views all time" value={o.viewsAllTime || 0} tone="slate" />
            <StatCard icon={MessageCircle} label="WhatsApp clicks" value={agg?.whatsappClicks || 0} tone="accent" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-4 lg:grid-cols-4">
            <StatCard icon={Phone} label="Call clicks" value={agg?.callClicks || 0} tone="brand" />
            <StatCard icon={Calculator} label="EMI calculator" value={agg?.emiUsage || 0} tone="brand" />
            <StatCard icon={Gauge} label="EV simulator" value={agg?.simulatorUsage || 0} tone="amber" />
            <StatCard icon={Eye} label="Total events" value={agg?.total || 0} tone="slate" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-4 lg:grid-cols-3">
            <StatCard icon={Users} label="Leads" value={o.totalLeads || 0} tone="slate" />
            <StatCard icon={Flame} label="Hot leads" value={o.hotLeads || 0} tone="amber" />
            <StatCard icon={TrendingUp} label="Needs action" value={o.needsAction || 0} tone="brand" />
          </div>

          <section className="mt-6 rounded-xl bg-surface p-4 ring-1 ring-line sm:mt-8 sm:rounded-2xl sm:p-6">
            <h2 className="font-display text-base font-bold text-heading sm:text-lg">
              Ads vs SEO — views & close-rate
            </h2>
            <p className="mt-1 text-xs text-muted">
              First-touch channel on the visit (UTM / gclid / Google search). Views count even if they never fill a form.
              Close-rate = leads marked converted.
            </p>
            {channels?.rows?.length ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard icon={Users} label="Visitors" value={channels.totals.visitors} tone="slate" />
                  <StatCard icon={Eye} label="Page views" value={channels.totals.pageViews} tone="accent" />
                  <StatCard icon={Eye} label="Scooter views" value={channels.totals.scooterViews} tone="slate" />
                  <StatCard icon={TrendingUp} label="Lead rate" value={`${channels.totals.leadRate}%`} tone="brand" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard icon={Users} label="Leads" value={channels.totals.leads} tone="slate" />
                  <StatCard icon={Flame} label="Converted" value={channels.totals.converted} tone="amber" />
                  <StatCard icon={TrendingUp} label="Close rate" value={`${channels.totals.closeRate}%`} tone="brand" />
                  <StatCard icon={CalendarCheck} label="Test rides" value={channels.totals.testRides} tone="accent" />
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[40rem] text-left text-sm">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wide text-muted">
                        <th className="pb-2 pr-3">Channel</th>
                        <th className="pb-2 pr-3">Visitors</th>
                        <th className="pb-2 pr-3">Pages</th>
                        <th className="pb-2 pr-3">Scooters</th>
                        <th className="pb-2 pr-3">Leads</th>
                        <th className="pb-2 pr-3">Converted</th>
                        <th className="pb-2">Close rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channels.rows.map((row) => (
                        <tr key={row.channel} className="border-t border-line">
                          <td className="py-2 pr-3 font-semibold text-heading">{row.label}</td>
                          <td className="py-2 pr-3 text-body">{row.visitors}</td>
                          <td className="py-2 pr-3 text-body">{row.pageViews}</td>
                          <td className="py-2 pr-3 text-body">{row.scooterViews}</td>
                          <td className="py-2 pr-3 text-body">{row.leads}</td>
                          <td className="py-2 pr-3 text-body">{row.converted}</td>
                          <td className="py-2 font-bold text-heading">{row.closeRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No attributed visits yet. New visits with ?utm_source= or Google Ads gclid will appear here — forms are not required.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl bg-surface p-4 ring-1 ring-line sm:mt-8 sm:rounded-2xl sm:p-6">
            <h2 className="flex items-center gap-1.5 font-display text-base font-bold text-heading sm:text-lg">
              <TrendingUp className="h-4 w-4 text-orange-500" /> Popularity trends
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <RankList title="This week" rows={weekRows} empty="No views yet" />
              <RankList title="This month" rows={monthRows} empty="No monthly views" />
              <RankList title="Intent this month" rows={intentRows} empty="No intent yet" />
            </div>
          </section>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
              <h2 className="font-display text-base font-bold text-heading sm:text-lg">Most viewed scooters</h2>
              <div className="mt-4 sm:mt-6">
                {agg?.mostViewed?.length ? (
                  <BarChart data={agg.mostViewed} />
                ) : (
                  <EmptyState title="No data yet" className="border-0 bg-transparent py-8" />
                )}
              </div>
            </div>

            <div className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
              <h2 className="font-display text-base font-bold text-heading sm:text-lg">Lead sources</h2>
              <div className="mt-4 sm:mt-6">
                {sourceData.length ? (
                  <DonutChart data={sourceData} />
                ) : (
                  <EmptyState title="No interactions yet" className="border-0 bg-transparent py-8" />
                )}
              </div>
            </div>
          </div>

          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>Tracked interactions. To zero visit/engagement counters, use</span>
            <Link to="/admin/settings" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
              Settings → Reset all counts to 0
            </Link>
            .
          </p>
        </>
      )}
    </>
  );
}
