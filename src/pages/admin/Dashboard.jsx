import { Users, Flame, PhoneCall, CalendarCheck, Eye, Calculator, Bike, Star } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { BarChart } from '@/components/admin/Charts';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { getOverview, getEventAggregates } from '@/features/analytics/analyticsService';
import { getScooters } from '@/features/scooters/scooterService';

export default function Dashboard() {
  const { data: overview, loading } = useAsync(() => getOverview(), []);
  const { data: agg } = useAsync(() => getEventAggregates(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);

  const o = overview || {};

  return (
    <>
      <SEO title="Dashboard" noindex />
      <AdminHeader title="Dashboard" subtitle="Your dealership at a glance." />

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
          <StatCard icon={PhoneCall} label="Callback Requests" value={o.callbacks || 0} tone="accent" />
          <StatCard icon={CalendarCheck} label="Test Ride Requests" value={o.testRides || 0} tone="amber" />
          <StatCard icon={Eye} label="Website Visits" value={o.visits || 0} tone="slate" />
          <StatCard icon={Calculator} label="Calculator Usage" value={(agg?.emiUsage || 0) + (agg?.simulatorUsage || 0)} tone="brand" />
          <StatCard icon={Bike} label="Models Listed" value={scooters?.length || 0} tone="accent" />
          <StatCard icon={Star} label="Pending Reviews" value={o.pendingReviews || 0} tone="amber" />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
          <h2 className="font-display text-lg font-bold text-heading">Most viewed scooters</h2>
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
