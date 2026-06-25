import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { withTimeout } from '@/lib/utils';
import { SCOOTERS } from '@/data/scooters';

const CACHE_KEY = 'scooters_v2';
const CACHE_TTL = 5 * 60;
const FETCH_TIMEOUT_MS = 8000;

/**
 * Normalize a Supabase row (snake_case) to the app's camelCase scooter shape.
 */
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    tagline: row.tagline,
    price: Number(row.price),
    hue: row.hue || 'blue',
    images: Array.isArray(row.images) ? row.images : [],
    batteryType: row.battery_type,
    batteryCapacity: row.battery_capacity,
    range: Number(row.range_km),
    realRangeFactor: Number(row.real_range_factor) || 0.83,
    topSpeed: Number(row.top_speed),
    chargingTime: row.charging_time,
    warranty: row.warranty,
    motor: row.motor,
    weight: row.weight,
    loadCapacity: row.load_capacity,
    colors: row.colors || [],
    noLicence: row.no_licence,
    noRegistration: row.no_registration,
    stock: row.stock_status,
    featured: row.featured,
    description: row.description || '',
    features: row.features || [],
    benefits: row.benefits || [],
  };
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
    motor: s.motor,
    weight: s.weight,
    load_capacity: s.loadCapacity,
    colors: s.colors || [],
    no_licence: s.noLicence,
    no_registration: s.noRegistration,
    stock_status: s.stock,
    featured: s.featured,
    description: s.description || '',
    features: s.features || [],
    benefits: s.benefits || [],
  };
}

function bustScooterCache() {
  clearCache(CACHE_KEY);
  clearCache('scooters');
}

export async function getScooters() {
  return fetchWithCache(CACHE_KEY, async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase.from('scooters').select('*').order('price', { ascending: true }),
          FETCH_TIMEOUT_MS,
          'Scooter catalog fetch timed out',
        );

        if (!error && Array.isArray(data)) {
          return data.map(fromRow);
        }

        if (error?.code === '42P01') {
          return SCOOTERS;
        }

        console.warn('[Scooters] Supabase fetch failed:', error?.message || 'Unknown error');
      } catch (err) {
        console.warn('[Scooters] Supabase fetch failed:', err.message);
      }

      return SCOOTERS;
    }

    return SCOOTERS;
  }, CACHE_TTL);
}

export async function getScooterById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('scooters').select('*').eq('id', id).maybeSingle(),
        FETCH_TIMEOUT_MS,
        'Scooter fetch timed out',
      );

      if (!error && data) return fromRow(data);
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
  const { data, error } = await supabase.from('scooters').upsert(toRow(scooter)).select().single();
  if (error) throw error;
  bustScooterCache();
  return fromRow(data);
}

export async function deleteScooter(id) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('scooters').delete().eq('id', id);
  if (error) throw error;
  bustScooterCache();
}

export async function updateStock(id, stock_status) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('scooters').update({ stock_status }).eq('id', id);
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
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${scooterId || 'new'}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('scooter-images')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from('scooter-images').getPublicUrl(path);
        return data.publicUrl;
      }
      console.warn('[Storage] Upload failed, falling back to base64:', error.message);
    } catch (e) {
      console.warn('[Storage] Upload exception, falling back to base64:', e);
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
