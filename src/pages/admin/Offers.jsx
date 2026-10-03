import { useEffect, useRef, useState } from 'react';
import { Gift, ImagePlus, Loader2, Percent, Plus, Tag, Save, X } from 'lucide-react';
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
import { getScooters } from '@/features/scooters/scooterService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useSaleOffers } from '@/context/SaleOffersContext';
import { normalizePriceTechnique, normalizeSalePercent, quotePrice, SCOOTER_SALE_KIND, SMART_TECHNIQUE, EXACT_TECHNIQUE } from '@/lib/salePrice';
import { getStartingPrice } from '@/lib/scooterVariants';
import { formatINR } from '@/lib/utils';

const EMPTY = {
  title: '',
  discountText: '',
  promoCode: '',
  description: '',
  kind: 'promo',
  imageUrl: '',
  showOnHero: true,
  discountPercent: 10,
  scooterIds: [],
  priceTechnique: SMART_TECHNIQUE,
  active: true,
  sortOrder: 0,
};

export default function Offers() {
  const { toast } = useToast();
  const { refresh: refreshPublicSales } = useSaleOffers();
  const fileRef = useRef(null);
  const { data, loading, refetch } = useAsync(() => getAllOffers(), []);
  const { data: scooters } = useAsync(() => getScooters(), []);
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
    const isSaleDraft = form.kind === SCOOTER_SALE_KIND;
    const salePercent = normalizeSalePercent(form.discountPercent);
    if (!form.title.trim() || (!isSaleDraft && !form.discountText.trim())) {
      toast('Title and discount / freebie text are required.', 'error');
      return;
    }
    if (isSaleDraft && !salePercent) {
      toast('Enter a sale percent from 1 to 90.', 'error');
      return;
    }
    if (isSaleDraft && !form.scooterIds?.length) {
      toast('Select at least one scooty for this sale.', 'error');
      return;
    }
    const payload = isSaleDraft
      ? {
          ...form,
          discountPercent: salePercent,
          discountText: `${salePercent}% OFF`,
          promoCode: '',
          priceTechnique: normalizePriceTechnique(form.priceTechnique),
        }
      : form;
    setSaving(true);
    try {
      await saveOffer(payload);
      await refreshPublicSales();
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
      refreshPublicSales();
    } catch (err) {
      toast(err.message || 'Delete failed.', 'error');
    }
  };

  const isFree = form.kind === 'free_with_purchase';
  const isSale = form.kind === SCOOTER_SALE_KIND;
  const salePercent = normalizeSalePercent(form.discountPercent) || 0;
  const catalog = scooters || [];
  const otherSales = (data || []).filter(
    (offer) => offer.kind === SCOOTER_SALE_KIND && offer.active && offer.id !== editing?.id,
  );

  return (
    <>
      <AdminSEO title="Promotional Offers" />
      <AdminHeader
        title="Offers & Freebies"
        subtitle="Promos, free gifts, and a percent-off sale on the scooters you pick."
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
              description="Add a promo, a free gift, or a percent-off sale on selected scooters."
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
                      ) : offer.kind === 'scooter_sale' ? (
                        <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-red-600 text-white">
                          <Percent className="h-4 w-4" />
                          <span className="text-[10px] font-black leading-none">{offer.discountPercent}%</span>
                        </span>
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
                          {offer.kind === 'scooter_sale' ? (
                            <Badge tone="hot">
                              Sale {offer.discountPercent}% · {offer.scooterIds?.length || 0} scooters
                            </Badge>
                          ) : offer.kind === 'free_with_purchase' ? (
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
                      setForm((f) => {
                        const percent = normalizeSalePercent(f.discountPercent) || 10;
                        return {
                          ...f,
                          kind,
                          promoCode: kind === 'promo' ? f.promoCode : '',
                          imageUrl: kind === 'free_with_purchase' ? f.imageUrl : '',
                          discountPercent: percent,
                          discountText: kind === SCOOTER_SALE_KIND ? `${percent}% OFF` : f.discountText,
                          scooterIds: Array.isArray(f.scooterIds) ? f.scooterIds : [],
                        };
                      });
                    }}
                  >
                    <option value="promo">Discount / promo strip</option>
                    <option value="free_with_purchase">Free with scooty purchase (hero sticky)</option>
                    <option value={SCOOTER_SALE_KIND}>Sale — % off selected scooters</option>
                  </Select>
                </Field>
                <Field label="Offer title" htmlFor="offer-title" required className="sm:col-span-2">
                  <Input
                    id="offer-title"
                    placeholder={isSale ? 'e.g. Showroom Sale' : isFree ? 'e.g. Free Helmet' : 'e.g. Festive Sale'}
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    required
                  />
                </Field>
                {isSale ? (
                  <Field
                    label="Percent off"
                    htmlFor="offer-percent"
                    required
                    hint="Minimum off every battery pack. The website, EMI, compare, and WhatsApp update on their own."
                    className="sm:max-w-xs"
                  >
                    <Input
                      id="offer-percent"
                      type="number"
                      min={1}
                      max={90}
                      step={1}
                      inputMode="numeric"
                      value={form.discountPercent}
                      onChange={(e) => {
                        const next = e.target.value;
                        const percent = normalizeSalePercent(next);
                        setForm((f) => ({
                          ...f,
                          discountPercent: next,
                          discountText: percent ? `${percent}% OFF` : f.discountText,
                        }));
                      }}
                      required
                    />
                  </Field>
                ) : (
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
                )}
                {isSale ? (
                  <Field label="Price technique" htmlFor="offer-technique" className="sm:col-span-2">
                    <Select
                      id="offer-technique"
                      value={normalizePriceTechnique(form.priceTechnique)}
                      onChange={(e) => set('priceTechnique', e.target.value)}
                    >
                      <option value={SMART_TECHNIQUE}>Smart showroom price (recommended)</option>
                      <option value={EXACT_TECHNIQUE}>Exact percent</option>
                    </Select>
                    <p className="mt-1 text-xs text-muted">
                      Smart keeps at least this percent off, then steps the price down to a …999 or …499 sticker. Exact uses the percent with no extra rounding.
                    </p>
                  </Field>
                ) : null}
                {isSale ? (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-semibold text-heading">Scooters on this sale</p>
                    <p className="mt-1 text-xs text-muted">
                      Tick models, or apply a group. Unticked models stay at list price. The model that saves the most rupees is marked Best deal automatically.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ['all', 'All models'],
                        ['stock', 'In stock'],
                        ['budget', 'Budget'],
                        ['premium', 'Premium'],
                      ].map(([mode, label]) => (
                        <button
                          key={mode}
                          type="button"
                          className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-heading ring-1 ring-line hover:bg-red-50"
                          onClick={() => {
                            const ids = catalog
                              .filter((scooter) => {
                                if (mode === 'stock') return scooter.stock !== 'out_of_stock';
                                if (mode === 'budget') return scooter.isBudget;
                                if (mode === 'premium') return scooter.isPremium;
                                return true;
                              })
                              .map((scooter) => scooter.id);
                            set('scooterIds', ids);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="rounded-full px-3 py-1.5 text-xs font-bold text-muted hover:text-heading"
                        onClick={() => set('scooterIds', [])}
                      >
                        Clear
                      </button>
                    </div>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {catalog.map((scooter) => {
                        const checked = (form.scooterIds || []).includes(scooter.id);
                        const list = getStartingPrice(scooter);
                        const preview = salePercent
                          ? quotePrice(list, {
                              kind: SCOOTER_SALE_KIND,
                              active: true,
                              discountPercent: salePercent,
                              priceTechnique: form.priceTechnique,
                              scooterIds: [scooter.id],
                            })
                          : null;
                        const salePrice = preview?.onSale ? preview.sale : list;
                        const clash = otherSales.some((offer) => (offer.scooterIds || []).includes(scooter.id));
                        return (
                          <li key={scooter.id}>
                            <label className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3 ring-1 ${checked ? 'bg-red-50 ring-red-200' : 'bg-surface ring-line'}`}>
                              <input
                                type="checkbox"
                                className="mt-1 h-5 w-5 rounded accent-red-600"
                                checked={checked}
                                onChange={() => {
                                  setForm((f) => {
                                    const ids = f.scooterIds || [];
                                    return {
                                      ...f,
                                      scooterIds: ids.includes(scooter.id)
                                        ? ids.filter((id) => id !== scooter.id)
                                        : [...ids, scooter.id],
                                    };
                                  });
                                }}
                              />
                              <span className="min-w-0">
                                <span className="block font-semibold text-heading">{scooter.name}</span>
                                {salePercent ? (
                                  <span className="mt-0.5 block text-xs text-muted line-through">{formatINR(list)}</span>
                                ) : (
                                  <span className="mt-0.5 block text-xs text-muted">{formatINR(list)}</span>
                                )}
                                <span className="block font-display text-lg font-extrabold text-red-600">
                                  {salePercent ? formatINR(salePrice) : 'Enter a percent'}
                                </span>
                                {preview?.onSale && preview.extraSaved > 0 ? (
                                  <span className="mt-0.5 block text-[11px] font-medium text-emerald-700">
                                    Smart sticker, {formatINR(preview.extraSaved)} under the exact {salePercent}%
                                  </span>
                                ) : null}
                                {clash && checked ? (
                                  <span className="mt-1 block text-[11px] font-medium text-amber-700">
                                    Also on another active sale — the bigger discount is shown.
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    {!catalog.length ? (
                      <p className="mt-2 text-sm text-muted">No scooters in the catalog yet.</p>
                    ) : null}
                  </div>
                ) : !isFree ? (
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
                    placeholder={isSale ? 'e.g. 10% off selected models this week. Confirm the sale price at the showroom.' : isFree ? 'e.g. Free branded helmet with every scooter purchase this month.' : 'Short line shown under the offer on the website.'}
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
                Show on homepage hero{isSale ? ' as a big Sale badge' : ''}
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
              Select an offer to edit, or create a new one. Use “Sale — % off selected scooters” to mark models and show their sale price.
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
