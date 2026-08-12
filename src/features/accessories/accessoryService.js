import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { ACCESSORIES } from '@/data/accessories';
import { compressForUpload } from '@/lib/resizeImage';
import { withTimeout, FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from '@/lib/utils';

const CACHE_KEY = 'accessories_v2';
const CACHE_TTL = 60;

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    hue: row.hue || 'teal',
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description || '',
    compatibility: row.compatibility || '',
    stock: row.stock_status,
    featured: Boolean(row.featured),
  };
}

export function toRow(a) {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    price: a.price,
    hue: a.hue,
    images: a.images || [],
    description: a.description || '',
    compatibility: a.compatibility || '',
    stock_status: a.stock,
    featured: Boolean(a.featured),
  };
}

export async function getAccessories() {
  return fetchWithCache(CACHE_KEY, async () => {
    if (!isSupabaseConfigured || !supabase) {
      return ACCESSORIES;
    }

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('accessories')
          .select('*')
          .order('category', { ascending: true })
          .order('price', { ascending: true }),
        FETCH_TIMEOUT_MS,
        'Accessories fetch timed out',
      );

      if (!error) {
        return (data || []).map(fromRow);
      }

      if (
        error?.code === '42P01' ||
        error?.code === 'PGRST205' ||
        /does not exist|schema cache/i.test(error?.message || '')
      ) {
        return ACCESSORIES;
      }

      throw new Error(error.message || 'Accessories fetch failed');
    } catch (err) {
      console.warn('[Accessories] Supabase fetch failed:', err.message);
      throw err;
    }
  }, CACHE_TTL).catch(() => ACCESSORIES);
}

export async function getAccessoryById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('accessories').select('*').eq('id', id).maybeSingle(),
        FETCH_TIMEOUT_MS,
        'Accessory fetch timed out',
      );
      if (!error && data) return fromRow(data);
      if (!error) return null;
    } catch (err) {
      console.warn('[Accessories] Single fetch failed:', err.message);
    }
  }

  const all = await getAccessories();
  return all.find((a) => a.id === id) || null;
}

export async function getFeaturedAccessories(limit = 4) {
  const all = await getAccessories();
  return all.filter((a) => a.featured).slice(0, limit);
}

export async function upsertAccessory(accessory) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { data, error } = await withTimeout(
    supabase.from('accessories').upsert(toRow(accessory)).select().single(),
    MUTATION_TIMEOUT_MS,
    'Accessory save timed out',
  );
  if (error) throw error;
  clearCache(CACHE_KEY);
  clearCache('accessories');
  return fromRow(data);
}

export async function deleteAccessory(id) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('accessories').delete().eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Accessory delete timed out',
  );
  if (error) throw error;
  clearCache(CACHE_KEY);
  clearCache('accessories');
}

export async function updateAccessoryStock(id, stock_status) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('accessories').update({ stock_status }).eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Accessory stock update timed out',
  );
  if (error) throw error;
  clearCache(CACHE_KEY);
  clearCache('accessories');
}

export async function uploadAccessoryImage(file, accessoryId) {
  const upload = await compressForUpload(file, 1200, 900);
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = upload.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${accessoryId || 'new'}/${Date.now()}.${ext}`;
      const { error } = await withTimeout(
        supabase.storage
          .from('accessory-images')
          .upload(path, upload, { upsert: false, contentType: upload.type }),
        UPLOAD_TIMEOUT_MS,
        'Accessory image upload timed out',
      );
      if (!error) {
        const { data } = supabase.storage.from('accessory-images').getPublicUrl(path);
        return data.publicUrl;
      }
      console.warn('[Storage] Accessory upload failed:', error.message);
      throw new Error(error.message || 'Image upload failed');
    } catch (e) {
      console.warn('[Storage] Accessory upload exception:', e);
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
