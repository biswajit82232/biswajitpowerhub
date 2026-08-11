import { useEffect, useState } from 'react';
import {
  Save, Plus, Trash2, Clock, Phone, MapPin, RotateCcw, Sparkles, HelpCircle, LayoutGrid, Building2,
} from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminPushCard } from '@/components/admin/AdminPushCard';
import { ResetAllCountsButton } from '@/components/admin/ResetAllCountsButton';
import { Field, Input, Textarea } from '@/components/ui/Input';
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
import {
  DAY_KEYS,
  DAY_LABELS,
  DEFAULT_DAY_HOURS,
  DEFAULT_RANGE_TABS,
} from '@/config/site';
import { isValidPhone } from '@/features/leads/validation';
import { isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'brand', label: 'Brand & Social', icon: Building2 },
  { id: 'perks', label: 'Showroom Perks', icon: Sparkles },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'tabs', label: 'Explore Tabs', icon: LayoutGrid },
];

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

function formFromSite(data) {
  return {
    phones: [...(data.phones || [])],
    whatsapp: data.whatsapp || '',
    address: { ...data.address },
    maps: { ...data.maps },
    hours: JSON.parse(JSON.stringify(data.hoursPerDay || data.hours)),
    name: data.name || '',
    tagline: data.tagline || '',
    description: data.description || '',
    shortName: data.shortName || '',
    social: { instagram: '', facebook: '', youtube: '', ...data.social },
    geo: {
      latitude: data.geo?.latitude || '',
      longitude: data.geo?.longitude || '',
      placeId: data.maps?.placeId || data.geo?.placeId || '',
    },
    gbp: {
      ratingValue: data.gbp?.ratingValue ?? 3.9,
      reviewCount: data.gbp?.reviewCount ?? 17,
    },
    perks: (data.perks || []).map((p) => ({ ...p })),
    faqs: (data.faqs || []).map((f) => ({ ...f })),
    rangeTabs: (data.rangeTabs?.length ? data.rangeTabs : DEFAULT_RANGE_TABS).map((t) => ({ ...t })),
    batteryUpgradeTagline: data.batteryUpgradeTagline || '',
  };
}

