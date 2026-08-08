import { CalendarCheck, Phone, MessageCircle, Bike } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { getTestRides } from '@/features/leads/leadService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl, whatsappCustomerUrl } from '@/config/site';

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
            <div key={t.id} className="flex flex-col gap-3 rounded-xl bg-surface p-3 ring-1 ring-line shadow-soft sm:flex-row sm:items-center sm:rounded-2xl sm:p-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-11 sm:w-11">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-heading">{t.name}</p>
                  <p className="text-sm text-muted">{t.phone} · requested {timeAgo(t.created_at)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                    {t.scooter && <Badge tone="brand" icon={Bike}>{t.scooter}</Badge>}
                    <Badge tone="neutral">{t.preferred_date} · {t.preferred_time}</Badge>
                  </div>
                </div>
              </div>
              <div className="hidden flex-wrap items-center gap-2 sm:flex sm:ml-auto">
                {t.scooter && <Badge tone="brand" icon={Bike}>{t.scooter}</Badge>}
                <Badge tone="neutral">{t.preferred_date} · {t.preferred_time}</Badge>
              </div>
              <div className="flex items-center gap-2 border-t border-line pt-3 sm:border-0 sm:pt-0">
                <a href={telUrl(t.phone)} className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call"><Phone className="h-4.5 w-4.5" /></a>
                <a href={whatsappCustomerUrl(t.phone, `Hi ${t.name}, this is BISWAJIT POWER HUB regarding your test ride request.`)} target="_blank" rel="noreferrer" className="tap-target rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]" aria-label="WhatsApp customer"><MessageCircle className="h-4.5 w-4.5" /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
