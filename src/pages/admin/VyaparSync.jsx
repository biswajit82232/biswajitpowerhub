import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw, Settings2, Bike, Package, Link2, AlertTriangle, CloudDownload,
} from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { InventoryRowActions } from '@/components/admin/InventoryRowActions';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CompactInventoryList, CompactInventoryItem } from '@/components/admin/CompactInventoryList';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatINR } from '@/lib/utils';
import { getScooters } from '@/features/scooters/scooterService';
import { getAccessories } from '@/features/accessories/accessoryService';
import { STOCK_LABELS } from '@/data/scooters';
import { VyaparItemEditor } from '@/features/vyapar/VyaparItemEditor';
import {
  getVyaparSettings,
  saveVyaparSettings,
  getVyaparItems,
  saveVyaparItem,
  syncFromVyapar,
  publishVyaparItem,
  linkVyaparItem,
  unlinkVyaparItem,
  pushOverridesToLocal,
} from '@/features/vyapar/vyaparService';
import {
  effectiveName,
  effectivePrice,
  mapVyaparStock,
} from '@/features/vyapar/vyaparMapping';

function formatWhen(iso) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function VyaparSync() {
  const { toast } = useToast();
  const { data, loading, refetch } = useAsync(async () => {
    const [settings, items, scooters, accessories] = await Promise.all([
      getVyaparSettings(),
      getVyaparItems(),
      getScooters(),
      getAccessories(),
    ]);
    return { settings, items, scooters, accessories };
  }, []);

  const settings = data?.settings;
  const items = useMemo(() => data?.items || [], [data]);
  const scooters = data?.scooters || [];
  const accessories = data?.accessories || [];

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftSettings, setDraftSettings] = useState(null);

  const guard = () => {
    if (!isSupabaseConfigured) {
      toast('Connect Supabase and run the Vyapar migration first.', 'error');
      return false;
    }
    return true;
  };

  const openSettings = () => {
    setDraftSettings({ ...(settings || {}) });
    setSettingsOpen(true);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === 'linked' && !item.linked) return false;
      if (filter === 'unlinked' && item.linked) return false;
      if (filter === 'scooter' && item.mappedType !== 'scooter') return false;
      if (filter === 'accessory' && item.mappedType !== 'accessory') return false;
      if (!q) return true;
      const hay = `${item.name} ${item.displayName} ${(item.categoryVyapar || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, filter, query]);

  const stats = useMemo(() => ({
    total: items.length,
    linked: items.filter((i) => i.linked).length,
    scooters: items.filter((i) => i.mappedType === 'scooter').length,
    accessories: items.filter((i) => i.mappedType === 'accessory').length,
  }), [items]);

  const handleToggleEnabled = async (enabled) => {
    if (!guard()) return;
    try {
      await saveVyaparSettings({ enabled });
      toast(enabled ? 'Vyapar sync enabled.' : 'Vyapar sync paused.', 'success');
      refetch();
    } catch (e) {
      toast(e.message || 'Could not update sync switch.', 'error');
    }
  };

  const handleSaveSettings = async () => {
    if (!guard() || !draftSettings) return;
    setSaving(true);
    try {
      await saveVyaparSettings(draftSettings);
      toast('Vyapar settings saved.', 'success');
      setSettingsOpen(false);
      refetch();
    } catch (e) {
      toast(e.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!guard()) return;
    setSyncing(true);
    try {
      const result = await syncFromVyapar();
      const appliedOn = result.settings?.enabled;
      toast(
        `Fetched ${result.fetched} items` +
          (appliedOn
            ? ` · applied price/stock to ${result.applied} linked`
            : ' · sync paused (cache only)'),
        'success',
      );
      refetch();
    } catch (e) {
      toast(e.message || 'Sync failed.', 'error');
      refetch();
    } finally {
      setSyncing(false);
    }
  };

  const closeEditor = useCallback(() => setEditing(null), []);

  const handleSaveItem = async (payload) => {
    setSaving(true);
    try {
      await saveVyaparItem(payload);
      toast('Item settings saved.', 'success');
      closeEditor();
      refetch();
    } catch (e) {
      toast(e.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (item, opts) => {
    setSaving(true);
    try {
      const result = await publishVyaparItem(item, opts);
      toast(
        `Published to ${result.type === 'scooter' ? 'Inventory' : 'Spare & Parts'} as “${result.product.name}”.`,
        'success',
      );
      closeEditor();
      refetch();
    } catch (e) {
      toast(e.message || 'Publish failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLink = async (item, { type, id }) => {
    setSaving(true);
    try {
      await linkVyaparItem(item, { type, id, pushName: false });
      toast('Linked to local product.', 'success');
      closeEditor();
      refetch();
    } catch (e) {
      toast(e.message || 'Link failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (item) => {
    setSaving(true);
    try {
      await unlinkVyaparItem(item);
      toast('Unlinked. Local product was not deleted.', 'success');
      closeEditor();
      refetch();
    } catch (e) {
      toast(e.message || 'Unlink failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePushOverrides = async (item) => {
    setSaving(true);
    try {
      await saveVyaparItem(item);
      await pushOverridesToLocal(item);
      toast('Pushed rename / photos / category to local product.', 'success');
      closeEditor();
      refetch();
    } catch (e) {
      toast(e.message || 'Push failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminSEO title="Vyapar Sync" />
      <AdminHeader
        title="Vyapar Sync"
        subtitle="Import online-store stock into Inventory & Spare & Parts — local pages stay in full control."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="secondary" icon={Settings2} onClick={openSettings} className="w-full sm:w-auto">
              Settings
            </Button>
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={handleSync}
              disabled={syncing}
              className="w-full sm:w-auto"
            >
              {syncing ? 'Syncing…' : 'Sync now'}
            </Button>
          </div>
        }
      />

      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — connect Supabase and run <code className="font-mono text-xs">add_vyapar_sync.sql</code> to enable sync.
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <AdminToggle
            checked={!!settings?.enabled}
            onChange={handleToggleEnabled}
            disabled={!isSupabaseConfigured || loading}
            label="Sync price & stock"
            hint="When on, Sync now updates linked local products. When off, only refreshes this cache."
          />
        </div>
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Last sync</p>
          <p className="mt-1 text-sm font-bold text-heading">{formatWhen(settings?.lastSyncedAt)}</p>
          <p className="mt-0.5 text-xs text-muted">{settings?.lastSyncCount || 0} items cached</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Linked</p>
          <p className="mt-1 text-sm font-bold text-heading">{stats.linked} / {stats.total}</p>
          <p className="mt-0.5 text-xs text-muted">{stats.scooters} scooters · {stats.accessories} parts</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Main inventory</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/admin/inventory" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
              <Bike className="h-3.5 w-3.5" /> Scooters
            </Link>
            <Link to="/admin/accessories" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
              <Package className="h-3.5 w-3.5" /> Spare & Parts
            </Link>
          </div>
        </div>
      </div>

      {settings?.lastSyncError && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Last sync error: {settings.lastSyncError}</span>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Vyapar items…"
          className="sm:max-w-xs"
        />
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-44">
          <option value="all">All items</option>
          <option value="linked">Linked only</option>
          <option value="unlinked">Unlinked only</option>
          <option value="scooter">Scooter type</option>
          <option value="accessory">Parts type</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : !items.length ? (
        <EmptyState
          icon={CloudDownload}
          title="No Vyapar items yet"
          description="Tap Sync now to fetch your online store catalogue. Then publish or link each item — Inventory & Spare & Parts stay fully editable."
          action={
            <Button variant="primary" icon={RefreshCw} onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync now'}
            </Button>
          }
        />
      ) : !filtered.length ? (
        <EmptyState
          icon={CloudDownload}
          title="No matches"
          description="Try another search or filter."
        />
      ) : (
        <CompactInventoryList>
          {filtered.map((item) => {
            const stock = STOCK_LABELS[mapVyaparStock(item.quantity, item.stockFlag)] || STOCK_LABELS.in_stock;
            const cover = item.localImages?.[0];
            const catalog = item.mappedType === 'scooter' ? scooters : accessories;
            const brokenLink = Boolean(
              item.linked && item.mappedId && !catalog.some((p) => p.id === item.mappedId),
            );
            const removed = (item.notes || '').includes('[Removed from Vyapar store]');
            return (
              <CompactInventoryItem
                key={item.id}
                image={
                  cover ? (
                    <img src={cover} alt="" className="h-12 w-14 rounded-xl object-cover sm:h-14 sm:w-16" />
                  ) : (
                    <span className="flex h-12 w-14 items-center justify-center rounded-xl bg-slate-100 text-muted sm:h-14 sm:w-16">
                      {item.mappedType === 'scooter' ? <Bike className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </span>
                  )
                }
                title={effectiveName(item)}
                meta={`${formatINR(effectivePrice(item))} · qty ${item.quantity} · ${(item.categoryVyapar || []).join(', ') || '—'}`}
                tags={
                  <>
                    {brokenLink ? (
                      <Badge tone="danger" className="px-1.5 py-0 text-[10px]">Broken link</Badge>
                    ) : item.linked ? (
                      <Badge tone="success" className="px-1.5 py-0 text-[10px]">
                        <Link2 className="mr-0.5 inline h-3 w-3" /> Linked
                      </Badge>
                    ) : (
                      <Badge tone="warning" className="px-1.5 py-0 text-[10px]">Unlinked</Badge>
                    )}
                    {removed && (
                      <Badge tone="danger" className="px-1.5 py-0 text-[10px]">Off store</Badge>
                    )}
                    <Badge tone="neutral" className="px-1.5 py-0 text-[10px]">
                      {item.mappedType === 'scooter' ? 'Scooter' : 'Part'}
                    </Badge>
                    <Badge tone={stock.tone} className="px-1.5 py-0 text-[10px]">{stock.label}</Badge>
                    {item.displayName?.trim() && item.displayName.trim() !== item.name && (
                      <Badge tone="brand" className="hidden px-1.5 py-0 text-[10px] sm:inline-flex">Renamed</Badge>
                    )}
                  </>
                }
                actions={
                  <InventoryRowActions
                    onEdit={() => { if (guard()) setEditing(item); }}
                  />
                }
              />
            );
          })}
        </CompactInventoryList>
      )}

      <Modal
        open={!!editing}
        onClose={closeEditor}
        title={editing ? `Vyapar · ${editing.name}` : 'Edit item'}
        size="xl"
      >
        {editing && (
          <VyaparItemEditor
            item={editing}
            scooters={scooters}
            accessories={accessories}
            onSave={handleSaveItem}
            onPublish={handlePublish}
            onLink={handleLink}
            onUnlink={handleUnlink}
            onPushOverrides={handlePushOverrides}
            onCancel={closeEditor}
            saving={saving}
          />
        )}
      </Modal>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Vyapar settings" size="md">
        {draftSettings && (
          <div className="space-y-4">
            <Field label="Store alias" hint="From your store URL: api1.vyaparapp.in/store/…">
              <Input
                value={draftSettings.storeAlias || ''}
                onChange={(e) => setDraftSettings((s) => ({ ...s, storeAlias: e.target.value.trim() }))}
              />
            </Field>
            <Field label="Catalogue ID" hint="Required in production. Default for this store is already set; Sync uses the getItems API (CORS-safe).">
              <Input
                value={draftSettings.catalogueId || ''}
                onChange={(e) => setDraftSettings((s) => ({ ...s, catalogueId: e.target.value.trim() }))}
                required
              />
            </Field>
            <AdminToggle
              checked={draftSettings.syncPrice !== false}
              onChange={(v) => setDraftSettings((s) => ({ ...s, syncPrice: v }))}
              label="Default: sync price"
              hint="Global default for linked items (each item can override)."
            />
            <AdminToggle
              checked={draftSettings.syncStock !== false}
              onChange={(v) => setDraftSettings((s) => ({ ...s, syncStock: v }))}
              label="Default: sync stock"
            />
            <div className="flex gap-2 border-t border-line pt-4">
              <Button variant="secondary" fullWidth onClick={() => setSettingsOpen(false)}>Cancel</Button>
              <Button variant="primary" fullWidth disabled={saving} onClick={handleSaveSettings}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
