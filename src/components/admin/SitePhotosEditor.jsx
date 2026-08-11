import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Save, Trash2, Copy, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { uploadSitePhotoFile } from '@/features/site/sitePhotosService';
import { getScooters } from '@/features/scooters/scooterService';
import { useAsync } from '@/hooks/useAsync';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SiteImage } from '@/components/common/SiteImage';

function SlotEditor({ title, hint, slot, onChange, folder, maxW, maxH }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file.', 'error');
      return;
    }
    const maxMb = folder === 'hero' ? 20 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      toast(`Max ${maxMb} MB per image.`, 'error');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadSitePhotoFile(file, folder);
      onChange({ ...slot, url });
      toast('Image uploaded — click Save Photos to apply.', 'success');
    } catch (err) {
      toast(err?.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-line sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-heading">{title}</h4>
          <p className="mt-0.5 text-xs text-muted">{hint}</p>
        </div>
        {slot?.url ? (
          <button
            type="button"
            onClick={() => onChange({ ...slot, url: null })}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
        <SiteImage
          src={slot?.url}
          alt={slot?.alt}
          width={maxW}
          height={maxH}
          className="w-full max-w-xs rounded-lg"
          placeholderLabel="Upload Photo"
        />
        <div className="flex-1 space-y-3">
          <label className="block text-xs font-semibold text-heading">
            Alt text
            <input
              type="text"
              value={slot?.alt || ''}
              onChange={(e) => onChange({ ...slot, alt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-heading outline-none focus:ring-2 focus:ring-brand-400/30 sm:text-sm"
            />
          </label>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={uploading ? Loader2 : ImagePlus}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : slot?.url ? 'Replace photo' : 'Upload photo'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SitePhotosEditor() {
  const { photos, savePhotos } = useSitePhotos();
  const { data: scooters } = useAsync(() => getScooters(), []);
  const [draft, setDraft] = useState(() => structuredClone(photos));
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDraft(structuredClone(photos));
  }, [photos]);

  useEffect(() => {
    if (!scooters?.length) return;
    setDraft((d) => {
      const models = { ...d.models };
      for (const s of scooters) {
        if (!models[s.id]) {
          models[s.id] = {
            url: null,
            alt: `${s.name} electric scooter at Biswajit Power Hub Berhampore`,
          };
        }
      }
      return { ...d, models };
    });
  }, [scooters]);

  const onSave = async () => {
    setSaving(true);
    try {
      await savePhotos(draft);
      toast('Site photos saved.', 'success');
    } catch (err) {
      toast(err?.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const modelEntries = (() => {
    const fromCatalog = (scooters || []).map((s) => [
      s.id,
      draft.models?.[s.id] || { url: null, alt: s.name },
    ]);
    if (fromCatalog.length) return fromCatalog;
    return Object.entries(draft.models || {});
  })();

  return (
    <section className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-heading">Site Photos</h3>
          <p className="mt-1 text-sm text-muted">
            Hero, gallery, model cards (from inventory), and about page.
            {!isSupabaseConfigured ? ' Demo mode stores local previews until Supabase is connected.' : ''}
          </p>
        </div>
        <Button type="button" variant="primary" size="sm" icon={Save} loading={saving} onClick={onSave}>
          Save Photos
        </Button>
      </div>

      <SlotEditor
        title="Homepage hero"
        hint="Recommended 1200×600"
        slot={draft.hero}
        folder="hero"
        maxW={1200}
        maxH={600}
        onChange={(hero) => setDraft((d) => ({ ...d, hero }))}
      />

      {draft.gallery.map((g, i) => (
        <SlotEditor
          key={`gallery-${i}`}
          title={`Showroom gallery ${i + 1}`}
          hint="Recommended 800×600"
          slot={g}
          folder={`gallery/${i + 1}`}
          maxW={800}
          maxH={600}
          onChange={(next) =>
            setDraft((d) => {
              const gallery = [...d.gallery];
              gallery[i] = next;
              return { ...d, gallery };
            })
          }
        />
      ))}

      {modelEntries.map(([id, slot]) => {
        const name = scooters?.find((s) => s.id === id)?.name || id;
        return (
          <SlotEditor
            key={id}
            title={`Model — ${name}`}
            hint="Recommended 600×400 · shown on Explore Our Range"
            slot={slot || { url: null, alt: '' }}
            folder={`model/${id}`}
            maxW={600}
            maxH={400}
            onChange={(next) =>
              setDraft((d) => ({
                ...d,
                models: { ...d.models, [id]: next },
              }))
            }
          />
        );
      })}

      <SlotEditor
        title="About page team photo"
        hint="Recommended 800×600"
        slot={draft.about}
        folder="about"
        maxW={800}
        maxH={600}
        onChange={(about) => setDraft((d) => ({ ...d, about }))}
      />
    </section>
  );
}

const GBP_TEMPLATES = [
  '🛵 [Model] back in stock — test ride today at Chunakhali, Berhampore!',
  '🔋 Battery upgrade offer this week at Biswajit Power Hub, Murshidabad!',
  '⭐ Thank you [Customer] for choosing BPH — see you on the road!',
];

export function GbpPostGenerator() {
  const [text, setText] = useState(GBP_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.slice(0, 1500));
      setCopied(true);
      toast('Copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy.', 'error');
    }
  };

  return (
    <section className="mt-10 max-w-3xl rounded-xl bg-surface p-4 ring-1 ring-line sm:p-6">
      <h3 className="font-display text-lg font-bold text-heading">GBP Post Generator</h3>
      <p className="mt-1 text-sm text-muted">
        Draft a Google Business Profile post (max 1500 characters), then paste into GBP.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {GBP_TEMPLATES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setText(t)}
            className="rounded-lg bg-[#f5f5f5] px-3 py-2 text-left text-xs font-medium text-heading ring-1 ring-line hover:bg-white"
          >
            {t}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 1500))}
        rows={5}
        className="mt-4 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-heading outline-none focus:ring-2 focus:ring-brand-400/30 sm:text-sm"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`text-xs font-semibold ${1500 - text.length < 100 ? 'text-red-600' : 'text-muted'}`}>
          {text.length} / 1500
        </span>
        <Button type="button" variant="primary" size="sm" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? 'Copied' : 'Copy to clipboard'}
        </Button>
      </div>
    </section>
  );
}
