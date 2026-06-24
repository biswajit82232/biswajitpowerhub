import { MessageCircle, Phone, Calculator, Gauge, Eye } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { BarChart, DonutChart } from '@/components/admin/Charts';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { getEventAggregates } from '@/features/analytics/analyticsService';

export default function Analytics() {
  const { data: agg, loading } = useAsync(() => getEventAggregates(), []);

  const sourceData = [
    { label: 'WhatsApp', value: agg?.whatsappClicks || 0, color: '#25D366' },
    { label: 'Call', value: agg?.callClicks || 0, color: '#3B82F6' },
    { label: 'EMI calc', value: agg?.emiUsage || 0, color: '#14B8A6' },
    { label: 'Simulator', value: agg?.simulatorUsage || 0, color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  return (
    <>
      <SEO title="Analytics" noindex />
      <AdminHeader title="Analytics" subtitle="Engagement, popular models & conversion signals." />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Eye} label="Total events" value={agg?.total || 0} tone="slate" />
            <StatCard icon={MessageCircle} label="WhatsApp clicks" value={agg?.whatsappClicks || 0} tone="accent" />
            <StatCard icon={Calculator} label="EMI calculator" value={agg?.emiUsage || 0} tone="brand" />
            <StatCard icon={Gauge} label="EV simulator" value={agg?.simulatorUsage || 0} tone="amber" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
              <h2 className="font-display text-lg font-bold text-heading">Most viewed scooters</h2>
              <div className="mt-6">
                {agg?.mostViewed?.length ? (
                  <BarChart data={agg.mostViewed} />
                ) : (
                  <EmptyState title="No data yet" className="border-0 bg-transparent py-8" />
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft">
              <h2 className="font-display text-lg font-bold text-heading">Lead sources</h2>
              <div className="mt-6">
                {sourceData.length ? (
                  <DonutChart data={sourceData} />
                ) : (
                  <EmptyState title="No interactions yet" className="border-0 bg-transparent py-8" />
                )}
              </div>
            </div>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-muted">
            <Phone className="h-3.5 w-3.5" /> Data reflects tracked interactions. Connect Supabase for cross-device, persistent analytics.
          </p>
        </>
      )}
    </>
  );
}
