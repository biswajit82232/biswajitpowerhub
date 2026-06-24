import { useState } from 'react';
import { Users, Flame, Phone, MessageCircle } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getLeads, updateLead } from '@/features/leads/leadService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';
import { telUrl, whatsappUrl } from '@/config/site';

const STATUSES = ['new', 'contacted', 'follow_up', 'converted', 'lost'];

export default function Leads() {
  const { toast } = useToast();
  const { data: leads, loading, refetch } = useAsync(() => getLeads(), []);
  const [filter, setFilter] = useState('all');

  const list = (leads || []).filter((l) => filter === 'all' || l.classification === filter);

  const onStatus = async (id, status) => {
    try {
      await updateLead(id, { status });
      toast('Lead updated.', 'success');
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  return (
    <>
      <SEO title="Leads" noindex />
      <AdminHeader
        title="Lead Management"
        subtitle="Automatically scored & classified by visitor behaviour."
        action={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
            <option value="all">All leads</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </Select>
        }
      />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={Users}
          title="Connect Supabase to track leads"
          description="Once connected, every callback, test ride, and high-intent visitor is captured and scored here automatically."
        />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Users} title="No leads yet" description="Leads will appear as visitors interact with your site." />
      ) : (
        <div className="space-y-3">
          {list.map((l) => (
            <div key={l.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient font-bold text-white">
                  {l.classification === 'hot' ? <Flame className="h-5 w-5" /> : (l.name?.[0] || '?').toUpperCase()}
                </span>
                <div>
                  <p className="font-bold text-heading">{l.name || 'Anonymous'}</p>
                  <p className="text-sm text-muted">{l.phone || '—'} · score {l.score}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <Badge tone={l.classification}>{l.classification?.toUpperCase()}</Badge>
                {l.last_source && <Badge tone="neutral">{l.last_source}</Badge>}
                <span className="text-xs text-muted">{timeAgo(l.updated_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                {l.phone && (
                  <>
                    <a href={telUrl(l.phone)} className="rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call">
                      <Phone className="h-4.5 w-4.5" />
                    </a>
                    <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]" aria-label="WhatsApp">
                      <MessageCircle className="h-4.5 w-4.5" />
                    </a>
                  </>
                )}
                <Select value={l.status || 'new'} onChange={(e) => onStatus(l.id, e.target.value)} className="h-10 w-36 text-sm">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
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
