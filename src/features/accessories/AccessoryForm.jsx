import { useState } from 'react';
import { Field, Input, Textarea, Select, Label } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { slugify } from '@/lib/utils';
import { ACCESSORY_CATEGORIES } from '@/data/accessories';
import { AccessoryImageUpload } from './AccessoryImageUpload';

const HUES = ['blue', 'teal', 'sky', 'green', 'indigo', 'cyan'];
const STOCKS = [
  { v: 'in_stock', l: 'In Stock' },
  { v: 'low_stock', l: 'Few Left' },
  { v: 'out_of_stock', l: 'Out of Stock' },
];

const EMPTY = {
  id: '', name: '', category: 'Spare Parts', price: 0, hue: 'teal',
  description: '', compatibility: '', stock: 'in_stock', featured: false, images: [],
};

export function AccessoryForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      id: form.id || slugify(form.name),
      price: Number(form.price),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Category" required>
          <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {ACCESSORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (₹)" required>
          <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required />
        </Field>
        <Field label="Colour theme">
          <Select value={form.hue} onChange={(e) => set('hue', e.target.value)}>
            {HUES.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </Select>
        </Field>
        <Field label="Stock status">
          <Select value={form.stock} onChange={(e) => set('stock', e.target.value)}>
            {STOCKS.map((s) => (
              <option key={s.v} value={s.v}>{s.l}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Compatibility" hint="Which scooters or models this fits">
        <Input
          value={form.compatibility}
          onChange={(e) => set('compatibility', e.target.value)}
          placeholder="Universal, Spark Lite, etc."
        />
      </Field>

      <Field label="Description">
        <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Featured">
          <Select value={form.featured ? 'yes' : 'no'} onChange={(e) => set('featured', e.target.value === 'yes')}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </Field>
        <div>
          <Label>Photos</Label>
          <div className="mt-1.5">
            <AccessoryImageUpload
              images={form.images}
              onChange={(urls) => set('images', urls)}
              accessoryId={form.id}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving} fullWidth>
          Save Accessory
        </Button>
      </div>
    </form>
  );
}
