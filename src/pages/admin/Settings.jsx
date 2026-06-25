import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Clock, Phone, MapPin, RotateCcw } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Field, Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { useSite } from '@/context/SiteSettingsContext';
import {
  applyDefaultHoursToAll,
  getSiteSettings,
  resetHoursToInitial,
} from '@/features/site/siteService';
import { formatHoursGroups } from '@/features/site/siteHours';
import { DAY_KEYS, DAY_LABELS, DEFAULT_DAY_HOURS } from '@/config/site';
import { isValidPhone } from '@/features/leads/validation';

function HoursPreview({ hours }) {
  const groups = formatHoursGroups(hours);
  return (
    <ul className="mt-2 space-y-1 text-sm text-muted">
      {groups.map((g) => (
        <li key={g.label}>
          <span className="font-medium text-heading">{g.label}:</span> {g.text}
        </li>
      ))}
    </ul>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { saveSiteSettings } = useSite();
  const { data, loading } = useAsync(() => getSiteSettings(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        phones: [...data.phones],
        whatsapp: data.whatsapp,
        address: { ...data.address },
        maps: { ...data.maps },
        hours: JSON.parse(JSON.stringify(data.hoursPerDay)),
      });
    }
  }, [data]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setAddress = (k, v) => setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));
  const setMaps = (k, v) => setForm((f) => ({ ...f, maps: { ...f.maps, [k]: v } }));

  const setPhone = (i, v) => setForm((f) => {
    const phones = [...f.phones];
    phones[i] = v.replace(/\D/g, '').slice(0, 10);
    return { ...f, phones };
  });

  const addPhone = () => setForm((f) => ({ ...f, phones: [...f.phones, ''] }));
  const removePhone = (i) => setForm((f) => ({
    ...f,
    phones: f.phones.filter((_, idx) => idx !== i),
  }));

  const setDayHours = (day, key, value) => setForm((f) => ({
    ...f,
    hours: {
      ...f.hours,
      [day]: { ...f.hours[day], [key]: value },
    },
  }));

  const onSave = async (e) => {
    e.preventDefault();
    const phones = form.phones.map((p) => p.replace(/\D/g, '')).filter(Boolean);
    if (!phones.length) {
      toast('Add at least one phone number.', 'error');
      return;
    }
    for (const p of phones) {
      if (!isValidPhone(p)) {
        toast('Enter valid 10-digit mobile numbers.', 'error');
        return;
      }
    }
    const wa = form.whatsapp.replace(/\D/g, '');
    if (wa && wa.length < 10) {
      toast('WhatsApp number looks invalid.', 'error');
      return;
    }
    if (!form.address.line?.trim()) {
      toast('Address line is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveSiteSettings({
        phones,
        whatsapp: form.whatsapp.replace(/\D/g, '') || `91${phones[0]}`,
        address: form.address,
        maps: form.maps,
        hours: form.hours,
      });
      toast('Site settings saved.', 'success');
    } catch (err) {
      toast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <>
        <AdminHeader title="Site Settings" />
        <Skeleton className="h-96 max-w-2xl" />
      </>
    );
  }

  return (
    <>
      <SEO title="Site Settings" noindex />
      <AdminHeader
        title="Site Settings"
        subtitle="Contact numbers, address, and opening hours shown across the website."
      />

      {!isSupabaseConfigured && (
        <div className="mb-5 max-w-2xl rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — settings save to this browser only. Connect Supabase to sync everywhere.
        </div>
      )}

      <form onSubmit={onSave} className="max-w-2xl space-y-4 sm:space-y-6">
        {/* Contact */}
        <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6 lg:p-8">
          <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
            <Phone className="h-4 w-4 text-brand-500" /> Contact numbers
          </h3>
          <div className="mt-4 space-y-3">
            {form.phones.map((phone, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field label={i === 0 ? 'Phone numbers' : undefined} className="flex-1">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(i, e.target.value)}
                    placeholder="10-digit mobile"
                  />
                </Field>
                {form.phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(i)}
                    className="mb-0.5 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                    aria-label="Remove phone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addPhone}>
              Add number
            </Button>
          </div>
          <Field label="WhatsApp number" hint="Country code + number, no + (e.g. 919635505436)" className="mt-4">
            <Input
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value.replace(/\D/g, ''))}
              placeholder="919635505436"
            />
          </Field>
        </section>

        {/* Address */}
        <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6 lg:p-8">
          <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
            <MapPin className="h-4 w-4 text-brand-500" /> Address
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Street / locality" className="sm:col-span-2">
              <Input
                value={form.address.line}
                onChange={(e) => setAddress('line', e.target.value)}
                placeholder="Nimtala, Chunakhali, Berhampore"
              />
            </Field>
            <Field label="City">
              <Input value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} />
            </Field>
            <Field label="State">
              <Input value={form.address.state} onChange={(e) => setAddress('state', e.target.value)} />
            </Field>
            <Field label="PIN code">
              <Input value={form.address.pincode} onChange={(e) => setAddress('pincode', e.target.value)} />
            </Field>
            <Field label="Country">
              <Input value={form.address.country} onChange={(e) => setAddress('country', e.target.value)} />
            </Field>
            <Field label="Google Maps link" className="sm:col-span-2">
              <Input value={form.maps.link} onChange={(e) => setMaps('link', e.target.value)} />
            </Field>
            <Field label="Map embed URL" hint="iframe src for contact page" className="sm:col-span-2">
              <Input value={form.maps.embed} onChange={(e) => setMaps('embed', e.target.value)} />
            </Field>
          </div>
        </section>

        {/* Hours */}
        <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
                <Clock className="h-4 w-4 text-brand-500" /> Opening hours
              </h3>
              <p className="mt-1 text-xs text-muted">
                Default for new days: 9:00 AM – 8:30 PM. Current showroom: Mon–Sat 10–8, Sun 11–6.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={() => set('hours', applyDefaultHoursToAll(form.hours))}
              >
                All 9 AM – 8:30 PM
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => set('hours', resetHoursToInitial())}
              >
                Reset to showroom
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
            {DAY_KEYS.map((day) => {
              const d = form.hours[day] || DEFAULT_DAY_HOURS;
              return (
                <div
                  key={day}
                  className="flex flex-col gap-2 rounded-xl bg-surface-alt px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-4 sm:py-3"
                >
                  <span className="text-sm font-semibold text-heading sm:w-20">{DAY_LABELS[day]}</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={d.closed}
                      onChange={(e) => setDayHours(day, 'closed', e.target.checked)}
                      className="rounded border-line text-brand-600"
                    />
                    Closed
                  </label>
                  {!d.closed && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="time"
                        value={d.open}
                        onChange={(e) => setDayHours(day, 'open', e.target.value)}
                        className="w-28 sm:w-32"
                      />
                      <span className="text-muted">to</span>
                      <Input
                        type="time"
                        value={d.close}
                        onChange={(e) => setDayHours(day, 'close', e.target.value)}
                        className="w-28 sm:w-32"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-line bg-surface-alt/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Preview on site</p>
            <HoursPreview hours={form.hours} />
          </div>
        </section>

        <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving} className="w-full sm:w-auto">
          Save Settings
        </Button>
      </form>
    </>
  );
}
