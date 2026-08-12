import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { withTimeout, FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from '@/lib/utils';
import { compressForUpload } from '@/lib/resizeImage';
import { SCOOTERS } from '@/data/scooters';
import { normalizeScooter } from '@/lib/scooterVariants';
import { DEFAULT_REAL_RANGE_FACTOR } from '@/lib/rangeDefaults';

const CACHE_KEY = 'scooters_v7';
const CACHE_TTL = 60;
const SEED_BY_ID = Object.fromEntries(SCOOTERS.map((s) => [s.id, s]));

/**
 * Normalize a Supabase row (snake_case) to the app's camelCase scooter shape.
 * Admin/DB values win. Seed catalog only fills empty optional fields.
 */
function fromRow(row) {
  const seed = SEED_BY_ID[row.id];
  const images = Array.isArray(row.images) ? row.images : [];
  const variants = Array.isArray(row.variants) ? row.variants : [];

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    tagline: row.tagline || seed?.tagline || '',
    price: Number(row.price),
    hue: row.hue || 'blue',
    images: images.length ? images : seed?.images || [],
    batteryType: row.battery_type,
    batteryCapacity: row.battery_capacity,
    range: Number(row.range_km),
    realRangeFactor: Number(row.real_range_factor) || DEFAULT_REAL_RANGE_FACTOR,
    topSpeed: Number(row.top_speed),
    chargingTime: row.charging_time,
    warranty: row.warranty,
    batteryWarranty: row.battery_warranty,
    motor: row.motor,
    weight: row.weight,
    loadCapacity: row.load_capacity,
    colors: row.colors || [],
    noLicence: row.no_licence,
    noRegistration: row.no_registration,
    isBudget: Boolean(row.is_budget),
    isPremium: Boolean(row.is_premium),
    stock: row.stock_status,
    featured: row.featured,
    description: row.description || seed?.description || '',
    features: row.features || [],
    benefits: row.benefits || [],
    variants: variants.length ? variants : Array.isArray(seed?.variants) ? seed.variants : [],
  };
}

function normalizeAll(list) {
  return list.map(normalizeScooter);
}

/** Convert app shape -> Supabase row for inserts/updates. */
export function toRow(s) {
  return {
    id: s.id,
    name: s.name,
    brand: s.brand,
    tagline: s.tagline,
    price: s.price,
    hue: s.hue,
    images: s.images || [],
    battery_type: s.batteryType,
    battery_capacity: s.batteryCapacity,
    range_km: s.range,
    real_range_factor: s.realRangeFactor,
    top_speed: s.topSpeed,
    charging_time: s.chargingTime,
    warranty: s.warranty,
    battery_warranty: s.batteryWarranty,
    motor: s.motor,
    weight: s.weight,
    load_capacity: s.loadCapacity,
    colors: s.colors || [],
    no_licence: s.noLicence,
    no_registration: s.noRegistration,
    is_budget: !!s.isBudget,
    is_premium: !!s.isPremium,
    stock_status: s.stock,
    featured: s.featured,
    description: s.description || '',
    features: s.features || [],
    benefits: s.benefits || [],
    variants: s.variants || [],
  };
}

function bustScooterCache() {
  clearCache(CACHE_KEY);
  clearCache('scooters');
}

export async function getScooters() {
  return fetchWithCache(CACHE_KEY, async () => {
    if (!isSupabaseConfigured || !supabase) {
      return normalizeAll(SCOOTERS);
    }

    try {
      const { data, error } = await withTimeout(
        supabase.from('scooters').select('*').order('price', { ascending: true }),
        FETCH_TIMEOUT_MS,
        'Scooter catalog fetch timed out',
      );

      if (!error && Array.isArray(data)) {
        return normalizeAll(data.map(fromRow));
      }

      if (error?.code === '42P01') {
        return normalizeAll(SCOOTERS);
      }

      throw new Error(error?.message || 'Scooter catalog fetch failed');
    } catch (err) {
      console.warn('[Scooters] Supabase fetch failed:', err.message);
      throw err;
    }
  }, CACHE_TTL).catch(() => normalizeAll(SCOOTERS));
}

export async function getScooterById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('scooters').select('*').eq('id', id).maybeSingle(),
        FETCH_TIMEOUT_MS,
        'Scooter fetch timed out',
      );

      if (!error && data) return normalizeScooter(fromRow(data));
      if (!error) return null;
    } catch (err) {
      console.warn('[Scooters] Single fetch failed:', err.message);
    }
  }

  const all = await getScooters();
  return all.find((s) => s.id === id) || null;
}

export async function getFeaturedScooters(limit = 4) {
  const all = await getScooters();
  return all.filter((s) => s.featured).slice(0, limit);
}

/* ---------- Admin mutations (require Supabase + auth) ---------- */

export async function upsertScooter(scooter) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { data, error } = await withTimeout(
    supabase.from('scooters').upsert(toRow(scooter)).select().single(),
    MUTATION_TIMEOUT_MS,
    'Scooter save timed out',
  );
  if (error) throw error;
  bustScooterCache();
  return fromRow(data);
}

export async function deleteScooter(id) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('scooters').delete().eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Scooter delete timed out',
  );
  if (error) throw error;
  bustScooterCache();
}

export async function updateStock(id, stock_status) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('scooters').update({ stock_status }).eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Stock update timed out',
  );
  if (error) throw error;
  bustScooterCache();
}

/**
 * Upload a scooter image file.
 * - If Supabase is configured: uploads to the `scooter-images` public bucket
 *   and returns the public URL.
 * - Otherwise: converts to a base64 data URL (demo mode).
 */
export async function uploadScooterImage(file, scooterId) {
  const upload = await compressForUpload(file, 1600, 1200);
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = upload.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${scooterId || 'new'}/${Date.now()}.${ext}`;
      const { error } = await withTimeout(
        supabase.storage
          .from('scooter-images')
          .upload(path, upload, { upsert: false, contentType: upload.type }),
        UPLOAD_TIMEOUT_MS,
        'Scooter image upload timed out',
      );
      if (!error) {
        const { data } = supabase.storage.from('scooter-images').getPublicUrl(path);
        return data.publicUrl;
      }
      console.warn('[Storage] Upload failed:', error.message);
      throw new Error(error.message || 'Image upload failed');
    } catch (e) {
      console.warn('[Storage] Upload exception:', e);
      throw e instanceof Error ? e : new Error('Image upload failed');
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(upload);
  });
}
