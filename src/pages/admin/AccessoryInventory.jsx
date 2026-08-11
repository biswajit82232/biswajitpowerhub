import { useMemo, useState } from 'react';
import { Plus, Package, RefreshCw } from 'lucide-react';
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
import { Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { AccessoryImage } from '@/components/common/AccessoryImage';
import { AccessoryForm } from '@/features/accessories/AccessoryForm';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import {
  getAccessories,
  upsertAccessory,
  deleteAccessory,
  updateAccessoryStock,
} from '@/features/accessories/accessoryService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatINR } from '@/lib/utils';

export default function AccessoryInventory() {
  const { toast } = useToast();
  const { data: accessories, loading, refetch } = useAsync(() => getAccessories(), []);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const set = new Set();
    (accessories || []).forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [accessories]);

  const counts = useMemo(() => countByStock(accessories), [accessories]);

  const filtered = useMemo(() => {
    const byStock = filterInventoryItems(accessories, {
      search,
      stockFilter,
      getSearchText: (a) =>
        [a.name, a.category, a.compatibility, a.brand].filter(Boolean).join(' '),
    });
    if (categoryFilter === 'all') return byStock;
    return byStock.filter((a) => a.category === categoryFilter);
  }, [accessories, search, stockFilter, categoryFilter]);

  const guard = () => {
    if (!isSupabaseConfigured) {
      toast('Connect Supabase to manage accessories.', 'error');
      return false;
    }
    return true;
  };

  const openNew = () => {
    if (!guard()) return;
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (a) => {
    if (!guard()) return;
    setEditing(a);
    setOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      await upsertAccessory(payload);
      toast('Accessory saved.', 'success');
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
      await deleteAccessory(confirmDelete.id);
      toast('Accessory deleted.', 'success');
      setConfirmDelete(null);
      refetch();
    } catch (e) {
      toast(e.message || 'Delete failed.', 'error');
    }
  };

  const handleStock = async (id, stock) => {
    if (!guard()) return;
    try {
      await updateAccessoryStock(id, stock);
      toast('Stock updated.', 'success');
      refetch();
    } catch (e) {
      toast(e.message || 'Update failed.', 'error');
    }
  };

  const hasItems = (accessories?.length || 0) > 0;
  const emptyFiltered = hasItems && filtered.length === 0;

  return (
    <>
      <SEO title="Accessories" noindex />
      <AdminHeader
        title="Spare & Body Parts"
        subtitle={`${counts.all} items · manage parts, photos & stock`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button to="/admin/vyapar" variant="secondary" icon={RefreshCw} className="w-full sm:w-auto">
              Vyapar Sync
            </Button>
            <Button variant="primary" icon={Plus} onClick={openNew} className="w-full sm:w-auto">
              Add Accessory
            </Button>
          </div>
        }
      />

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — showing seed data. Connect Supabase to add, edit, or delete accessories.
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
          icon={Package}
          title="No accessories yet"
          description="Add spare parts and body parts, or sync from Vyapar."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" icon={Plus} onClick={openNew}>
                Add Accessory
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
            searchPlaceholder="Search by name, category, or compatibility…"
            counts={counts}
            extraFilter={
              categories.length > 0 ? (
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 w-full shrink-0 rounded-xl px-3 text-sm sm:w-[11rem]"
                  aria-label="Filter by category"
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              ) : null
            }
          />

          {emptyFiltered ? (
            <EmptyState
              icon={Package}
              title="No matches"
              description="Try a different search, stock, or category filter."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setStockFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <CompactInventoryList>
              {filtered.map((a) => (
                <CompactInventoryItem
                  key={a.id}
                  image={
                    <AccessoryImage
                      src={a.images?.[0]}
                      hue={a.hue}
                      name={a.name}
                      alt={a.name}
                      className="h-12 w-14 rounded-xl object-cover sm:h-14 sm:w-16"
                    />
                  }
                  title={a.name}
                  meta={[formatINR(a.price), a.compatibility].filter(Boolean).join(' · ')}
                  tags={
                    <>
                      {a.category && (
                        <Badge tone="brand" className="px-1.5 py-0 text-[10px]">
                          {a.category}
                        </Badge>
                      )}
                      {a.featured && (
                        <Badge tone="warm" className="px-1.5 py-0 text-[10px]">
                          Featured
                        </Badge>
                      )}
                    </>
                  }
                  stockSelect={
                    <InventoryStockSelect
                      value={a.stock}
                      onChange={(e) => handleStock(a.id, e.target.value)}
                    />
                  }
                  actions={
                    <InventoryRowActions
                      onEdit={() => openEdit(a)}
                      onDelete={() => {
                        if (guard()) setConfirmDelete(a);
                      }}
                    />
                  }
                />
              ))}
            </CompactInventoryList>
          )}
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${editing.name}` : 'Add Accessory'} size="xl">
        <AccessoryForm initial={editing} onSubmit={handleSave} onCancel={() => setOpen(false)} saving={saving} />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete accessory?" size="sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Package className="h-7 w-7" />
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
