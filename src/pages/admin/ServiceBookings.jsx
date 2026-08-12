import { useMemo, useState } from 'react';
import { Wrench, Phone, MessageCircle, Bike } from 'lucide-react';
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
import { ADMIN_LIST_LIMIT, getServiceBookings, updateServiceBooking } from '@/features/leads/leadService';
import { getServiceKind, serviceKindLabel } from '@/data/serviceKinds';
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

export default function ServiceBookings() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useAsync(() => getServiceBookings(), []);
  const [kindFilter, setKindFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  const list = useMemo(() => {
    let rows = data || [];
    if (!showAll) rows = rows.filter((b) => (b.status || 'requested') === 'requested');
    if (kindFilter === 'free') rows = rows.filter((b) => String(b.service_kind).startsWith('free_'));
    else if (kindFilter === 'paid') rows = rows.filter((b) => b.service_kind === 'paid');
    else if (kindFilter !== 'all') rows = rows.filter((b) => b.service_kind === kindFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((b) =>
        `${b.name || ''} ${b.phone || ''} ${b.scooter || ''} ${b.details || ''}`.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data, kindFilter, showAll, search]);

  const onStatus = async (id, status) => {
    try {
      await updateServiceBooking(id, { status });
      toast('Status updated.', 'success');
      invalidateAdminBadges();
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  return (
    <>
      <AdminSEO title="Service Bookings" />
      <AdminHeader
        title="Service Bookings"
        subtitle="Open requests first — free and paid workshop bookings."
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone…"
              className="h-10 w-full text-sm sm:w-44"
              aria-label="Search service bookings"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-body">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Show all
            </label>
            <Select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="h-10 w-full text-sm sm:w-44"
              aria-label="Filter service type"
            >
              <option value="all">All types</option>
              <option value="free">Free only</option>
              <option value="paid">Paid only</option>
              <option value="free_1">1st free</option>
              <option value="free_2">2nd free</option>
              <option value="free_3">3rd free</option>
            </Select>
          </div>
        }
      />

      <AsyncError error={error} onRetry={refetch} />
      <AdminListCapNotice count={(data || []).length} limit={ADMIN_LIST_LIMIT} />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={Wrench}
          title="Connect Supabase"
          description="Service bookings will appear here once Supabase is connected and the service_bookings migration is applied."
        />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? null : !data?.length ? (
        <EmptyState icon={Wrench} title="No service bookings yet" />
      ) : !list.length ? (
        <EmptyState
          icon={Wrench}
          title="No matches"
          description="Try another search or filter."
          action={
            <button
              type="button"
              className="text-sm font-semibold text-brand-600"
              onClick={() => { setKindFilter('all'); setSearch(''); }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((b) => {
            const kind = getServiceKind(b.service_kind);
            return (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-xl bg-surface p-3 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:h-11 sm:w-11">
                    <Wrench className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-heading">{b.name}</p>
                      <Badge tone={kind?.tone || 'neutral'}>
                        {serviceKindLabel(b.service_kind)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">
                      {b.phone} · requested {timeAgo(b.created_at)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {b.scooter && (
                        <Badge tone="brand" icon={Bike}>
                          {b.scooter}
                        </Badge>
                      )}
                      <Badge tone="neutral">
                        {b.preferred_date} · {b.preferred_time}
                      </Badge>
                    </div>
                    {b.details && (
                      <p className="mt-2 text-sm text-body">
                        <span className="font-semibold text-heading">Details: </span>
                        {b.details}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <a
                    href={telUrl(b.phone)}
                    className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600"
                    aria-label="Call"
                  >
                    <Phone className="h-4.5 w-4.5" />
                  </a>
                  <a
                    href={whatsappCustomerUrl(
                      b.phone,
                      `Hi ${b.name}, this is BISWAJIT POWER HUB regarding your ${serviceKindLabel(b.service_kind)} booking.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]"
                    aria-label="WhatsApp customer"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                  </a>
                  <Select
                    value={b.status || 'requested'}
                    onChange={(e) => onStatus(b.id, e.target.value)}
                    className="h-10 min-w-0 flex-1 text-sm sm:ml-auto sm:w-36 sm:flex-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.v} value={s.v}>
                        {s.l}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
