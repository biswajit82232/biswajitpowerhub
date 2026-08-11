import { PhoneCall, Phone, MessageCircle } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getCallbacks, updateCallback } from '@/features/leads/leadService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl, whatsappCustomerUrl } from '@/config/site';

export default function Callbacks() {
  const { toast } = useToast();
  const { data, loading, refetch } = useAsync(() => getCallbacks(), []);

  const setHandled = async (id, handled) => {
    try {
      await updateCallback(id, { handled });
      toast(handled ? 'Marked handled.' : 'Reopened.', 'success');
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  return (
    <>
      <SEO title="Callbacks" noindex />
      <AdminHeader title="Callback Requests" subtitle="Visitors who asked us to call them back." />

      {!isSupabaseConfigured ? (
        <EmptyState icon={PhoneCall} title="Connect Supabase" description="Callback requests will be listed here once Supabase is connected." />
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : data?.length === 0 ? (
        <EmptyState icon={PhoneCall} title="No callback requests yet" />
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <div
              key={c.id}
              className={`flex flex-col gap-3 rounded-xl p-3 ring-1 shadow-soft sm:flex-row sm:items-center sm:rounded-2xl sm:p-4 ${
                c.handled ? 'bg-surface ring-line opacity-80' : 'bg-surface ring-line'
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
                <a href={telUrl(c.phone)} className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call"><Phone className="h-4.5 w-4.5" /></a>
                <a href={whatsappCustomerUrl(c.phone, `Hi ${c.name}, this is BISWAJIT POWER HUB — you requested a callback.`)} target="_blank" rel="noreferrer" className="tap-target rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]" aria-label="WhatsApp customer"><MessageCircle className="h-4.5 w-4.5" /></a>
                <div className="w-full sm:w-44">
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
