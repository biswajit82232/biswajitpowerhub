import { useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CompactInventoryList, CompactInventoryItem, CompactInventoryMobileStock } from '@/components/admin/CompactInventoryList';
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
import { STOCK_LABELS } from '@/data/scooters';

export default function AccessoryInventory() {
  const { toast } = useToast();
  const { data: accessories, loading, refetch } = useAsync(() => getAccessories(), []);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  return (
    <>
      <SEO title="Accessories" noindex />
      <AdminHeader
        title="Spare & Body Parts"
        subtitle={`${accessories?.length || 0} items`}
        action={<Button variant="primary" icon={Plus} onClick={openNew} className="w-full sm:w-auto">Add Accessory</Button>}
      />

      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — showing seed data. Connect Supabase to add, edit, or delete accessories.
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : !accessories?.length ? (
        <EmptyState icon={Package} title="No accessories yet" description="Add spare parts and body parts to your catalog." action={<Button variant="primary" icon={Plus} onClick={openNew}>Add Accessory</Button>} />
      ) : (
        <CompactInventoryList>
          {accessories.map((a) => {
            const stock = STOCK_LABELS[a.stock] || STOCK_LABELS.in_stock;
            const stockSelect = (
              <Select
                value={a.stock}
                onChange={(e) => handleStock(a.id, e.target.value)}
                className="h-8 w-[6.75rem] rounded-lg px-2 text-xs"
                aria-label="Update stock"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Few Left</option>
                <option value="out_of_stock">Out of Stock</option>
              </Select>
            );
            return (
              <div key={a.id}>
                <CompactInventoryItem
                  image={
                    <AccessoryImage
                      src={a.images?.[0]}
                      hue={a.hue}
                      name={a.name}
                      alt={a.name}
                      className="h-10 w-12 rounded-lg object-cover sm:h-11 sm:w-14"
                    />
                  }
                  title={a.name}
                  meta={`${formatINR(a.price)}${a.compatibility ? ` · ${a.compatibility}` : ''}`}
                  tags={
                    <>
                      <Badge tone="brand" className="shrink-0 px-1.5 py-0 text-[10px]">{a.category}</Badge>
                      {a.featured && <Badge tone="warm" className="shrink-0 px-1.5 py-0 text-[10px]">Featured</Badge>}
                      <Badge tone={stock.tone} className="shrink-0 px-1.5 py-0 text-[10px] sm:hidden">{stock.label}</Badge>
                    </>
                  }
                  stockSelect={stockSelect}
                  actions={
                    <>
                      <button onClick={() => openEdit(a)} className="tap-target rounded-lg p-1.5 text-brand-600 transition hover:bg-brand-50" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => { if (guard()) setConfirmDelete(a); }} className="tap-target rounded-lg p-1.5 text-red-500 transition hover:bg-red-50" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  }
                />
                <CompactInventoryMobileStock>{stockSelect}</CompactInventoryMobileStock>
              </div>
            );
          })}
        </CompactInventoryList>
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
