/**
 * Site photo slots — cloud-backed via site_settings.photos when Supabase is configured;
 * localStorage used as cache / demo fallback. Files upload to scooter-images storage.
 * Hero URL is also synced to finance_settings.hero_image_url when possible.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { saveHeroImage } from '@/features/finance/financeService';

const LOCAL_KEY = 'bph_site_photos_v1';
const SETTINGS_ROW_ID = 1;

export const DEFAULT_SITE_PHOTOS = {
  hero: {
    url: null,
    alt: 'Biswajit Power Hub electric scooter showroom at Chunakhali Bus Stand Berhampore Murshidabad',
  },
  gallery: [
    { url: null, alt: 'Biswajit Power Hub showroom floor in Berhampore' },
    { url: null, alt: 'Electric scooters on display at Chunakhali Bus Stand Murshidabad' },
    { url: null, alt: 'Customers test riding at Biswajit Power Hub Berhampore' },
  ],
  models: {
    activa: { url: null, alt: 'Activa electric scooter at Biswajit Power Hub Berhampore' },
    zoom: { url: null, alt: 'Zoom electric scooter at Biswajit Power Hub Berhampore' },
    'single-light': { url: null, alt: 'Single Light electric scooter at Biswajit Power Hub Berhampore' },
    'double-light': { url: null, alt: 'Double Light electric scooter at Biswajit Power Hub Berhampore' },
  },
  about: {
    url: null,
    alt: 'Biswajit Power Hub team at Chunakhali showroom Berhampore Murshidabad',
  },
};

function deepMergePhotos(raw) {
  const base = structuredClone(DEFAULT_SITE_PHOTOS);
  if (!raw || typeof raw !== 'object') return base;
  if (raw.hero) base.hero = { ...base.hero, ...raw.hero };
  if (Array.isArray(raw.gallery)) {
    base.gallery = base.gallery.map((g, i) => ({ ...g, ...(raw.gallery[i] || {}) }));
  }
  if (raw.models) {
    for (const id of Object.keys(base.models)) {
      if (raw.models[id]) base.models[id] = { ...base.models[id], ...raw.models[id] };
    }
  }
  if (raw.about) base.about = { ...base.about, ...raw.about };
  return base;
}

export function readSitePhotos() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return deepMergePhotos(raw ? JSON.parse(raw) : null);
  } catch {
    return structuredClone(DEFAULT_SITE_PHOTOS);
  }
}

export function writeSitePhotos(photos) {
  const next = deepMergePhotos(photos);
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch (_) {
    /* ignore */
  }
  return next;
}

/** Load photos: prefer Supabase site_settings.photos, fall back to local. */
export async function loadSitePhotos() {
  const local = readSitePhotos();
  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('photos')
      .eq('id', SETTINGS_ROW_ID)
      .maybeSingle();

    if (error) {
      // Column may not exist until migration is applied — keep local quietly.
      console.warn('[sitePhotos] cloud load failed:', error.message);
      return local;
    }

    if (data?.photos && typeof data.photos === 'object' && Object.keys(data.photos).length) {
      const merged = deepMergePhotos(data.photos);
      writeSitePhotos(merged);
      return merged;
    }
  } catch (e) {
    console.warn('[sitePhotos] cloud load exception:', e?.message || e);
  }

  return local;
}

/** Client-side resize via canvas; returns Blob (webp preferred). */
export async function resizeImageFile(file, maxW, maxH) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/webp', 0.85);
  });
  if (blob) return new File([blob], `${file.name.replace(/\.\w+$/, '')}.webp`, { type: 'image/webp' });
  return file;
}

export async function uploadSitePhotoFile(file, folder = 'site') {
  let uploadFile = file;
  try {
    if (folder === 'hero') uploadFile = await resizeImageFile(file, 1600, 900);
    else if (folder.startsWith('gallery') || folder === 'about')
      uploadFile = await resizeImageFile(file, 1200, 800);
    else if (folder.startsWith('model')) uploadFile = await resizeImageFile(file, 800, 600);
  } catch {
    uploadFile = file;
  }

  if (isSupabaseConfigured && supabase) {
    const ext = uploadFile.name.split('.').pop()?.toLowerCase() || 'webp';
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('scooter-images')
      .upload(path, uploadFile, { upsert: true, contentType: uploadFile.type });
    if (!error) {
      const { data } = supabase.storage.from('scooter-images').getPublicUrl(path);
      return data.publicUrl;
    }
    throw new Error(error.message || 'Image upload failed');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(uploadFile);
  });
}

export async function saveSitePhotos(photos) {
  const next = writeSitePhotos(photos);

  if (isSupabaseConfigured && supabase) {
    const payload = { photos: next, updated_at: new Date().toISOString() };
    const { data: updated, error: updateError } = await supabase
      .from('site_settings')
      .update(payload)
      .eq('id', SETTINGS_ROW_ID)
      .select('id');

    if (updateError) {
      throw new Error(
        updateError.message?.includes('photos')
          ? 'Photo cloud save failed — run migration add_site_photos_json.sql in Supabase, then try again.'
          : updateError.message || 'Could not save photos to cloud.',
      );
    }

    if (!updated?.length) {
      const { error: insertError } = await supabase.from('site_settings').insert({
        id: SETTINGS_ROW_ID,
        photos: next,
      });
      if (insertError) {
        throw new Error(insertError.message || 'Could not save photos to cloud.');
      }
    }
  }

  if (next.hero?.url && isSupabaseConfigured) {
    try {
      await saveHeroImage(next.hero.url);
    } catch (e) {
      console.warn('[sitePhotos] hero sync failed:', e?.message || e);
    }
  }
  return next;
}
