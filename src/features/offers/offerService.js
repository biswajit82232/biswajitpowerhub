import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { getFinanceSettings } from '@/features/finance/financeService';

const CACHE_KEY = 'promotional_offers';
const LOCAL_KEY = 'bph_promotional_offers';

function mapRow(row) {
  return {
    id: row.id,
    title: row.title || '',
    discountText: row.discount_text || '',
    promoCode: row.promo_code || '',
    description: row.description || '',
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
        active: true,
        sortOrder: 0,
      }];
    }
  } catch (_) { /* ignore */ }
  return [];
}

export async function getActiveOffers() {
  return fetchWithCache(`${CACHE_KEY}_active`, async () => {
    const all = await getAllOffers();
    return all.filter((o) => o.active).sort((a, b) => a.sortOrder - b.sortOrder);
  }, 5 * 60);
}

export async function getAllOffers() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('promotional_offers')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error) {
      const mapped = (data || []).map(mapRow);
      if (mapped.length) {
        writeLocal(mapped);
        return mapped;
      }
      return legacyOffersFromFinance();
    }

    if (error?.code === '42P01') {
      return legacyOffersFromFinance();
    }
  }

  const local = readLocal();
  if (local.length) return local;

  return legacyOffersFromFinance();
}

export async function saveOffer(offer) {
  const payload = toRow(offer);

  if (isSupabaseConfigured && supabase) {
    clearCache(CACHE_KEY);
    clearCache(`${CACHE_KEY}_active`);

    if (offer.id && !String(offer.id).startsWith('legacy')) {
      const { data, error } = await supabase
        .from('promotional_offers')
        .update(payload)
        .eq('id', offer.id)
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    }

    const { data, error } = await supabase
      .from('promotional_offers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data);
  }

  const list = readLocal();
  if (offer.id) {
    const next = list.map((o) => (o.id === offer.id ? { ...o, ...offer, ...payload, discountText: payload.discount_text, promoCode: payload.promo_code, sortOrder: payload.sort_order } : o));
    writeLocal(next);
    clearCache(`${CACHE_KEY}_active`);
    return next.find((o) => o.id === offer.id);
  }

  const created = {
    id: crypto.randomUUID(),
    ...offer,
    discountText: payload.discount_text,
    promoCode: payload.promo_code,
    sortOrder: payload.sort_order,
    active: payload.active,
    createdAt: new Date().toISOString(),
  };
  writeLocal([...list, created]);
  clearCache(`${CACHE_KEY}_active`);
  return created;
}

export async function deleteOffer(id) {
  if (!id || String(id).startsWith('legacy')) return;

  if (isSupabaseConfigured && supabase) {
    clearCache(CACHE_KEY);
    clearCache(`${CACHE_KEY}_active`);
    const { error } = await supabase.from('promotional_offers').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  writeLocal(readLocal().filter((o) => o.id !== id));
  clearCache(`${CACHE_KEY}_active`);
}
