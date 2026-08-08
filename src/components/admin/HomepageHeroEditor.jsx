import { useEffect, useRef, useState } from 'react';
import { Save, ImagePlus, X, Loader2, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getFinanceSettings, saveHeroImage, uploadHeroImage } from '@/features/finance/financeService';
import { useFinance } from '@/context/FinanceSettingsContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export function HomepageHeroEditor() {
  const { toast } = useToast();
  const { refresh: refreshFinanceSettings } = useFinance();
  const { data, loading } = useAsync(() => getFinanceSettings(), []);
  const [heroImageUrl, setHeroImageUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (data) setHeroImageUrl(data.heroImageUrl || null);
  }, [data]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Max 10 MB per image.', 'error');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadHeroImage(file);
      setHeroImageUrl(url);
      toast('Image ready — click Save to apply on the homepage.', 'success');
    } catch {
      toast('Upload failed.', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onSave = async () => {
    if (!isSupabaseConfigured) {
      toast('Connect Supabase to save the homepage hero image.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveHeroImage(heroImageUrl);
      await refreshFinanceSettings();
      toast('Homepage hero image saved.', 'success');
    } catch (err) {
      toast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-56 max-w-2xl" />;
  }

  return (
    <section className="max-w-2xl rounded-xl bg-surface p-4 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-6 lg:p-8">
      <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
        <Home className="h-4 w-4 text-brand-500" /> Homepage Hero Image
      </h3>
      <p className="mt-1 text-xs text-muted sm:text-sm">
        Replaces the placeholder scooter illustration at the top of your homepage. JPG, PNG, or WebP — max 10 MB.
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        {heroImageUrl ? (
          <div className="relative shrink-0">
            <img
              src={heroImageUrl}
              alt="Homepage hero preview"
              className="h-32 w-full rounded-xl object-cover ring-2 ring-brand-200 shadow-soft sm:h-36 sm:w-56"
            />
            <button
              type="button"
              onClick={() => setHeroImageUrl(null)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
              title="Remove hero image"
              aria-label="Remove hero image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-alt text-xs text-muted sm:h-36 sm:w-56">
            No image set
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={uploading ? Loader2 : ImagePlus}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? 'Uploading…' : heroImageUrl ? 'Change image' : 'Choose image'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onFile}
          />
          <p className="text-xs text-muted">
            Pick an image, then save. Visitors see it on the homepage hero section.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Save}
            loading={saving}
            onClick={onSave}
            disabled={!isSupabaseConfigured}
            className="mt-1 w-full sm:w-auto"
          >
            Save hero image
          </Button>
        </div>
      </div>
    </section>
  );
}
