import { PhoneCall, Phone, MessageCircle } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsync } from '@/hooks/useAsync';
import { getCallbacks } from '@/features/leads/leadService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl, whatsappUrl } from '@/config/site';

export default function Callbacks() {
  const { data, loading } = useAsync(() => getCallbacks(), []);

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
            <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <PhoneCall className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-heading">{c.name}</p>
                <p className="text-sm text-muted">{c.phone} · {timeAgo(c.created_at)}</p>
              </div>
              <a href={telUrl(c.phone)} className="rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call"><Phone className="h-4.5 w-4.5" /></a>
              <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]" aria-label="WhatsApp"><MessageCircle className="h-4.5 w-4.5" /></a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
