import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Save, X } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Field, Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { deleteOffer, getAllOffers, saveOffer } from '@/features/offers/offerService';
import { isSupabaseConfigured } from '@/lib/supabase';

const EMPTY = {
  title: '',
  discountText: '',
  promoCode: '',
  description: '',
  active: true,
  sortOrder: 0,
};

export default function Offers() {
  const { toast } = useToast();
  const { data, loading, refetch } = useAsync(() => getAllOffers(), []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing === 'new') setForm(EMPTY);
    else if (editing) setForm({ ...editing });
  }, [editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.discountText.trim()) {
      toast('Title and discount text are required.', 'error');
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

  const onDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await deleteOffer(id);
      toast('Offer deleted.', 'success');
      if (editing?.id === id) setEditing(null);
      refetch();
    } catch (err) {
      toast(err.message || 'Delete failed.', 'error');
    }
  };

  return (
    <>
      <SEO title="Promotional Offers" noindex />
      <AdminHeader
        title="Promotional Offers"
        subtitle="Create offers shown prominently on the website homepage."
        action={
          <Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>
            New Offer
          </Button>
        }
      />

      {!isSupabaseConfigured && (
        <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — offers save to this browser only. Connect Supabase and run{' '}
          <code className="font-mono text-xs">add_promotional_offers.sql</code> for production.
        </div>
      )}

      {isSupabaseConfigured && (
        <div className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Run <code className="font-mono text-xs">supabase/migrations/add_promotional_offers.sql</code> in Supabase if the offers table is missing.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-64" />
          ) : !data?.length ? (
            <EmptyState
              icon={Tag}
              title="No offers yet"
              description="Create your first promotional offer to show on the homepage."
              action={<Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>Add Offer</Button>}
            />
          ) : (
            <ul className="space-y-3">
              {data.map((offer) => (
                <li
                  key={offer.id}
                  className="rounded-2xl bg-surface p-4 ring-1 ring-line shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display font-bold text-heading">{offer.title}</p>
                        <Badge tone={offer.active ? 'success' : 'neutral'}>
                          {offer.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-lg font-extrabold text-brand-700">{offer.discountText}</p>
                      {offer.promoCode && (
                        <p className="mt-1 font-mono text-xs text-muted">Code: {offer.promoCode}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(offer)}
                        className="rounded-lg p-2 text-muted transition hover:bg-brand-50 hover:text-brand-700"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!String(offer.id).startsWith('legacy') && (
                        <button
                          type="button"
                          onClick={() => onDelete(offer.id)}
                          className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3">
          {editing ? (
            <form onSubmit={onSave} className="rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-heading">
                  {editing === 'new' ? 'New offer' : 'Edit offer'}
                </h3>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-muted hover:bg-slate-50">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Offer title" htmlFor="offer-title" required className="sm:col-span-2">
                  <Input
                    id="offer-title"
                    placeholder="e.g. Festive Sale"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Discount text (big display)" htmlFor="offer-discount" required hint="Shown large on the website">
                  <Input
                    id="offer-discount"
                    placeholder="e.g. ₹3,000 off"
                    value={form.discountText}
                    onChange={(e) => set('discountText', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Promo code" htmlFor="offer-code" hint="Optional — e.g. BIDGDG">
                  <Input
                    id="offer-code"
                    placeholder="BIDGDG"
                    value={form.promoCode}
                    onChange={(e) => set('promoCode', e.target.value.toUpperCase())}
                    className="font-mono uppercase"
                  />
                </Field>
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
                    placeholder="Short line shown under the offer on the website."
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm font-medium text-body">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set('active', e.target.checked)}
                  className="h-5 w-5 rounded accent-brand-500"
                />
                Active — show on website
              </label>

              <div className="mt-6 flex gap-3">
                <Button type="submit" variant="primary" icon={Save} loading={saving}>
                  Save Offer
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center rounded-2xl border border-dashed border-line bg-surface-alt/50 p-8 text-center text-sm text-muted">
              Select an offer to edit, or create a new one.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
