import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Link2, Unlink, Upload } from 'lucide-react';
import { Field, Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AccessoryImageUpload } from '@/features/accessories/AccessoryImageUpload';
import { ACCESSORY_CATEGORIES } from '@/data/accessories';
import { formatINR } from '@/lib/utils';
import {
  effectiveName,
  effectivePrice,
  mapVyaparStock,
  suggestMapping,
} from './vyaparMapping';
import { STOCK_LABELS } from '@/data/scooters';

export function VyaparItemEditor({
  item: initial,
  scooters = [],
  accessories = [],
  onSave,
  onPublish,
  onLink,
  onUnlink,
  onPushOverrides,
  onCancel,
  saving,
}) {
  const suggested = useMemo(
    () => suggestMapping(initial.categoryVyapar, initial.name),
    [initial.categoryVyapar, initial.name],
  );

  const [form, setForm] = useState(() => ({
    ...initial,
    displayName: initial.displayName || '',
    description: initial.description || '',
    mappedCategory: initial.mappedCategory || suggested.mappedCategory || 'Other',
    mappedType: initial.mappedType || suggested.mappedType || 'accessory',
    mappedId: initial.mappedId || '',
    syncPrice: initial.syncPrice !== false,
    syncStock: initial.syncStock !== false,
    localImages: initial.localImages || [],
    notes: initial.notes || '',
  }));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setMappedType = (type) => {
    setForm((f) => ({
      ...f,
      mappedType: type,
      // Changing catalog type invalidates a selected link target
      mappedId: f.mappedType === type ? f.mappedId : '',
      mappedCategory:
        type === 'accessory'
          ? (f.mappedCategory || suggested.mappedCategory || 'Other')
          : f.mappedCategory,
    }));
  };

  const stockPreview = STOCK_LABELS[mapVyaparStock(form.quantity, form.stockFlag)] || STOCK_LABELS.in_stock;
  const linkTargets = form.mappedType === 'scooter' ? scooters : accessories;
  const linkedMissing = Boolean(
    initial.linked
    && initial.mappedId
    && !(form.mappedType === 'scooter' ? scooters : accessories).some((p) => p.id === initial.mappedId),
  );

  const handleSave = () => {
    // Link state is owned by Link / Unlink / Publish — Save only edits overrides.
    onSave({
      ...initial,
      displayName: form.displayName.trim(),
      description: form.description,
      mappedCategory: form.mappedCategory,
      // Allow type change only while unlinked
      mappedType: initial.linked ? initial.mappedType : form.mappedType,
      mappedId: initial.mappedId,
      linked: initial.linked,
      syncPrice: form.syncPrice,
      syncStock: form.syncStock,
      localImages: form.localImages,
      notes: form.notes,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface-alt/50 px-3 py-2.5 text-sm">
        <p className="font-semibold text-heading">{initial.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          Vyapar · {formatINR(effectivePrice(initial))} · qty {initial.quantity} {initial.unit}
          {initial.categoryVyapar?.length ? ` · ${initial.categoryVyapar.join(', ')}` : ''}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Site preview stock: <span className="font-semibold text-heading">{stockPreview.label}</span>
          {' · '}
          Display as <span className="font-semibold text-heading">{effectiveName(form)}</span>
        </p>
        {linkedMissing && (
          <p className="mt-2 text-xs font-medium text-red-600">
            Linked product is missing (deleted?). Unlink, then link or publish again.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display name (rename)" hint="Used on your site when you publish or push overrides. Sync never overwrites this later.">
          <Input
            value={form.displayName}
            onChange={(e) => set('displayName', e.target.value)}
            placeholder={initial.name}
          />
        </Field>
        <Field
          label="Catalog type"
          hint={initial.linked ? 'Unlink first to change type.' : undefined}
        >
          <Select
            value={form.mappedType || 'accessory'}
            onChange={(e) => setMappedType(e.target.value)}
            disabled={initial.linked}
          >
            <option value="scooter">Scooter (Inventory)</option>
            <option value="accessory">Spare / Part / Accessory</option>
          </Select>
        </Field>
      </div>

      {form.mappedType === 'accessory' && (
        <Field label="Category">
          <Select
            value={form.mappedCategory || 'Other'}
            onChange={(e) => set('mappedCategory', e.target.value)}
          >
            {ACCESSORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Description">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Optional site description"
        />
      </Field>

      <Field label="Photos" hint="Upload your own images. These are pushed to the linked product when you publish or “Push to site”.">
        <AccessoryImageUpload
          images={form.localImages}
          onChange={(imgs) => set('localImages', imgs)}
          accessoryId={`vyapar-${initial.id}`}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminToggle
          checked={form.syncPrice}
          onChange={(v) => set('syncPrice', v)}
          label="Sync price"
          hint="When master sync is on, update linked product price from Vyapar."
        />
        <AdminToggle
          checked={form.syncStock}
          onChange={(v) => set('syncStock', v)}
          label="Sync stock"
          hint="Map Vyapar qty → In Stock / Few Left / Out of Stock."
        />
      </div>

      <Field label="Notes (admin only)">
        <Input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal note" />
      </Field>

      <div className="rounded-xl border border-line p-3 space-y-3">
        <p className="text-sm font-semibold text-heading">Link to existing product</p>
        <p className="text-[11px] text-muted">
          Prefer linking when the item already lives under Inventory or Spare & Parts — full control stays on those pages.
        </p>
        <Select
          value={form.mappedId || ''}
          onChange={(e) => set('mappedId', e.target.value)}
          disabled={initial.linked && !linkedMissing}
        >
          <option value="">— Select product —</option>
          {linkTargets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({formatINR(p.price)})
            </option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={Link2}
            disabled={saving || !form.mappedId || (initial.linked && !linkedMissing)}
            onClick={() => onLink({
              ...initial,
              ...form,
              displayName: form.displayName.trim(),
            }, { type: form.mappedType, id: form.mappedId })}
          >
            Link selected
          </Button>
          {initial.linked && (
            <Button
              type="button"
              variant="ghost"
              icon={Unlink}
              disabled={saving}
              onClick={() => onUnlink({
                ...initial,
                ...form,
                displayName: form.displayName.trim(),
              })}
            >
              Unlink
            </Button>
          )}
          {initial.linked && initial.mappedId && !linkedMissing && (
            <Link
              to={initial.mappedType === 'scooter' ? '/admin/inventory' : '/admin/accessories'}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              Open local inventory <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {form.mappedType === 'scooter' && !initial.linked && (
        <p className="text-[11px] text-amber-700">
          Publishing creates a basic scooter row. Finish range, battery, variants, and photos under Inventory afterwards.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-between">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!initial.linked && (
            <Button
              type="button"
              variant="secondary"
              icon={Upload}
              disabled={saving}
              onClick={() => onPublish({
                ...initial,
                ...form,
                displayName: form.displayName.trim(),
              }, { type: form.mappedType })}
            >
              Publish as new
            </Button>
          )}
          {initial.linked && !linkedMissing && (
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => onPushOverrides({
                ...initial,
                ...form,
                displayName: form.displayName.trim(),
                mappedType: initial.mappedType,
                mappedId: initial.mappedId,
                linked: true,
              })}
            >
              Push name / photos / category
            </Button>
          )}
          <Button type="button" variant="primary" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
