import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { ACCESSORIES } from '@/data/accessories';

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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('accessories')
        .select('*')
        .order('category', { ascending: true })
        .order('price', { ascending: true });

      if (!error) {
        return (data || []).map(fromRow);
      }

      // Table missing — demo seed for pre-migration installs
      if (error?.code === '42P01') {
        return ACCESSORIES;
      }

      console.warn('[Accessories] Supabase fetch failed:', error.message);
      return [];
    }

    return ACCESSORIES;
  }, CACHE_TTL);
}

export async function getAccessoryById(id) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) return fromRow(data);
    if (!error) return null;
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
  const { data, error } = await supabase.from('accessories').upsert(toRow(accessory)).select().single();
  if (error) throw error;
  clearCache(CACHE_KEY);
  clearCache('accessories');
  return fromRow(data);
}

export async function deleteAccessory(id) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('accessories').delete().eq('id', id);
  if (error) throw error;
  clearCache(CACHE_KEY);
  clearCache('accessories');
}

export async function updateAccessoryStock(id, stock_status) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('accessories').update({ stock_status }).eq('id', id);
  if (error) throw error;
  clearCache(CACHE_KEY);
  clearCache('accessories');
}

export async function uploadAccessoryImage(file, accessoryId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${accessoryId || 'new'}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('accessory-images')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from('accessory-images').getPublicUrl(path);
        return data.publicUrl;
      }
      console.warn('[Storage] Accessory upload failed, falling back to base64:', error.message);
    } catch (e) {
      console.warn('[Storage] Accessory upload exception, falling back to base64:', e);
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
