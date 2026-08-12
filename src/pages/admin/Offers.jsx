import { useEffect, useRef, useState } from 'react';
import { Gift, ImagePlus, Loader2, Plus, Tag, Save, X } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { InventoryRowActions } from '@/components/admin/InventoryRowActions';
import { Field, Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { deleteOffer, getAllOffers, saveOffer, uploadOfferImage } from '@/features/offers/offerService';
import { isSupabaseConfigured } from '@/lib/supabase';

const EMPTY = {
  title: '',
  discountText: '',
  promoCode: '',
  description: '',
  kind: 'promo',
  imageUrl: '',
  showOnHero: true,
  active: true,
  sortOrder: 0,
};

export default function Offers() {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const { data, loading, refetch } = useAsync(() => getAllOffers(), []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (editing === 'new') setForm(EMPTY);
    else if (editing) setForm({ ...EMPTY, ...editing });
  }, [editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadOfferImage(file);
      set('imageUrl', url);
      toast('Photo uploaded.', 'success');
    } catch (err) {
      toast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.discountText.trim()) {
      toast('Title and discount / freebie text are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveOffer(form);
      toast('Offer saved.', 'success');
      setEditing(null);
      refetch();
    } catch (err) {
      toast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const id = confirmDelete;
    try {
      await deleteOffer(id);
      toast('Offer deleted.', 'success');
      if (editing?.id === id) setEditing(null);
      setConfirmDelete(null);
      refetch();
    } catch (err) {
      toast(err.message || 'Delete failed.', 'error');
    }
  };

  const isFree = form.kind === 'free_with_purchase';

  return (
    <>
      <AdminSEO title="Promotional Offers" />
      <AdminHeader
        title="Offers & Freebies"
        subtitle="Discount promos and free-with-purchase gifts (sticky red badge on the homepage hero)."
        action={
          <Button variant="primary" icon={Plus} onClick={() => setEditing('new')} className="w-full sm:w-auto">
            New Offer
          </Button>
        }
      />

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
          Demo mode — offers save to this browser only. Connect Supabase for production.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-64" />
          ) : !data?.length ? (
            <EmptyState
              icon={Tag}
              title="No offers yet"
              description="Add a discount promo or a free gift with scooty purchase."
              action={<Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>Add Offer</Button>}
            />
          ) : (
            <ul className="space-y-3">
              {data.map((offer) => (
                <li
                  key={offer.id}
                  className="rounded-xl bg-surface p-3 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {offer.imageUrl ? (
                        <img
                          src={offer.imageUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-line"
                        />
                      ) : offer.kind === 'free_with_purchase' ? (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                          <Gift className="h-5 w-5" />
                        </span>
                      ) : null}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display font-bold text-heading">{offer.title}</p>
                          <Badge tone={offer.active ? 'success' : 'neutral'}>
                            {offer.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {offer.kind === 'free_with_purchase' ? (
                            <Badge tone="hot">Free w/ scooty</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-lg font-extrabold text-brand-700">{offer.discountText}</p>
                        {offer.promoCode && (
                          <p className="mt-1 font-mono text-xs text-muted">Code: {offer.promoCode}</p>
                        )}
                      </div>
                    </div>
                    <InventoryRowActions
                      onEdit={() => setEditing(offer)}
                      onDelete={
                        String(offer.id).startsWith('legacy')
                          ? undefined
                          : () => setConfirmDelete(offer.id)
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3">
          {editing ? (
            <form onSubmit={onSave} className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6 lg:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-heading">
                  {editing === 'new' ? 'New offer' : 'Edit offer'}
                </h3>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-muted hover:bg-slate-50">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Offer type" htmlFor="offer-kind" className="sm:col-span-2 sm:max-w-md">
                  <Select
                    id="offer-kind"
                    value={form.kind}
                    onChange={(e) => {
                      const kind = e.target.value;
                      setForm((f) => ({
                        ...f,
                        kind,
                        promoCode: kind === 'free_with_purchase' ? '' : f.promoCode,
                        imageUrl: kind === 'promo' ? '' : f.imageUrl,
                      }));
                    }}
                  >
                    <option value="promo">Discount / promo strip</option>
                    <option value="free_with_purchase">Free with scooty purchase (hero sticky)</option>
                  </Select>
                </Field>
                <Field label="Offer title" htmlFor="offer-title" required className="sm:col-span-2">
                  <Input
                    id="offer-title"
                    placeholder={isFree ? 'e.g. Free Helmet' : 'e.g. Festive Sale'}
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    required
                  />
                </Field>
                <Field
                  label={isFree ? 'Freebie label (big display)' : 'Discount text (big display)'}
                  htmlFor="offer-discount"
                  required
                  hint={isFree ? 'Shown on the red hero badge' : 'Shown large on the website'}
                >
                  <Input
                    id="offer-discount"
                    placeholder={isFree ? 'e.g. FREE Helmet' : 'e.g. ₹3,000 off'}
                    value={form.discountText}
                    onChange={(e) => set('discountText', e.target.value)}
                    required
                  />
                </Field>
                {!isFree ? (
                  <Field label="Promo code" htmlFor="offer-code" hint="Optional — e.g. BIDGDG">
                    <Input
                      id="offer-code"
                      placeholder="BIDGDG"
                      value={form.promoCode}
                      onChange={(e) => set('promoCode', e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                    />
                  </Field>
                ) : (
                  <Field label="Photo of free gift" htmlFor="offer-photo" hint="Shown on the sticky red hero badge">
                    <div className="flex items-center gap-3">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-line" />
                      ) : (
                        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-500">
                          <Gift className="h-6 w-6" />
                        </span>
                      )}
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={uploading ? Loader2 : ImagePlus}
                          disabled={uploading}
                          onClick={() => fileRef.current?.click()}
                        >
                          {uploading ? 'Uploading…' : form.imageUrl ? 'Replace photo' : 'Upload photo'}
                        </Button>
                        {form.imageUrl ? (
                          <button
                            type="button"
                            className="text-left text-xs font-medium text-muted hover:text-heading"
                            onClick={() => set('imageUrl', '')}
                          >
                            Remove photo
                          </button>
                        ) : null}
                      </div>
                      <input
                        ref={fileRef}
                        id="offer-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUpload}
                      />
                    </div>
                  </Field>
                )}
                <Field label="Sort order" htmlFor="offer-sort" className="sm:col-span-2 sm:max-w-xs">
                  <Input
                    id="offer-sort"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => set('sortOrder', e.target.value)}
                  />
                </Field>
                <Field label="Description" htmlFor="offer-desc" className="sm:col-span-2">
                  <Textarea
                    id="offer-desc"
                    rows={3}
                    placeholder={isFree ? 'e.g. Free branded helmet with every scooter purchase this month.' : 'Short line shown under the offer on the website.'}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm font-medium text-body">
                <input
                  type="checkbox"
                  checked={form.showOnHero}
                  onChange={(e) => set('showOnHero', e.target.checked)}
                  className="h-5 w-5 rounded accent-brand-500"
                />
                Show on homepage hero
              </label>

              <label className="mt-3 flex items-center gap-2 text-sm font-medium text-body">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set('active', e.target.checked)}
                  className="h-5 w-5 rounded accent-brand-500"
                />
                Active — show on website
              </label>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button type="submit" variant="primary" icon={Save} loading={saving} className="w-full sm:w-auto">
                  Save Offer
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(null)} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="hidden min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-line bg-surface-alt/50 p-6 text-center text-sm text-muted lg:flex">
              Select an offer to edit, or create a new one. Use “Free with scooty purchase” for the sticky red hero badge with photo.
            </div>
          )}
        </div>
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete offer?" size="sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Tag className="h-7 w-7" />
          </span>
          <p className="text-sm text-body">Delete this offer? This cannot be undone.</p>
          <div className="mt-2 flex w-full gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
