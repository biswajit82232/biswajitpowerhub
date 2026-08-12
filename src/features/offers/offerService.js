import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { getFinanceSettings } from '@/features/finance/financeService';
import { compressForUpload } from '@/lib/resizeImage';
import { withTimeout, FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from '@/lib/utils';

const CACHE_KEY = 'promotional_offers_v3';
const LEGACY_CACHE_KEY = 'promotional_offers_v2';
const LOCAL_KEY = 'bph_promotional_offers';

function bustOfferCache() {
  clearCache(CACHE_KEY);
  clearCache(`${CACHE_KEY}_active`);
  clearCache(LEGACY_CACHE_KEY);
  clearCache(`${LEGACY_CACHE_KEY}_active`);
  clearCache('promotional_offers');
  clearCache('promotional_offers_active');
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title || '',
    discountText: row.discount_text || '',
    promoCode: row.promo_code || '',
    description: row.description || '',
    kind: row.kind === 'free_with_purchase' ? 'free_with_purchase' : 'promo',
    imageUrl: row.image_url || '',
    showOnHero: row.show_on_hero !== false,
    active: Boolean(row.active),
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(offer) {
  return {
    title: offer.title?.trim() || '',
    discount_text: offer.discountText?.trim() || '',
    promo_code: offer.promoCode?.trim() || '',
    description: offer.description?.trim() || '',
    kind: offer.kind === 'free_with_purchase' ? 'free_with_purchase' : 'promo',
    image_url: offer.imageUrl?.trim() || '',
    show_on_hero: offer.showOnHero !== false,
    active: Boolean(offer.active),
    sort_order: Number(offer.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(offers) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(offers));
  } catch (_) { /* ignore */ }
}

function parseLegacyLabel(label) {
  const text = label.trim();
  const match = text.match(/^([A-Za-z0-9]{4,})\s+(.+)$/);
  if (match) {
    const discount = match[2].trim();
    const withRupee = /^\d/.test(discount) ? `₹${discount.replace(/^(\d+)/, '$1')}` : discount;
    return { promoCode: match[1].toUpperCase(), discountText: withRupee };
  }
  return { promoCode: '', discountText: text };
}

async function legacyOffersFromFinance() {
  try {
    const settings = await getFinanceSettings();
    const promo = settings?.promo;
    if (promo?.active && promo?.label?.trim()) {
      const parsed = parseLegacyLabel(promo.label);
      return [{
        id: 'legacy-finance-promo',
        title: promo.title?.trim() || 'Limited Time Offer',
        discountText: promo.discountText?.trim() || parsed.discountText,
        promoCode: promo.code?.trim() || parsed.promoCode,
        description: promo.description?.trim() || 'Visit our showroom or WhatsApp us to claim this offer.',
        kind: 'promo',
        imageUrl: '',
        showOnHero: true,
        active: true,
        sortOrder: 0,
      }];
    }
  } catch (_) { /* ignore */ }
  return [];
}

function isMissingTable(error) {
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    /does not exist|schema cache/i.test(error?.message || '')
  );
}

export async function getActiveOffers() {
  return fetchWithCache(`${CACHE_KEY}_active`, async () => {
    if (!isSupabaseConfigured || !supabase) {
      const local = readLocal();
      const active = local.filter((o) => o.active).sort((a, b) => a.sortOrder - b.sortOrder);
      if (active.length) return active;
      return legacyOffersFromFinance();
    }

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('promotional_offers')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
        FETCH_TIMEOUT_MS,
        'Offers fetch timed out',
      );

      if (!error) {
        return (data || [])
          .map(mapRow)
          .filter((o) => o.active)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      }

      if (isMissingTable(error)) {
        return legacyOffersFromFinance();
      }

      throw new Error(error.message || 'Offers fetch failed');
    } catch (err) {
      console.warn('[Offers] Supabase fetch failed:', err.message);
      throw err;
    }
  }, 60).catch(async () => {
    const local = readLocal().filter((o) => o.active).sort((a, b) => a.sortOrder - b.sortOrder);
    if (local.length) return local;
    return legacyOffersFromFinance();
  });
}

