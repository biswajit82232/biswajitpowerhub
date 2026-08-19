import { useMemo, useState } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';
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
import {
  ADMIN_LIST_LIMIT,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage,
} from '@/features/leads/leadService';
import { invalidateAdminBadges } from '@/lib/adminBadges';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl } from '@/config/site';
import { WhatsAppQuoteMenu } from '@/components/admin/WhatsAppQuoteMenu';

export default function Messages() {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useAsync(() => getContactMessages(), []);
  const [showRead, setShowRead] = useState(false);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = data || [];
    if (!showRead) list = list.filter((m) => !m.is_read);
    if (q) {
      list = list.filter((m) =>
        `${m.name || ''} ${m.phone || ''} ${m.email || ''} ${m.message || ''}`.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, showRead, search]);

  const markRead = async (id, is_read) => {
    try {
      await updateContactMessage(id, { is_read });
      toast(is_read ? 'Marked read.' : 'Marked unread.', 'success');
      invalidateAdminBadges();
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await deleteContactMessage(id);
      toast('Message deleted.', 'success');
      invalidateAdminBadges();
      refetch();
    } catch (e) {
      toast(e.message || 'Delete failed.', 'error');
    }
  };

  return (
    <>
      <AdminSEO title="Messages" />
      <AdminHeader
        title="Contact Messages"
        subtitle="Unread first — toggle to show read messages."
        action={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, message…"
              className="h-10 text-sm sm:w-52"
              aria-label="Search messages"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-body">
              <input type="checkbox" checked={showRead} onChange={(e) => setShowRead(e.target.checked)} />
              Show read
            </label>
          </div>
        )}
      />

      <AsyncError error={error} onRetry={refetch} />
      <AdminListCapNotice count={(data || []).length} limit={ADMIN_LIST_LIMIT} />

      {!isSupabaseConfigured ? (
        <EmptyState icon={Mail} title="Connect Supabase" description="Contact form messages will appear here once Supabase is connected." />
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : error ? null : rows.length === 0 ? (
        <EmptyState icon={Mail} title={showRead || search ? 'No matches' : 'No unread messages'} />
      ) : (
        <div className="space-y-3">
          {rows.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-3 ring-1 shadow-soft sm:rounded-2xl sm:p-4 ${
                m.is_read ? 'bg-surface ring-line' : 'bg-brand-50/40 ring-brand-200'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-heading">{m.name}</p>
                    {!m.is_read && <Badge tone="brand">New</Badge>}
                  </div>
                  <p className="text-sm text-muted">
                    {m.phone}
                    {m.email ? ` · ${m.email}` : ''} · {timeAgo(m.created_at)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-body whitespace-pre-wrap">{m.message}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 sm:border-0 sm:pt-0">
                  <a
                    href={telUrl(m.phone)}
                    onClick={() => { if (!m.is_read) markRead(m.id, true); }}
                    className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600"
                    aria-label="Call"
                  >
                    <Phone className="h-4.5 w-4.5" />
                  </a>
                  <WhatsAppQuoteMenu
                    phone={m.phone}
                    name={m.name}
                    kind="message"
                    onOpen={() => { if (!m.is_read) markRead(m.id, true); }}
                  />
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    className="tap-target rounded-xl bg-red-50 p-2.5 text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 max-w-xs">
                <AdminToggle
                  checked={!!m.is_read}
                  onChange={(v) => markRead(m.id, v)}
                  label="Marked as read"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
