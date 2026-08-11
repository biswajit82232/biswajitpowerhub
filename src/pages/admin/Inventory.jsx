import { useMemo, useState } from 'react';
import { Plus, Bike, RefreshCw } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CompactInventoryList, CompactInventoryItem } from '@/components/admin/CompactInventoryList';
import { InventoryRowActions } from '@/components/admin/InventoryRowActions';
import {
  InventoryToolbar,
  InventoryStockSelect,
} from '@/components/admin/InventoryToolbar';
import { filterInventoryItems, countByStock } from '@/lib/inventoryList';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScooterImage } from '@/components/common/ScooterImage';
import { ScooterForm } from '@/features/scooters/ScooterForm';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getScooters, upsertScooter, deleteScooter, updateStock } from '@/features/scooters/scooterService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatINR } from '@/lib/utils';
import {
  formatRangeRange,
  formatVariantNames,
  getStartingPrice,
} from '@/lib/scooterVariants';

export default function Inventory() {
  const { toast } = useToast();
  const { data: scooters, loading, refetch } = useAsync(() => getScooters(), []);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  const counts = useMemo(() => countByStock(scooters), [scooters]);
  const filtered = useMemo(
    () =>
      filterInventoryItems(scooters, {
        search,
        stockFilter,
        getSearchText: (s) =>
          [s.name, s.brand, s.tagline, formatVariantNames(s)].filter(Boolean).join(' '),
      }),
    [scooters, search, stockFilter],
  );

  const guard = () => {
    if (!isSupabaseConfigured) {
      toast('Connect Supabase to manage inventory.', 'error');
      return false;
    }
    return true;
  };

  const openNew = () => {
    if (!guard()) return;
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (s) => {
    if (!guard()) return;
    setEditing(s);
    setOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      await upsertScooter(payload);
      toast('Scooter saved.', 'success');
      setOpen(false);
      refetch();
    } catch (e) {
      toast(e.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteScooter(confirmDelete.id);
      toast('Scooter deleted.', 'success');
      setConfirmDelete(null);
      refetch();
    } catch (e) {
      toast(e.message || 'Delete failed.', 'error');
    }
  };

  const handleStock = async (id, stock) => {
    if (!guard()) return;
    try {
      await updateStock(id, stock);
      toast('Stock updated.', 'success');
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  const hasItems = (scooters?.length || 0) > 0;
  const emptyFiltered = hasItems && filtered.length === 0;

  return (
    <>
      <SEO title="Inventory" noindex />
      <AdminHeader
        title="Inventory"
        subtitle={`${counts.all} models · manage scooters, battery packs & stock`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button to="/admin/vyapar" variant="secondary" icon={RefreshCw} className="w-full sm:w-auto">
              Vyapar Sync
            </Button>
            <Button variant="primary" icon={Plus} onClick={openNew} className="w-full sm:w-auto">
              Add Scooter
            </Button>
          </div>
        }
      />

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — showing seed data. Connect Supabase to add, edit, or delete scooters.
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : !hasItems ? (
        <EmptyState
          icon={Bike}
          title="No scooters yet"
          description="Add your first scooter model, or sync from Vyapar."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" icon={Plus} onClick={openNew}>
                Add Scooter
              </Button>
              <Button to="/admin/vyapar" variant="secondary" icon={RefreshCw}>
                Vyapar Sync
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <InventoryToolbar
            search={search}
            onSearchChange={setSearch}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            searchPlaceholder="Search by name, brand, or battery pack…"
            counts={counts}
          />

          {emptyFiltered ? (
            <EmptyState
              icon={Bike}
              title="No matches"
              description="Try a different search or stock filter."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setStockFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <CompactInventoryList>
              {filtered.map((s) => {
                const packs = formatVariantNames(s, ' · ');
                const meta = [
                  formatINR(getStartingPrice(s)),
                  formatRangeRange(s),
                  s.topSpeed != null ? `${s.topSpeed} km/h` : null,
                  packs,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <CompactInventoryItem
                    key={s.id}
                    image={
                      <ScooterImage
                        src={s.images?.[0]}
                        hue={s.hue}
                        name={s.name}
                        alt={s.name}
                        className="h-12 w-14 rounded-xl object-cover sm:h-14 sm:w-16"
                      />
                    }
                    title={s.name}
                    meta={meta}
                    tags={
                      <>
                        {s.featured && (
                          <Badge tone="brand" className="px-1.5 py-0 text-[10px]">
                            Featured
                          </Badge>
                        )}
                        {s.isBudget && (
                          <Badge tone="success" className="px-1.5 py-0 text-[10px]">
                            Budget
                          </Badge>
                        )}
                        {s.isPremium && (
                          <Badge tone="brand" className="px-1.5 py-0 text-[10px]">
                            Premium
                          </Badge>
                        )}
                        {s.noLicence && (
                          <Badge tone="success" className="px-1.5 py-0 text-[10px]">
                            No Licence
                          </Badge>
                        )}
                      </>
                    }
                    stockSelect={
                      <InventoryStockSelect
                        value={s.stock}
                        onChange={(e) => handleStock(s.id, e.target.value)}
                      />
                    }
                    actions={
                      <InventoryRowActions
                        onEdit={() => openEdit(s)}
                        onDelete={() => {
                          if (guard()) setConfirmDelete(s);
                        }}
                      />
                    }
                  />
                );
              })}
            </CompactInventoryList>
          )}
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${editing.name}` : 'Add Scooter'} size="xl">
        <ScooterForm initial={editing} onSubmit={handleSave} onCancel={() => setOpen(false)} saving={saving} />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete scooter?" size="sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Bike className="h-7 w-7" />
          </span>
          <p className="text-sm text-body">
            Delete <span className="font-bold text-heading">{confirmDelete?.name}</span>? This cannot be undone.
          </p>
          <div className="mt-2 flex w-full gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
