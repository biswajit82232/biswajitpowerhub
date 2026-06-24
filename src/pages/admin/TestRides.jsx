import { CalendarCheck, Phone, Bike } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { getTestRides } from '@/features/leads/leadService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl } from '@/config/site';

export default function TestRides() {
  const { data, loading } = useAsync(() => getTestRides(), []);

  return (
    <>
      <SEO title="Test Rides" noindex />
      <AdminHeader title="Test Ride Requests" subtitle="Scheduled showroom test rides." />

      {!isSupabaseConfigured ? (
        <EmptyState icon={CalendarCheck} title="Connect Supabase" description="Test ride bookings will appear here once Supabase is connected." />
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : data?.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No test ride requests yet" />
      ) : (
        <div className="space-y-3">
          {data.map((t) => (
            <div key={t.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft sm:flex-row sm:items-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-heading">{t.name}</p>
                <p className="text-sm text-muted">{t.phone} · requested {timeAgo(t.created_at)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                {t.scooter && <Badge tone="brand" icon={Bike}>{t.scooter}</Badge>}
                <Badge tone="neutral">{t.preferred_date} · {t.preferred_time}</Badge>
              </div>
              <a href={telUrl(t.phone)} className="rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call"><Phone className="h-4.5 w-4.5" /></a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
