import { useState } from 'react';
import { Field, Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { slugify } from '@/lib/utils';

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
  description: '', features: [], benefits: [], images: [],
};

function listToText(arr) {
  return (arr || []).join('\n');
}
function textToList(text) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

export function ScooterForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      id: form.id || slugify(form.name),
      price: Number(form.price),
      range: Number(form.range),
      topSpeed: Number(form.topSpeed),
      realRangeFactor: Number(form.realRangeFactor),
    };
    onSubmit(payload);
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Colours" hint="One per line">
          <Textarea rows={3} value={listToText(form.colors)} onChange={(e) => set('colors', textToList(e.target.value))} />
        </Field>
        <Field label="Image URLs" hint="One per line">
          <Textarea rows={3} value={listToText(form.images)} onChange={(e) => set('images', textToList(e.target.value))} />
        </Field>
        <Field label="Features" hint="One per line">
          <Textarea rows={4} value={listToText(form.features)} onChange={(e) => set('features', textToList(e.target.value))} />
        </Field>
        <Field label="Benefits" hint="One per line">
          <Textarea rows={4} value={listToText(form.benefits)} onChange={(e) => set('benefits', textToList(e.target.value))} />
        </Field>
      </div>

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
