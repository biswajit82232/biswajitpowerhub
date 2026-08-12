import { useMemo, useState } from 'react';
import { CalendarCheck, Phone, MessageCircle, Bike } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AsyncError } from '@/components/admin/AsyncError';
import { AdminListCapNotice } from '@/components/admin/AdminListCapNotice';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { ADMIN_LIST_LIMIT, getTestRides, updateTestRide } from '@/features/leads/leadService';
import { invalidateAdminBadges } from '@/lib/adminBadges';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl, whatsappCustomerUrl } from '@/config/site';

const STATUSES = [
  { v: 'requested', l: 'Requested' },
  { v: 'confirmed', l: 'Confirmed' },
  { v: 'done', l: 'Done' },
  { v: 'cancelled', l: 'Cancelled' },
];

export default function TestRides() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useAsync(() => getTestRides(), []);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = data || [];
    if (!showAll) list = list.filter((t) => (t.status || 'requested') === 'requested');
    if (q) {
      list = list.filter((t) =>
        `${t.name || ''} ${t.phone || ''} ${t.scooter || ''}`.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, showAll, search]);

  const onStatus = async (id, status) => {
    try {
      await updateTestRide(id, { status });
      toast('Status updated.', 'success');
      invalidateAdminBadges();
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  return (
    <>
      <AdminSEO title="Test Rides" />
      <AdminHeader
        title="Test Ride Requests"
        subtitle="Open requests first — toggle to show all statuses."
        action={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone…"
              className="h-10 text-sm sm:w-44"
              aria-label="Search test rides"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-body">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Show all
            </label>
          </div>
        )}
      />

      <AsyncError error={error} onRetry={refetch} />
      <AdminListCapNotice count={(data || []).length} limit={ADMIN_LIST_LIMIT} />

      {!isSupabaseConfigured ? (
        <EmptyState icon={CalendarCheck} title="Connect Supabase" description="Test ride bookings will appear here once Supabase is connected." />
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : error ? null : rows.length === 0 ? (
        <EmptyState icon={CalendarCheck} title={showAll || search ? 'No matches' : 'No open test rides'} />
      ) : (
        <div className="space-y-3">
          {rows.map((t) => (
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
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 sm:border-0 sm:pt-0">
                <a href={telUrl(t.phone)} className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call"><Phone className="h-4.5 w-4.5" /></a>
                <a href={whatsappCustomerUrl(t.phone, `Hi ${t.name}, this is BISWAJIT POWER HUB regarding your test ride request.`)} target="_blank" rel="noopener noreferrer" className="tap-target rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]" aria-label="WhatsApp customer"><MessageCircle className="h-4.5 w-4.5" /></a>
                <Select
                  value={t.status || 'requested'}
                  onChange={(e) => onStatus(t.id, e.target.value)}
                  className="h-10 min-w-0 flex-1 text-sm sm:w-36 sm:flex-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s.v} value={s.v}>{s.l}</option>
                  ))}
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
