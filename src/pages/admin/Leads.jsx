import { useMemo, useState } from 'react';
import { Users, Flame, Phone, MessageCircle, Zap, Clock, PhoneForwarded } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getLeads, updateLead } from '@/features/leads/leadService';
import { FOLLOW_UP } from '@/lib/purchaseReadiness';
import { timeAgo } from '@/lib/utils';
import { telUrl, whatsappCustomerUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';

const STATUSES = ['new', 'contacted', 'follow_up', 'converted', 'lost'];

const PRIORITY_TONE = {
  [FOLLOW_UP.IMMEDIATE]: 'hot',
  [FOLLOW_UP.TODAY]: 'warm',
  [FOLLOW_UP.LATER]: 'cold',
};

export default function Leads() {
  const { toast } = useToast();
  const { site } = useSite();
  const { data: leads, loading, refetch } = useAsync(() => getLeads(), []);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const list = useMemo(() => {
    let rows = leads || [];
    if (filter !== 'all') rows = rows.filter((l) => l.classification === filter);
    if (priorityFilter !== 'all') rows = rows.filter((l) => l.priority === priorityFilter);
    return rows;
  }, [leads, filter, priorityFilter]);

  const onStatus = async (id, status) => {
    if (String(id).startsWith('cb-') || String(id).startsWith('tr-')) {
      toast('Open Callbacks or Test Rides to manage this request.', 'error');
      return;
    }
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
        subtitle="Purchase readiness scores and smart follow-up prioritization."
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-10 min-w-0 flex-1 text-sm sm:w-44 sm:flex-none">
              <option value="all">All priorities</option>
              <option value={FOLLOW_UP.IMMEDIATE}>Call immediately</option>
              <option value={FOLLOW_UP.TODAY}>Call today</option>
              <option value={FOLLOW_UP.LATER}>Follow up later</option>
            </Select>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 min-w-0 flex-1 text-sm sm:w-36 sm:flex-none">
              <option value="all">All leads</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </Select>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Users} title="No leads yet" description="Leads appear as visitors browse, use calculators, and submit forms." />
      ) : (
        <div className="space-y-3">
          {list.map((l) => (
            <div key={l.id} className="flex flex-col gap-3 rounded-xl bg-surface p-3 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-4 lg:flex-row lg:items-center">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient font-bold text-white">
                  {l.readinessPercent >= 70 ? <Flame className="h-5 w-5" /> : (l.name?.[0] || '?').toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-heading">{l.name || 'Anonymous'}</p>
                  <p className="text-sm text-muted">
                    {l.phone || '—'}
                    {l.interested_scooter ? ` · ${l.interested_scooter}` : ''}
                  </p>
                  {l.signals?.length > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      {l.signals.slice(0, 3).map((s) => s.label).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                <Badge tone={PRIORITY_TONE[l.priority] || 'neutral'} icon={PhoneForwarded}>
                  {l.priorityLabel}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-heading px-2.5 py-1 text-xs font-bold text-white">
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  {l.readinessPercent}% intent
                </span>
                <Badge tone={l.classification}>{l.classification?.toUpperCase()}</Badge>
                {l.last_source && <Badge tone="neutral">{l.last_source}</Badge>}
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(l.lastActivityAt || l.updated_at)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 sm:border-0 sm:pt-0 lg:ml-auto">
                {l.phone && (
                  <>
                    <a href={telUrl(l.phone, site)} className="rounded-xl bg-brand-50 p-2.5 text-brand-600" aria-label="Call">
                      <Phone className="h-4.5 w-4.5" />
                    </a>
                    <a href={whatsappCustomerUrl(l.phone, `Hi ${l.name || 'there'}, this is BISWAJIT POWER HUB regarding your inquiry.`)} target="_blank" rel="noreferrer" className="tap-target rounded-xl bg-[#25D366]/10 p-2.5 text-[#1da851]" aria-label="WhatsApp customer">
                      <MessageCircle className="h-4.5 w-4.5" />
                    </a>
                  </>
                )}
                <Select
                  value={l.status || 'new'}
                  onChange={(e) => onStatus(l.id, e.target.value)}
                  className="h-10 min-w-0 flex-1 text-sm sm:w-36 sm:flex-none"
                  disabled={String(l.id).startsWith('cb-') || String(l.id).startsWith('tr-')}
                >
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
