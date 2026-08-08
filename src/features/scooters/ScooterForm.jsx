import { useState } from 'react';
import { Field, Input, Textarea, Select, Label } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { slugify } from '@/lib/utils';
import { ScooterImageUpload } from './ScooterImageUpload';

const HUES = ['blue', 'teal', 'sky', 'green', 'indigo', 'cyan'];
const STOCKS = [
  { v: 'in_stock', l: 'In Stock' },
  { v: 'low_stock', l: 'Few Left' },
  { v: 'out_of_stock', l: 'Out of Stock' },
];

const EMPTY = {
  id: '', name: '', brand: 'PowerHub', tagline: '', price: 0, hue: 'blue',
  batteryType: '', batteryCapacity: '', range: 0, realRangeFactor: 0.83, topSpeed: 25,
  chargingTime: '', warranty: '', motor: '', weight: '', loadCapacity: '',
  colors: [], noLicence: true, noRegistration: true, stock: 'in_stock', featured: false,
  description: '', features: [], benefits: [], images: [], variants: [],
};

const EMPTY_VARIANT = {
  id: '', name: '', price: 0, batteryType: '', batteryCapacity: '', batteryWarranty: '', range: 0,
};

function listToText(arr) {
  return (arr || []).join('\n');
}
function textToList(text) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

export function ScooterForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [formError, setFormError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const variants = (form.variants || []).map((v, i) => ({
      ...v,
      id: v.id || slugify(v.name || `variant-${i + 1}`),
      price: Number(v.price),
      range: Number(v.range),
    }));
    const variantPrices = variants
      .map((v) => v.price)
      .filter((p) => Number.isFinite(p) && p > 0);
    let price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      price = variantPrices.length ? Math.min(...variantPrices) : NaN;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Enter a valid price or add at least one variant with a price.');
      return;
    }
    const payload = {
      ...form,
      id: form.id || slugify(form.name),
      price,
      range: Number(form.range),
      topSpeed: Number(form.topSpeed),
      realRangeFactor: Number(form.realRangeFactor),
      variants,
    };
    onSubmit(payload);
  };

  const setVariant = (index, key, value) => {
    setForm((f) => {
      const variants = [...(f.variants || [])];
      variants[index] = { ...variants[index], [key]: value };
      return { ...f, variants };
    });
  };

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...(f.variants || []), { ...EMPTY_VARIANT }] }));
  };

  const removeVariant = (index) => {
    setForm((f) => ({
      ...f,
      variants: (f.variants || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Brand">
          <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} />
        </Field>
      </div>

      <Field label="Tagline">
        <Input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (₹)" required>
          <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required />
        </Field>
        <Field label="Range (km)">
          <Input type="number" value={form.range} onChange={(e) => set('range', e.target.value)} />
        </Field>
        <Field label="Top speed (km/h)">
          <Input type="number" value={form.topSpeed} onChange={(e) => set('topSpeed', e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Battery type">
          <Input value={form.batteryType} onChange={(e) => set('batteryType', e.target.value)} placeholder="Lithium-ion (LFP)" />
        </Field>
        <Field label="Battery capacity">
          <Input value={form.batteryCapacity} onChange={(e) => set('batteryCapacity', e.target.value)} placeholder="2.0 kWh" />
        </Field>
        <Field label="Charging time">
          <Input value={form.chargingTime} onChange={(e) => set('chargingTime', e.target.value)} placeholder="4–5 hrs" />
        </Field>
        <Field label="Motor">
          <Input value={form.motor} onChange={(e) => set('motor', e.target.value)} placeholder="250W BLDC Hub Motor" />
        </Field>
        <Field label="Weight">
          <Input value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="72 kg" />
        </Field>
        <Field label="Load capacity">
          <Input value={form.loadCapacity} onChange={(e) => set('loadCapacity', e.target.value)} placeholder="150 kg" />
        </Field>
        <Field label="Warranty">
          <Input value={form.warranty} onChange={(e) => set('warranty', e.target.value)} placeholder="3 years / 30,000 km" />
        </Field>
        <Field label="Real-world range factor (0–1)">
          <Input type="number" step="0.01" value={form.realRangeFactor} onChange={(e) => set('realRangeFactor', e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Colour theme">
          <Select value={form.hue} onChange={(e) => set('hue', e.target.value)}>
            {HUES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Stock status">
          <Select value={form.stock} onChange={(e) => set('stock', e.target.value)}>
            {STOCKS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Featured">
          <Select value={form.featured ? 'yes' : 'no'} onChange={(e) => set('featured', e.target.value === 'yes')}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </Field>
      </div>

      <Field label="Description">
        <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Variants</Label>
          <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
            Add variant
          </Button>
        </div>
        {(form.variants || []).length === 0 ? (
          <p className="text-sm text-muted">No variants — price above is used as the listing price.</p>
        ) : (
          <div className="space-y-3">
            {(form.variants || []).map((variant, index) => (
              <div key={index} className="rounded-xl bg-surface-alt p-4 ring-1 ring-line">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-heading">Variant {index + 1}</p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name">
                    <Input value={variant.name} onChange={(e) => setVariant(index, 'name', e.target.value)} placeholder="Standard" />
                  </Field>
                  <Field label="Price (₹)">
                    <Input type="number" value={variant.price} onChange={(e) => setVariant(index, 'price', e.target.value)} />
                  </Field>
                  <Field label="Battery type">
                    <Input value={variant.batteryType} onChange={(e) => setVariant(index, 'batteryType', e.target.value)} />
                  </Field>
                  <Field label="Battery capacity">
                    <Input value={variant.batteryCapacity} onChange={(e) => setVariant(index, 'batteryCapacity', e.target.value)} />
                  </Field>
                  <Field label="Battery warranty">
                    <Input value={variant.batteryWarranty} onChange={(e) => setVariant(index, 'batteryWarranty', e.target.value)} placeholder="6 months" />
                  </Field>
                  <Field label="Range (km)">
                    <Input type="number" value={variant.range} onChange={(e) => setVariant(index, 'range', e.target.value)} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Colours" hint="One per line">
          <Textarea rows={3} value={listToText(form.colors)} onChange={(e) => set('colors', textToList(e.target.value))} />
        </Field>
        <div>
          <Label>Photos</Label>
          <div className="mt-1.5">
            <ScooterImageUpload
              images={form.images}
              onChange={(urls) => set('images', urls)}
              scooterId={form.id}
            />
          </div>
        </div>
        <Field label="Features" hint="One per line">
          <Textarea rows={4} value={listToText(form.features)} onChange={(e) => set('features', textToList(e.target.value))} />
        </Field>
        <Field label="Benefits" hint="One per line">
          <Textarea rows={4} value={listToText(form.benefits)} onChange={(e) => set('benefits', textToList(e.target.value))} />
        </Field>
      </div>

      {formError && (
        <p className="text-sm text-red-600" role="alert">{formError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving} fullWidth>
          Save Scooter
        </Button>
      </div>
    </form>
  );
}
