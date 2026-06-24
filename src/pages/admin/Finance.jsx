import { useEffect, useRef, useState } from 'react';
import { Save, Tag, ImagePlus, X, Loader2 } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Field, Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getFinanceSettings, saveFinanceSettings, uploadHeroImage } from '@/features/finance/financeService';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Finance() {
  const { toast } = useToast();
  const { data, loading } = useAsync(() => getFinanceSettings(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroInputRef = useRef(null);

  useEffect(() => {
    if (data) setForm({ ...data, tenureText: data.tenureOptions.join(', ') });
  }, [data]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast('Connect Supabase to save finance settings.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveFinanceSettings({
        ...form,
        interestRate: Number(form.interestRate),
        downPaymentPct: Number(form.downPaymentPct),
        defaultTenure: Number(form.defaultTenure),
        minDownPaymentPct: Number(form.minDownPaymentPct),
        maxDownPaymentPct: Number(form.maxDownPaymentPct),
        tenureOptions: form.tenureText.split(',').map((t) => Number(t.trim())).filter(Boolean),
        petrolPricePerLitre: Number(form.petrolPricePerLitre),
        petrolMileageKmPerLitre: Number(form.petrolMileageKmPerLitre),
      });
      toast('Finance settings saved.', 'success');
    } catch (err) {
      toast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onHeroFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Please select an image file.', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { toast('Max 10 MB per image.', 'error'); return; }
    setHeroUploading(true);
    try {
      const url = await uploadHeroImage(file);
      set('heroImageUrl', url);
      toast('Hero image uploaded — save settings to apply.', 'success');
    } catch {
      toast('Upload failed.', 'error');
    } finally {
      setHeroUploading(false);
      if (heroInputRef.current) heroInputRef.current.value = '';
    }
  };

  if (loading || !form) {
    return (
      <>
        <AdminHeader title="Finance Settings" />
        <Skeleton className="h-96 max-w-2xl" />
      </>
    );
  }

  return (
    <>
      <SEO title="Finance Settings" noindex />
      <AdminHeader title="Finance Settings" subtitle="EMI calculator defaults and EV simulator petrol comparison." />

      {!isSupabaseConfigured && (
        <div className="mb-5 max-w-2xl rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — changes won't persist. Connect Supabase to save.
        </div>
      )}

      <form onSubmit={onSave} className="max-w-2xl rounded-2xl bg-surface p-6 ring-1 ring-line shadow-soft sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Default interest rate (% p.a.)">
            <Input type="number" step="0.5" value={form.interestRate} onChange={(e) => set('interestRate', e.target.value)} />
          </Field>
          <Field label="Default down payment (%)">
            <Input type="number" value={form.downPaymentPct} onChange={(e) => set('downPaymentPct', e.target.value)} />
          </Field>
          <Field label="Min down payment (%)">
            <Input type="number" value={form.minDownPaymentPct} onChange={(e) => set('minDownPaymentPct', e.target.value)} />
          </Field>
          <Field label="Max down payment (%)">
            <Input type="number" value={form.maxDownPaymentPct} onChange={(e) => set('maxDownPaymentPct', e.target.value)} />
          </Field>
          <Field label="Default tenure (months)">
            <Input type="number" value={form.defaultTenure} onChange={(e) => set('defaultTenure', e.target.value)} />
          </Field>
          <Field label="Tenure options" hint="Comma-separated, in months">
            <Input value={form.tenureText} onChange={(e) => set('tenureText', e.target.value)} />
          </Field>
        </div>

        <div className="mt-6 rounded-xl bg-surface-alt p-5">
          <h3 className="text-sm font-bold text-heading">EV Simulator — petrol comparison</h3>
          <p className="mt-1 text-xs text-muted">Used to calculate savings vs petrol on the homepage simulator.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Petrol price (₹ per litre)" hint="Current local petrol rate">
              <Input type="number" step="0.5" value={form.petrolPricePerLitre} onChange={(e) => set('petrolPricePerLitre', e.target.value)} />
            </Field>
            <Field label="Petrol mileage (km per litre)" hint="Typical petrol scooter efficiency">
              <Input type="number" step="1" value={form.petrolMileageKmPerLitre} onChange={(e) => set('petrolMileageKmPerLitre', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-surface-alt p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
            <Tag className="h-4 w-4 text-brand-500" /> Promotional offer
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-body">
              <input type="checkbox" checked={form.promo?.active || false} onChange={(e) => set('promo', { ...form.promo, active: e.target.checked })} className="h-5 w-5 rounded accent-brand-500" />
              Active
            </label>
            <Input placeholder="e.g. Festive offer: ₹5,000 off!" value={form.promo?.label || ''} onChange={(e) => set('promo', { ...form.promo, label: e.target.value })} />
          </div>
        </div>

        {/* Hero image */}
        <div className="mt-6 rounded-xl bg-surface-alt p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
            <ImagePlus className="h-4 w-4 text-brand-500" /> Homepage Hero Image
          </h3>
          <p className="mt-1 text-xs text-muted">
            Replaces the placeholder scooter illustration on the homepage. JPG / PNG / WebP, max 10 MB.
          </p>
          <div className="mt-4 flex flex-wrap items-start gap-4">
            {form.heroImageUrl ? (
              <div className="relative">
                <img
                  src={form.heroImageUrl}
                  alt="Hero preview"
                  className="h-28 w-44 rounded-xl object-cover ring-2 ring-brand-200 shadow-soft"
                />
                <button
                  type="button"
                  onClick={() => set('heroImageUrl', null)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                  title="Remove hero image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex h-28 w-44 items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface text-xs text-muted">
                No image set
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={heroUploading ? Loader2 : ImagePlus}
                onClick={() => heroInputRef.current?.click()}
                disabled={heroUploading}
              >
                {heroUploading ? 'Uploading…' : form.heroImageUrl ? 'Change Image' : 'Upload Image'}
              </Button>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={onHeroFile}
              />
              <p className="text-[11px] text-muted">Click Save Settings below to apply.</p>
            </div>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving} className="mt-6">
          Save Settings
        </Button>
      </form>
    </>
  );
}
