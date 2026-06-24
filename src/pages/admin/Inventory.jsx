import { useState } from 'react';
import { Plus, Pencil, Trash2, Bike } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScooterImage } from '@/components/common/ScooterImage';
import { ScooterForm } from '@/features/scooters/ScooterForm';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getScooters, upsertScooter, deleteScooter, updateStock } from '@/features/scooters/scooterService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatINR } from '@/lib/utils';
import { STOCK_LABELS } from '@/data/scooters';

export default function Inventory() {
  const { toast } = useToast();
  const { data: scooters, loading, refetch } = useAsync(() => getScooters(), []);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  return (
    <>
      <SEO title="Inventory" noindex />
      <AdminHeader
        title="Inventory"
        subtitle={`${scooters?.length || 0} models`}
        action={<Button variant="primary" icon={Plus} onClick={openNew}>Add Scooter</Button>}
      />

      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — showing seed data. Connect Supabase to add, edit, or delete scooters.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {scooters?.map((s) => {
            const stock = STOCK_LABELS[s.stock] || STOCK_LABELS.in_stock;
            return (
              <div key={s.id} className="flex flex-col gap-4 rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft sm:flex-row sm:items-center">
                <ScooterImage src={s.images?.[0]} hue={s.hue} name={s.name} alt={s.name} className="h-20 w-28 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-heading">{s.name}</h3>
                    {s.featured && <Badge tone="brand">Featured</Badge>}
                    <Badge tone={stock.tone}>{stock.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatINR(s.price)} · {s.range} km · {s.topSpeed} km/h
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={s.stock}
                    onChange={(e) => handleStock(s.id, e.target.value)}
                    className="h-10 w-36 text-sm"
                    aria-label="Update stock"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Few Left</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </Select>
                  <button onClick={() => openEdit(s)} className="tap-target rounded-xl bg-brand-50 p-2.5 text-brand-600 transition hover:bg-brand-100" aria-label="Edit">
                    <Pencil className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={() => { if (guard()) setConfirmDelete(s); }} className="tap-target rounded-xl bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100" aria-label="Delete">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