export async function getAllOffers() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('promotional_offers')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
        FETCH_TIMEOUT_MS,
        'Offers list timed out',
      );

      if (!error) {
        const mapped = (data || []).map(mapRow);
        writeLocal(mapped);
        return mapped;
      }

      if (isMissingTable(error)) {
        return legacyOffersFromFinance();
      }

      throw new Error(error.message || 'Offers list failed');
    } catch (err) {
      console.warn('[Offers] Supabase fetch failed:', err.message);
      const local = readLocal();
      if (local.length) return local;
      return legacyOffersFromFinance();
    }
  }

  return readLocal();
}

export async function uploadOfferImage(file) {
  const upload = await compressForUpload(file, 800, 800);
  if (isSupabaseConfigured && supabase) {
    const ext = upload.name.split('.').pop()?.toLowerCase() || 'webp';
    const path = `offers/${Date.now()}.${ext}`;
    const { error } = await withTimeout(
      supabase.storage
        .from('scooter-images')
        .upload(path, upload, { upsert: true, contentType: upload.type }),
      UPLOAD_TIMEOUT_MS,
      'Offer image upload timed out',
    );
    if (error) throw new Error(error.message || 'Image upload failed');
    const { data } = supabase.storage.from('scooter-images').getPublicUrl(path);
    return data.publicUrl;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(upload);
  });
}

export async function saveOffer(offer) {
  const payload = toRow(offer);

  if (isSupabaseConfigured && supabase) {
    bustOfferCache();

    if (offer.id && !String(offer.id).startsWith('legacy')) {
      const { data, error } = await withTimeout(
        supabase.from('promotional_offers').update(payload).eq('id', offer.id).select().single(),
        MUTATION_TIMEOUT_MS,
        'Offer save timed out',
      );
      if (error) throw error;
      return mapRow(data);
    }

    const { data, error } = await withTimeout(
      supabase.from('promotional_offers').insert(payload).select().single(),
      MUTATION_TIMEOUT_MS,
      'Offer save timed out',
    );
    if (error) throw error;
    return mapRow(data);
  }

  const list = readLocal();
  if (offer.id) {
    const next = list.map((o) =>
      o.id === offer.id
        ? {
            ...o,
            ...offer,
            discountText: payload.discount_text,
            promoCode: payload.promo_code,
            sortOrder: payload.sort_order,
            kind: payload.kind,
            imageUrl: payload.image_url,
            showOnHero: payload.show_on_hero,
            active: payload.active,
          }
        : o,
    );
    writeLocal(next);
    bustOfferCache();
    return next.find((o) => o.id === offer.id);
  }

  const created = {
    id: crypto.randomUUID(),
    title: payload.title,
    discountText: payload.discount_text,
    promoCode: payload.promo_code,
    description: payload.description,
    kind: payload.kind,
    imageUrl: payload.image_url,
    showOnHero: payload.show_on_hero,
    sortOrder: payload.sort_order,
    active: payload.active,
    createdAt: new Date().toISOString(),
  };
  writeLocal([...list, created]);
  bustOfferCache();
  return created;
}

export async function deleteOffer(id) {
  if (!id || String(id).startsWith('legacy')) return;

  if (isSupabaseConfigured && supabase) {
    bustOfferCache();
    const { data, error } = await withTimeout(
      supabase.from('promotional_offers').delete().eq('id', id).select('id'),
      MUTATION_TIMEOUT_MS,
      'Offer delete timed out',
    );
    if (error) throw error;
    if (!data?.length) throw new Error('Offer could not be deleted.');

    const { data: remaining } = await withTimeout(
      supabase
        .from('promotional_offers')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      FETCH_TIMEOUT_MS,
      'Offers refresh timed out',
    );
    writeLocal((remaining || []).map(mapRow));
    bustOfferCache();
    return;
  }

  writeLocal(readLocal().filter((o) => o.id !== id));
  bustOfferCache();
}
