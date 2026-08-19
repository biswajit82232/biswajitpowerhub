import { useMemo, useState } from 'react';
import { Users, Flame, Phone, Zap, Clock, PhoneForwarded } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AsyncError } from '@/components/admin/AsyncError';
import { AdminListCapNotice } from '@/components/admin/AdminListCapNotice';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { ADMIN_LIST_LIMIT, getLeads, updateLead } from '@/features/leads/leadService';
import { FOLLOW_UP } from '@/lib/purchaseReadiness';
import { timeAgo } from '@/lib/utils';
import { telUrl } from '@/config/site';
import { WhatsAppQuoteMenu } from '@/components/admin/WhatsAppQuoteMenu';
import { CHANNEL_LABELS } from '@/lib/attribution';
import { useSite } from '@/context/SiteSettingsContext';

const STATUSES = ['new', 'contacted', 'follow_up', 'converted', 'lost'];

const PRIORITY_TONE = {
  [FOLLOW_UP.IMMEDIATE]: 'hot',
  [FOLLOW_UP.TODAY]: 'warm',
  [FOLLOW_UP.LATER]: 'cold',
};

function isEditableLead(id) {
  const s = String(id || '');
  return !s.startsWith('demo-');
}

export default function Leads() {
  const { toast } = useToast();
  const { site } = useSite();
  const { data: leads, loading, error, refetch } = useAsync(() => getLeads(), []);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const summary = useMemo(() => {
    const rows = leads || [];
    return {
      total: rows.length,
      hot: rows.filter((l) => l.classification === 'hot').length,
      highIntent: rows.filter((l) => (l.readinessPercent || 0) >= 60).length,
      callNow: rows.filter((l) => l.priority === FOLLOW_UP.IMMEDIATE).length,
    };
  }, [leads]);

  const list = useMemo(() => {
    let rows = leads || [];
    if (filter !== 'all') rows = rows.filter((l) => l.classification === filter);
    if (priorityFilter !== 'all') rows = rows.filter((l) => l.priority === priorityFilter);
    if (statusFilter !== 'all') rows = rows.filter((l) => (l.status || 'new') === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((l) => {
        const hay = `${l.name || ''} ${l.phone || ''} ${l.interested_scooter || ''} ${l.notes || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return rows;
  }, [leads, filter, priorityFilter, statusFilter, search]);

  const onStatus = async (id, status) => {
    if (!isEditableLead(id)) {
      toast('Demo leads cannot be updated. Connect live Supabase.', 'error');
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

  const onNotes = async (id, notes) => {
    if (!isEditableLead(id)) return;
    try {
      await updateLead(id, { notes });
      toast('Notes saved.', 'success');
      refetch();
    } catch (e) {
      toast(e.message || 'Could not save notes.', 'error');
    }
  };

  return (
    <>
      <AdminSEO title="Leads" />
      <AdminHeader
        title="Lead Management"
        subtitle="Purchase readiness scores and smart follow-up prioritization."
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone…"
              className="h-10 min-w-0 flex-1 text-sm sm:w-44 sm:flex-none"
              aria-label="Search leads"
            />
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-10 min-w-0 flex-1 text-sm sm:w-40 sm:flex-none">
              <option value="all">All priorities</option>
              <option value={FOLLOW_UP.IMMEDIATE}>Call immediately</option>
              <option value={FOLLOW_UP.TODAY}>Call today</option>
              <option value={FOLLOW_UP.LATER}>Follow up later</option>
            </Select>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 min-w-0 flex-1 text-sm sm:w-28 sm:flex-none">
              <option value="all">All heat</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 min-w-0 flex-1 text-sm sm:w-32 sm:flex-none">
              <option value="all">All status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
        }
      />

      <AsyncError error={error} onRetry={refetch} />

      {!loading && !error && (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:grid-cols-4">
          {[
            { label: 'Total leads', value: summary.total, icon: Users },
            { label: 'Hot', value: summary.hot, icon: Flame },
            { label: 'High intent', value: summary.highIntent, icon: Zap },
            { label: 'Call now', value: summary.callNow, icon: PhoneForwarded },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-surface px-3 py-2.5 ring-1 ring-line">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{s.label}</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-display text-lg font-extrabold text-heading">
                <s.icon className="h-4 w-4 text-brand-600" />
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <AdminListCapNotice count={(leads || []).length} limit={ADMIN_LIST_LIMIT} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? null : list.length === 0 ? (
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
                  {l.inboxSources?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {l.inboxSources.map((src) => (
                        <Badge key={src} tone="neutral">{src.replace('_', ' ')}</Badge>
                      ))}
                    </div>
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
                {l.attribution?.channel && (
                  <Badge tone="accent">{CHANNEL_LABELS[l.attribution.channel] || l.attribution.channel}</Badge>
                )}
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
                    <WhatsAppQuoteMenu
                      phone={l.phone}
                      name={l.name}
                      kind="lead"
                      scooterName={l.interested_scooter}
                    />
                  </>
                )}
                <Select
                  value={l.status || 'new'}
                  onChange={(e) => onStatus(l.id, e.target.value)}
                  className="h-10 min-w-0 flex-1 text-sm sm:w-36 sm:flex-none"
                  disabled={!isEditableLead(l.id)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              {isEditableLead(l.id) && (
                <div className="w-full border-t border-line pt-3 lg:col-span-full">
                  <label className="block text-xs font-semibold text-muted">
                    Notes
                    <Textarea
                      rows={2}
                      className="mt-1"
                      defaultValue={l.notes || ''}
                      placeholder="Call notes, follow-up reminders…"
                      onBlur={(e) => {
                        const next = e.target.value;
                        if (next !== (l.notes || '')) onNotes(l.id, next);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