export default function Settings() {
  const { toast } = useToast();
  const { saveSiteSettings } = useSite();
  const { data, loading } = useAsync(() => getSiteSettings(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState('contact');

  useEffect(() => {
    if (data) setForm(formFromSite(data));
  }, [data]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setAddress = (k, v) => setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));
  const setMaps = (k, v) => setForm((f) => ({ ...f, maps: { ...f.maps, [k]: v } }));
  const setSocial = (k, v) => setForm((f) => ({ ...f, social: { ...f.social, [k]: v } }));
  const setGeo = (k, v) => setForm((f) => ({ ...f, geo: { ...f.geo, [k]: v } }));
  const setGbp = (k, v) => setForm((f) => ({ ...f, gbp: { ...f.gbp, [k]: v } }));

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
        maps: {
          ...form.maps,
          placeId: form.geo.placeId || form.maps.placeId,
        },
        hours: form.hours,
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        shortName: form.shortName,
        social: form.social,
        geo: form.geo,
        gbp: {
          ratingValue: Number(form.gbp.ratingValue),
          reviewCount: Number(form.gbp.reviewCount),
          bestRating: 5,
          worstRating: 1,
        },
        perks: form.perks,
        faqs: form.faqs,
        rangeTabs: form.rangeTabs,
        batteryUpgradeTagline: form.batteryUpgradeTagline,
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
        <Skeleton className="h-96 max-w-3xl" />
      </>
    );
  }

  return (
    <>
      <AdminSEO title="Site Settings" />
      <AdminHeader
        title="Site Control"
        subtitle="Contact, branding, notifications, perks, FAQs, and Explore Range tabs."
      />

      <div className="mb-5 max-w-3xl space-y-3 sm:mb-6">
        <AdminPushCard />
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="font-display text-sm font-bold text-heading">Analytics reset</p>
          <p className="mt-1 text-xs text-muted">
            Clears visit / engagement event logs only. Leads and inbox rows are kept.
          </p>
          <div className="mt-3">
            <ResetAllCountsButton />
          </div>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-5 max-w-3xl rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — settings save to this browser only. Connect Supabase to sync everywhere.
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5 sm:mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPanel(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition sm:text-sm',
              panel === t.id
                ? 'bg-brand-gradient text-white shadow-soft'
                : 'bg-surface text-body ring-1 ring-line hover:bg-brand-50 hover:text-brand-700',
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSave} className="max-w-3xl space-y-4 pb-24 sm:space-y-6">
        {panel === 'contact' && (
          <>
            <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
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

            <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
                <MapPin className="h-4 w-4 text-brand-500" /> Address & maps
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Street / locality" className="sm:col-span-2">
                  <Input
                    value={form.address.line}
                    onChange={(e) => setAddress('line', e.target.value)}
                    placeholder="Chunakhali Bus Stand, Nimtala"
                  />
                </Field>
                <Field label="City">
                  <Input value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} />
                </Field>
                <Field label="District">
                  <Input value={form.address.district || ''} onChange={(e) => setAddress('district', e.target.value)} />
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
                <Field
                  label="Map embed URL"
                  hint="Share → Embed a map from Google Maps."
                  className="sm:col-span-2"
                >
                  <Input value={form.maps.embed} onChange={(e) => setMaps('embed', e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
                    <Clock className="h-4 w-4 text-brand-500" /> Opening hours
                  </h3>
                  <p className="mt-1 text-xs text-muted">Shown on Contact, Locate Us, and schema markup.</p>
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
          </>
        )}

        {panel === 'brand' && (
          <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
            <h3 className="text-sm font-bold text-heading">Brand & social</h3>
            <p className="mt-1 text-xs text-muted">Name and tagline appear in the hero and site chrome.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Business name">
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="Short name">
                <Input value={form.shortName} onChange={(e) => set('shortName', e.target.value)} />
              </Field>
              <Field label="Tagline" className="sm:col-span-2">
                <Input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
              </Field>
              <Field label="Site description (SEO)" className="sm:col-span-2">
                <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </Field>
              <Field label="Instagram URL">
                <Input value={form.social.instagram} onChange={(e) => setSocial('instagram', e.target.value)} />
              </Field>
              <Field label="Facebook URL">
                <Input value={form.social.facebook} onChange={(e) => setSocial('facebook', e.target.value)} />
              </Field>
              <Field label="YouTube URL" className="sm:col-span-2">
                <Input value={form.social.youtube || ''} onChange={(e) => setSocial('youtube', e.target.value)} />
              </Field>
              <Field label="Latitude">
                <Input value={form.geo.latitude} onChange={(e) => setGeo('latitude', e.target.value)} />
              </Field>
              <Field label="Longitude">
                <Input value={form.geo.longitude} onChange={(e) => setGeo('longitude', e.target.value)} />
              </Field>
              <Field label="Google Place ID" className="sm:col-span-2" hint="Used for review links and maps">
                <Input value={form.geo.placeId} onChange={(e) => setGeo('placeId', e.target.value)} />
              </Field>
              <Field label="GBP rating">
                <Input type="number" step="0.1" value={form.gbp.ratingValue} onChange={(e) => setGbp('ratingValue', e.target.value)} />
              </Field>
              <Field label="GBP review count">
                <Input type="number" value={form.gbp.reviewCount} onChange={(e) => setGbp('reviewCount', e.target.value)} />
              </Field>
            </div>
          </section>
        )}

        {panel === 'perks' && (
          <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-heading">Showroom perks</h3>
                <p className="mt-1 text-xs text-muted">Shown on Service, product pages, and ownership strips.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => set('perks', [...form.perks, { id: `perk-${Date.now()}`, title: '', desc: '', highlight: '' }])}
              >
                Add perk
              </Button>
            </div>
            <Field label="Battery upgrade tagline" className="mt-4">
              <Textarea
                rows={2}
                value={form.batteryUpgradeTagline}
                onChange={(e) => set('batteryUpgradeTagline', e.target.value)}
              />
            </Field>
            <div className="mt-4 space-y-3">
              {form.perks.map((perk, i) => (
                <div key={perk.id || i} className="rounded-xl bg-surface-alt p-3 ring-1 ring-line sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">Perk {i + 1}</p>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      onClick={() => set('perks', form.perks.filter((_, idx) => idx !== i))}
                      aria-label="Remove perk"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Title" className="sm:col-span-2">
                      <Input
                        value={perk.title}
                        onChange={(e) => {
                          const perks = [...form.perks];
                          perks[i] = { ...perk, title: e.target.value };
                          set('perks', perks);
                        }}
                      />
                    </Field>
                    <Field label="Highlight">
                      <Input
                        value={perk.highlight}
                        onChange={(e) => {
                          const perks = [...form.perks];
                          perks[i] = { ...perk, highlight: e.target.value };
                          set('perks', perks);
                        }}
                        placeholder="3×"
                      />
                    </Field>
                    <Field label="Description" className="sm:col-span-3">
                      <Textarea
                        rows={2}
                        value={perk.desc}
                        onChange={(e) => {
                          const perks = [...form.perks];
                          perks[i] = { ...perk, desc: e.target.value };
                          set('perks', perks);
                        }}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {panel === 'faqs' && (
          <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-heading">FAQs</h3>
                <p className="mt-1 text-xs text-muted">Used on the homepage and SEO landing FAQ blocks.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => set('faqs', [...form.faqs, { question: '', answer: '' }])}
              >
                Add FAQ
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {form.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl bg-surface-alt p-3 ring-1 ring-line sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">FAQ {i + 1}</p>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      onClick={() => set('faqs', form.faqs.filter((_, idx) => idx !== i))}
                      aria-label="Remove FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Field label="Question">
                    <Input
                      value={faq.question}
                      onChange={(e) => {
                        const faqs = [...form.faqs];
                        faqs[i] = { ...faq, question: e.target.value };
                        set('faqs', faqs);
                      }}
                    />
                  </Field>
                  <Field label="Answer" className="mt-3">
                    <Textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => {
                        const faqs = [...form.faqs];
                        faqs[i] = { ...faq, answer: e.target.value };
                        set('faqs', faqs);
                      }}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </section>
        )}

        {panel === 'tabs' && (
          <section className="rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6">
            <h3 className="text-sm font-bold text-heading">Explore Our Range tabs</h3>
            <p className="mt-1 text-xs text-muted">
              Turn tabs on/off and rename labels. Which scooters appear is set per model in Inventory (Budget / Premium / No Licence tags).
            </p>
            <div className="mt-4 space-y-3">
              {form.rangeTabs.map((tab, i) => (
                <div key={tab.id} className="flex flex-col gap-3 rounded-xl bg-surface-alt p-3 sm:flex-row sm:items-center sm:p-4">
                  <AdminToggle
                    className="sm:w-48"
                    checked={tab.enabled !== false}
                    onChange={(v) => {
                      const rangeTabs = [...form.rangeTabs];
                      rangeTabs[i] = { ...tab, enabled: v };
                      set('rangeTabs', rangeTabs);
                    }}
                    label={tab.id === 'all' ? 'ALL (required)' : tab.id}
                    hint={tab.id === 'all' ? 'Always available' : undefined}
                    disabled={tab.id === 'all'}
                  />
                  <Field label="Label on website" className="flex-1">
                    <Input
                      value={tab.label}
                      onChange={(e) => {
                        const rangeTabs = [...form.rangeTabs];
                        rangeTabs[i] = { ...tab, label: e.target.value };
                        set('rangeTabs', rangeTabs);
                      }}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 py-3 lg:left-64">
          <div className="mx-auto flex max-w-3xl justify-end">
            <Button type="submit" variant="primary" size="lg" icon={Save} loading={saving} className="w-full sm:w-auto">
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
