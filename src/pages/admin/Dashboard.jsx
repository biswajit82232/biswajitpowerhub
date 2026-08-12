import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Phone, MessageCircle, Check } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPullRefresh } from '@/components/admin/AdminPullRefresh';
import { AsyncError } from '@/components/admin/AsyncError';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { getInboxBadges } from '@/features/analytics/analyticsService';
import {
  getTodayQueue,
  resolveInboxItem,
  QUEUE_KIND_LABEL,
  QUEUE_KIND_FILTERS,
} from '@/features/admin/inboxService';
import { invalidateAdminBadges } from '@/lib/adminBadges';
import { isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { telUrl, whatsappCustomerUrl } from '@/config/site';

function matchesSearch(item, q) {
  if (!q) return true;
  const hay = `${item.title || ''} ${item.phone || ''} ${item.subtitle || ''}`.toLowerCase();
  return hay.includes(q);
}

export default function Dashboard() {
  const { toast } = useToast();
  const { data: queue, loading, error, refetch } = useAsync(() => getTodayQueue(80), []);
  const { data: badges, refetch: refetchBadges } = useAsync(() => getInboxBadges(), []);
  const [kind, setKind] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const refreshAll = async () => {
    await Promise.all([
      refetch().catch(() => null),
      refetchBadges().catch(() => null),
    ]);
    invalidateAdminBadges();
  };

  const { pullPx, refreshing, threshold } = usePullToRefresh(refreshAll);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (queue || [])
      .filter((item) => (kind === 'all' ? true : item.kind === kind))
      .filter((item) => matchesSearch(item, q));
  }, [queue, kind, search]);

  const onResolve = async (item) => {
    setBusyId(item.id);
    try {
      await resolveInboxItem(item);
      toast('Updated.', 'success');
      await refreshAll();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative">
      <AdminPullRefresh pullPx={pullPx} refreshing={refreshing} threshold={threshold} />

      <div style={{ transform: pullPx ? `translateY(${Math.min(pullPx, 28)}px)` : undefined }}>
        <AdminSEO title="Inbox" />
        <AdminHeader
          title="Inbox"
          subtitle="Open work across callbacks, rides, service, messages, and reviews."
        />

        <AsyncError error={error} onRetry={refreshAll} />

        {!isSupabaseConfigured ? (
          <EmptyState
            icon={Inbox}
            title="Connect Supabase"
            description="Inbox requests appear here once Supabase is connected."
          />
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone…"
                className="h-10 text-sm sm:max-w-xs"
                aria-label="Search inbox"
              />
              <p className="text-xs font-medium text-muted sm:ml-auto">
                {list.length} open{kind !== 'all' ? ` · ${QUEUE_KIND_LABEL[kind] || kind}` : ''}
              </p>
            </div>

            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap">
              {QUEUE_KIND_FILTERS.map((f) => {
                const count = f.id === 'all'
                  ? (badges?.total || 0)
                  : (badges?.[f.badgeKey] || 0);
                const active = kind === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setKind(f.id)}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition',
                      active
                        ? 'bg-heading text-white'
                        : 'bg-surface text-body ring-1 ring-line hover:bg-brand-50 hover:text-brand-700',
                    )}
                  >
                    {f.label}
                    {count > 0 && (
                      <span
                        className={cn(
                          'min-w-[1.1rem] rounded-full px-1 text-center text-[0.65rem] font-bold leading-4',
                          active ? 'bg-white/20 text-white' : 'bg-red-500 text-white',
                        )}
                      >
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={search || kind !== 'all' ? 'No matches' : 'Inbox clear'}
                description={
                  search || kind !== 'all'
                    ? 'Try another filter or search.'
                    : 'New requests appear here as customers submit forms.'
                }
              />
            ) : (
              <div className="space-y-1.5">
                {list.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-xl bg-surface px-2.5 py-2 ring-1 ring-line sm:px-3 sm:py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={item.urgency >= 3 ? 'hot' : item.urgency >= 2 ? 'warm' : 'cold'}>
                          {QUEUE_KIND_LABEL[item.kind] || item.kind}
                        </Badge>
                        <p className="truncate text-sm font-semibold text-heading">{item.title}</p>
                      </div>
                      <p className="truncate text-[11px] text-muted">
                        {item.sla} · {item.subtitle}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {item.phone && (
                        <>
                          <a
                            href={telUrl(item.phone)}
                            className="tap-target rounded-lg bg-brand-50 p-2 text-brand-600"
                            aria-label="Call"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <a
                            href={whatsappCustomerUrl(
                              item.phone,
                              `Hi ${item.title}, this is BISWAJIT POWER HUB.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tap-target rounded-lg bg-[#25D366]/10 p-2 text-[#1da851]"
                            aria-label="WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </>
                      )}
                      <Button
                        type="button"
                        variant="softBrand"
                        size="xs"
                        icon={Check}
                        loading={busyId === item.id}
                        disabled={!!busyId}
                        onClick={() => onResolve(item)}
                        className="hidden sm:inline-flex"
                      >
                        {item.doneLabel || 'Done'}
                      </Button>
                      <button
                        type="button"
                        disabled={!!busyId}
                        onClick={() => onResolve(item)}
                        className="tap-target rounded-lg bg-brand-50 p-2 text-brand-700 sm:hidden"
                        aria-label={item.doneLabel || 'Done'}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <Link
                        to={item.href}
                        className="rounded-lg bg-surface-alt px-2 py-1.5 text-[11px] font-bold text-heading ring-1 ring-line"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
