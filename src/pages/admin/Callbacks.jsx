import { useMemo, useState } from 'react';
import { PhoneCall, Phone } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AsyncError } from '@/components/admin/AsyncError';
import { AdminListCapNotice } from '@/components/admin/AdminListCapNotice';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { ADMIN_LIST_LIMIT, getCallbacks, updateCallback } from '@/features/leads/leadService';
import { invalidateAdminBadges } from '@/lib/adminBadges';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl } from '@/config/site';
import { WhatsAppQuoteMenu } from '@/components/admin/WhatsAppQuoteMenu';

export default function Callbacks() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useAsync(() => getCallbacks(), []);
  const [showHandled, setShowHandled] = useState(false);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = data || [];
    if (!showHandled) list = list.filter((c) => !c.handled);
    if (q) {
      list = list.filter((c) => `${c.name || ''} ${c.phone || ''}`.toLowerCase().includes(q));
    }
    return list;
  }, [data, showHandled, search]);

  const setHandled = async (id, handled) => {
    try {
      await updateCallback(id, { handled });
      toast(handled ? 'Marked handled.' : 'Reopened.', 'success');
      invalidateAdminBadges();
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  const afterContact = async (id) => {
    const ok = window.confirm('Mark this callback as handled?');
    if (!ok) return;
    await setHandled(id, true);
  };

  return (
    <>
      <AdminSEO title="Callbacks" />
      <AdminHeader
        title="Callback Requests"
        subtitle="Open requests first — toggle to show handled."
        action={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone…"
              className="h-10 text-sm sm:w-44"
              aria-label="Search callbacks"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-body">
              <input type="checkbox" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} />
              Show handled
            </label>
          </div>
        )}
      />

      <AsyncError error={error} onRetry={refetch} />
      <AdminListCapNotice count={(data || []).length} limit={ADMIN_LIST_LIMIT} />

      {!isSupabaseConfigured ? (
        <EmptyState icon={PhoneCall} title="Connect Supabase" description="Callback requests will be listed here once Supabase is connected." />
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : error ? null : rows.length === 0 ? (
        <EmptyState icon={PhoneCall} title={showHandled || search ? 'No matches' : 'No open callbacks'} />
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <div
              key={c.id}
              className={`flex flex-col gap-3 rounded-xl p-3 ring-1 shadow-soft sm:flex-row sm:items-center sm:rounded-2xl sm:p-4 ${
                c.handled ? 'bg-surface ring-line opacity-70' : 'bg-brand-50/30 ring-brand-100'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 sm:h-11 sm:w-11">
                  <PhoneCall className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-heading">{c.name}</p>
                    {String(c.name || '').toLowerCase().includes('no-licence') && (
                      <Badge tone="brand">No-licence</Badge>
                    )}
                    {c.handled ? <Badge tone="success">Handled</Badge> : <Badge tone="warm">Open</Badge>}
                  </div>
                  <p className="text-sm text-muted">{c.phone} · {timeAgo(c.created_at)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 sm:border-0 sm:pt-0">
                <a
                  href={telUrl(c.phone)}
                  onClick={() => { if (!c.handled) setTimeout(() => afterContact(c.id), 600); }}
                  className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600"
                  aria-label="Call"
                >
                  <Phone className="h-4.5 w-4.5" />
                </a>
                <WhatsAppQuoteMenu
                  phone={c.phone}
                  name={c.name}
                  kind="callback"
                  onOpen={() => { if (!c.handled) setTimeout(() => afterContact(c.id), 600); }}
                />
                <div className="ml-auto">
                  <AdminToggle
                    checked={!!c.handled}
                    onChange={(v) => setHandled(c.id, v)}
                    label="Handled"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
