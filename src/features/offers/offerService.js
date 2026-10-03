import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { getFinanceSettings } from '@/features/finance/financeService';
import { compressForUpload } from '@/lib/resizeImage';
import { withTimeout, FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from '@/lib/utils';
import { normalizeSalePercent, parseScooterIds, SCOOTER_SALE_KIND } from '@/lib/salePrice';

const CACHE_KEY = 'promotional_offers_v4';
const LEGACY_CACHE_KEY = 'promotional_offers_v3';
const LOCAL_KEY = 'bph_promotional_offers';

function bustOfferCache() {
  clearCache(CACHE_KEY);
  clearCache(`${CACHE_KEY}_active`);
  clearCache(LEGACY_CACHE_KEY);
  clearCache(`${LEGACY_CACHE_KEY}_active`);
  clearCache('promotional_offers');
  clearCache('promotional_offers_active');
}

function normalizeKind(kind) {
  if (kind === 'free_with_purchase' || kind === SCOOTER_SALE_KIND) return kind;
  return 'promo';
}

function mapRow(row) {
  const kind = normalizeKind(row.kind);
  const discountPercent = kind === SCOOTER_SALE_KIND ? normalizeSalePercent(row.discount_percent ?? row.discountPercent) : null;
  const scooterIds = kind === SCOOTER_SALE_KIND ? parseScooterIds(row.scooter_ids ?? row.scooterIds) : [];
  const discountText = kind === SCOOTER_SALE_KIND && discountPercent
    ? `${discountPercent}% OFF`
    : (row.discount_text || row.discountText || '');
  return {
    id: row.id,
    title: row.title || '',
    discountText,
    promoCode: kind === SCOOTER_SALE_KIND ? '' : (row.promo_code || row.promoCode || ''),
    description: row.description || '',
    kind,
    imageUrl: row.image_url || row.imageUrl || '',
    showOnHero: (row.show_on_hero ?? row.showOnHero) !== false,
    discountPercent,
    scooterIds,
    active: Boolean(row.active),
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

function toRow(offer) {
  const kind = normalizeKind(offer.kind);
  const discountPercent = kind === SCOOTER_SALE_KIND ? normalizeSalePercent(offer.discountPercent) : null;
  const scooterIds = kind === SCOOTER_SALE_KIND ? parseScooterIds(offer.scooterIds) : [];
  return {
    title: offer.title?.trim() || '',
    discount_text: discountPercent ? `${discountPercent}% OFF` : (offer.discountText?.trim() || ''),
    promo_code: kind === 'promo' ? (offer.promoCode?.trim() || '') : '',
    description: offer.description?.trim() || '',
    kind,
    image_url: kind === 'free_with_purchase' ? (offer.imageUrl?.trim() || '') : '',
    show_on_hero: offer.showOnHero !== false,
    discount_percent: discountPercent,
    scooter_ids: scooterIds,
    active: Boolean(offer.active),
    sort_order: Number(offer.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
}

function withoutSaleColumns(payload) {
  const next = { ...payload };
  delete next.discount_percent;
  delete next.scooter_ids;
  return next;
}

function isMissingSaleColumns(error) {
  const msg = error?.message || '';
  return error?.code === 'PGRST204' || error?.code === '42703' || /discount_percent|scooter_ids/i.test(msg);
}

function saleMigrationError() {
  return new Error('Scooter sale needs a database update. Run npm run db:migrate, then save again.');
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
        discountPercent: null,
        scooterIds: [],
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

async function writeOfferRow(payload, id) {
  const run = (row) => {
    const query = id
      ? supabase.from('promotional_offers').update(row).eq('id', id).select().single()
      : supabase.from('promotional_offers').insert(row).select().single();
    return withTimeout(query, MUTATION_TIMEOUT_MS, 'Offer save timed out');
  };

  let { data, error } = await run(payload);
  if (error && isMissingSaleColumns(error)) {
    if (payload.kind === SCOOTER_SALE_KIND) throw saleMigrationError();
    ({ data, error } = await run(withoutSaleColumns(payload)));
  }
  if (error) throw error;
  return mapRow(data);
}

export async function saveOffer(offer) {
  const payload = toRow(offer);

  if (isSupabaseConfigured && supabase) {
    bustOfferCache();
    const id = offer.id && !String(offer.id).startsWith('legacy') ? offer.id : null;
    return writeOfferRow(payload, id);
  }

  const list = readLocal();
  const stored = mapRow({
    ...payload,
    id: offer.id || crypto.randomUUID(),
    created_at: offer.createdAt || new Date().toISOString(),
  });

  if (offer.id) {
    const next = list.map((item) => (item.id === offer.id ? { ...item, ...stored } : item));
    writeLocal(next);
    bustOfferCache();
    return next.find((item) => item.id === offer.id);
  }

  writeLocal([...list, stored]);
  bustOfferCache();
  return stored;
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
