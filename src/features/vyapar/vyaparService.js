import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { clearCache } from '@/lib/cache';
import {
  suggestMapping,
  mapVyaparStock,
  effectiveName,
  effectivePrice,
  uniqueSlug,
  defaultScooterFromVyapar,
  defaultAccessoryFromVyapar,
  applyPriceToScooter,
} from './vyaparMapping';
import { getScooters, upsertScooter } from '@/features/scooters/scooterService';
import { getAccessories, upsertAccessory } from '@/features/accessories/accessoryService';
import { withTimeout, FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS } from '@/lib/utils';

const SETTINGS_ROW_ID = 1;
const VYAPAR_ITEMS_URL = 'https://api1.vyaparapp.in/api/catalogue/getItems';
const VYAPAR_STORE_URL = (alias) => `https://api1.vyaparapp.in/store/${alias}`;

const DEFAULT_SETTINGS = {
  enabled: false,
  storeAlias: 'biswajitpowerhub',
  catalogueId: '3e564898280a1',
  syncPrice: true,
  syncStock: true,
  lastSyncedAt: null,
  lastSyncError: null,
  lastSyncCount: 0,
};

function fromSettingsRow(row) {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    enabled: Boolean(row.enabled),
    storeAlias: row.store_alias || DEFAULT_SETTINGS.storeAlias,
    catalogueId: row.catalogue_id || DEFAULT_SETTINGS.catalogueId,
    syncPrice: row.sync_price !== false,
    syncStock: row.sync_stock !== false,
    lastSyncedAt: row.last_synced_at || null,
    lastSyncError: row.last_sync_error || null,
    lastSyncCount: Number(row.last_sync_count) || 0,
  };
}

function toSettingsRow(s) {
  return {
    id: SETTINGS_ROW_ID,
    enabled: Boolean(s.enabled),
    store_alias: s.storeAlias || DEFAULT_SETTINGS.storeAlias,
    catalogue_id: s.catalogueId || DEFAULT_SETTINGS.catalogueId,
    sync_price: s.syncPrice !== false,
    sync_stock: s.syncStock !== false,
    last_synced_at: s.lastSyncedAt || null,
    last_sync_error: s.lastSyncError || null,
    last_sync_count: Number(s.lastSyncCount) || 0,
    updated_at: new Date().toISOString(),
  };
}

function fromItemRow(row) {
  return {
    id: row.id,
    catalogueId: row.catalogue_id,
    vyaparItemId: row.vyapar_item_id,
    name: row.name,
    displayName: row.display_name || '',
    description: row.description || '',
    categoryVyapar: Array.isArray(row.category_vyapar) ? row.category_vyapar : [],
    mappedCategory: row.mapped_category || '',
    mappedType: row.mapped_type || null,
    mappedId: row.mapped_id || null,
    linked: Boolean(row.linked),
    syncPrice: row.sync_price !== false,
    syncStock: row.sync_stock !== false,
    price: Number(row.price) || 0,
    discountedPrice: row.discounted_price != null ? Number(row.discounted_price) : null,
    quantity: Number.isFinite(Number(row.quantity)) ? Number(row.quantity) : 0,
    unit: row.unit || 'Nos',
    stockFlag: row.stock_flag !== false,
    imageFolder: row.image_folder || '',
    localImages: Array.isArray(row.local_images) ? row.local_images : [],
    notes: row.notes || '',
    raw: row.raw || {},
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toItemRow(item) {
  return {
    id: item.id,
    catalogue_id: item.catalogueId,
    vyapar_item_id: item.vyaparItemId ?? null,
    name: item.name,
    display_name: item.displayName || null,
    description: item.description || '',
    category_vyapar: item.categoryVyapar || [],
    mapped_category: item.mappedCategory || null,
    mapped_type: item.mappedType || null,
    mapped_id: item.mappedId || null,
    linked: Boolean(item.linked),
    sync_price: item.syncPrice !== false,
    sync_stock: item.syncStock !== false,
    price: Number(item.price) || 0,
    discounted_price: item.discountedPrice != null ? Number(item.discountedPrice) : null,
    quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0,
    unit: item.unit || 'Nos',
    stock_flag: item.stockFlag !== false,
    image_folder: item.imageFolder || null,
    local_images: item.localImages || [],
    notes: item.notes || '',
    raw: item.raw || {},
    last_seen_at: item.lastSeenAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function normalizeRemoteItem(raw, catalogueId) {
  const categoryVyapar = Array.isArray(raw.itemCategoryName) ? raw.itemCategoryName : [];
  const name = raw.itemName || 'Untitled';
  const suggested = suggestMapping(categoryVyapar, name);
  const qty = Number(raw.availableItemQuantity);
  return {
    id: String(raw.id),
    catalogueId: raw.catalogueId || catalogueId,
    vyaparItemId: raw.itemId ?? null,
    name,
    price: Number(raw.itemSaleUnitPrice) || 0,
    discountedPrice:
      raw.discountedSalePrice != null ? Number(raw.discountedSalePrice) : null,
    quantity: Number.isFinite(qty) ? qty : 0,
    unit: raw.primaryUnitShortName || 'Nos',
    stockFlag: raw.itemStockStatus !== false,
    imageFolder: raw.uniqueImageFolderId || '',
    categoryVyapar,
    description: raw.itemDescription || '',
    mappedType: suggested.mappedType,
    mappedCategory: suggested.mappedCategory || '',
    raw,
  };
}

async function ensureConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Connect Supabase to use Vyapar sync.');
  }
}

export async function getVyaparSettings() {
  if (!isSupabaseConfigured || !supabase) return { ...DEFAULT_SETTINGS };
  try {
    const { data, error } = await withTimeout(
      supabase.from('vyapar_settings').select('*').eq('id', SETTINGS_ROW_ID).maybeSingle(),
      FETCH_TIMEOUT_MS,
      'Vyapar settings fetch timed out',
    );
    if (error) {
      if (isMissingTableError(error)) {
        return { ...DEFAULT_SETTINGS };
      }
      throw error;
    }
    return fromSettingsRow(data);
  } catch (err) {
    console.warn('[Vyapar] settings fetch failed:', err.message);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveVyaparSettings(patch) {
  await ensureConfigured();
  const current = await getVyaparSettings();
  const next = { ...current, ...patch };
  const { data, error } = await withTimeout(
    supabase.from('vyapar_settings').upsert(toSettingsRow(next)).select().single(),
    MUTATION_TIMEOUT_MS,
    'Vyapar settings save timed out',
  );
  if (error) throw migrationRequiredError(error);
  return fromSettingsRow(data);
}

export async function getVyaparItems() {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await withTimeout(
      supabase.from('vyapar_items').select('*').order('name', { ascending: true }),
      FETCH_TIMEOUT_MS,
      'Vyapar items fetch timed out',
    );
    if (error) {
      if (isMissingTableError(error)) {
        return [];
      }
      throw error;
    }
    return (data || []).map(fromItemRow);
  } catch (err) {
    console.warn('[Vyapar] items fetch failed:', err.message);
    return [];
  }
}

export async function saveVyaparItem(item) {
  await ensureConfigured();
  const { data, error } = await withTimeout(
    supabase.from('vyapar_items').upsert(toItemRow(item)).select().single(),
    MUTATION_TIMEOUT_MS,
    'Vyapar item save timed out',
  );
  if (error) throw migrationRequiredError(error);
  return fromItemRow(data);
}

/**
 * Parse catalogue id from the public store HTML (__NEXT_DATA__).
 */
const VYAPAR_FETCH_TIMEOUT_MS = 15000;

function fetchTimeoutSignal() {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), VYAPAR_FETCH_TIMEOUT_MS);
  return controller.signal;
}

async function catalogueIdFromStorePage(storeAlias) {
  const res = await fetch(VYAPAR_STORE_URL(storeAlias), {
    headers: { Accept: 'text/html' },
    signal: fetchTimeoutSignal(),
  });
  if (!res.ok) throw new Error(`Store page returned ${res.status}`);
  const html = await res.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error('Could not parse Vyapar store page.');
  const json = JSON.parse(match[1]);
  const id = json?.props?.pageProps?.catalogue?.id;
  if (!id) throw new Error('Catalogue id missing on store page.');
  return String(id);
}

/**
 * Resolve catalogue id for browser sync.
 * Prefer the saved id — Vyapar's store HTML page does not send CORS headers,
 * so fetching it from production (biswajitpowerhub.in) is blocked by the browser.
 * The getItems API does allow CORS (*).
 */
export async function resolveCatalogueId(storeAlias, knownId) {
  if (knownId) return String(knownId);
  try {
    return await catalogueIdFromStorePage(storeAlias);
  } catch (err) {
    throw new Error(
      `Catalogue ID is required (Vyapar store page is not readable from the browser). `
      + `Set it in Vyapar Sync → Settings. ${err.message || ''}`.trim(),
    );
  }
}

function isMissingTableError(error) {
  return (
    error?.code === '42P01'
    || error?.code === 'PGRST205'
    || /does not exist|schema cache/i.test(error?.message || '')
  );
}

function migrationRequiredError(error) {
  if (isMissingTableError(error)) {
    return new Error(
      'Vyapar tables missing. Run supabase/migrations/add_vyapar_sync.sql in the Supabase SQL editor, then retry.',
    );
  }
  return error instanceof Error ? error : new Error(error?.message || 'Vyapar request failed');
}

/**
 * Fetch live catalogue items from Vyapar (paginated).
 */
export async function fetchVyaparCatalogue(catalogueId) {
  const all = [];
  let pageNo = 1;
  let total = Infinity;

  const seen = new Set();
  while (all.length < total && pageNo <= 50) {
    const res = await fetch(VYAPAR_ITEMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ catalogueId, pageNo }),
      signal: fetchTimeoutSignal(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Vyapar API ${res.status}: ${text.slice(0, 160)}`);
    }
    const json = await res.json();
    const batch = Array.isArray(json?.data?.catalogueItems) ? json.data.catalogueItems : [];
    total = Number(json?.data?.totalItems) || batch.length;
    let added = 0;
    for (const row of batch) {
      const id = String(row?.id || '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      all.push(row);
      added += 1;
    }
    if (!batch.length || !added || all.length >= total) break;
    pageNo += 1;
  }

  return all.map((raw) => normalizeRemoteItem(raw, catalogueId));
}

/**
 * Merge remote catalogue into local vyapar_items cache.
 * Preserves displayName, localImages, mapping, sync flags, notes.
 */
function mergeRemoteIntoCached(remote, existing) {
  const suggested = suggestMapping(remote.categoryVyapar, remote.name);
  if (!existing) {
    return {
      ...remote,
      displayName: '',
      localImages: [],
      notes: '',
      linked: false,
      mappedId: null,
      mappedType: remote.mappedType || suggested.mappedType,
      mappedCategory: remote.mappedCategory || suggested.mappedCategory || '',
      syncPrice: true,
      syncStock: true,
      lastSeenAt: new Date().toISOString(),
    };
  }
  // Drop stale "removed" marker if the item is back on the store
  let notes = existing.notes || '';
  if (notes.includes('[Removed from Vyapar store]')) {
    notes = notes
      .split('\n')
      .filter((line) => !line.includes('[Removed from Vyapar store]'))
      .join('\n')
      .trim();
  }
  return {
    ...existing,
    catalogueId: remote.catalogueId,
    vyaparItemId: remote.vyaparItemId,
    name: remote.name,
    price: remote.price,
    discountedPrice: remote.discountedPrice,
    quantity: remote.quantity,
    unit: remote.unit,
    stockFlag: remote.stockFlag,
    imageFolder: remote.imageFolder,
    categoryVyapar: remote.categoryVyapar,
    raw: remote.raw,
    notes,
    // Keep local description if set; otherwise take Vyapar's
    description: existing.description?.trim()
      ? existing.description
      : remote.description || '',
    mappedCategory: existing.mappedCategory || remote.mappedCategory || suggested.mappedCategory || '',
    mappedType: existing.mappedType || remote.mappedType || suggested.mappedType,
    lastSeenAt: new Date().toISOString(),
  };
}

async function applyLinkedUpdates(items, settings) {
  const [scooters, accessories] = await Promise.all([getScooters(), getAccessories()]);
  const scooterById = Object.fromEntries(scooters.map((s) => [s.id, s]));
  const accessoryById = Object.fromEntries(accessories.map((a) => [a.id, a]));

  let updated = 0;
  let skipped = 0;
  let repaired = 0;

  for (const item of items) {
    if (!item.linked || !item.mappedId || !item.mappedType) {
      skipped += 1;
      continue;
    }

    const local = item.mappedType === 'scooter'
      ? scooterById[item.mappedId]
      : item.mappedType === 'accessory'
        ? accessoryById[item.mappedId]
        : null;

    if (!local) {
      // Linked product was deleted — clear so admin sees Unlinked
      await saveVyaparItem({ ...item, linked: false, mappedId: null });
      repaired += 1;
      skipped += 1;
      continue;
    }

    if (!settings.enabled) {
      skipped += 1;
      continue;
    }

    const doPrice = settings.syncPrice && item.syncPrice !== false;
    const doStock = settings.syncStock && item.syncStock !== false;
    if (!doPrice && !doStock) {
      skipped += 1;
      continue;
    }

    if (item.mappedType === 'scooter') {
      let next = { ...local };
      if (doPrice) next = applyPriceToScooter(next, effectivePrice(item), { previousPrice: local.price });
      if (doStock) next.stock = mapVyaparStock(item.quantity, item.stockFlag);
      await upsertScooter(next);
      scooterById[item.mappedId] = next;
      updated += 1;
    } else if (item.mappedType === 'accessory') {
      const next = { ...local };
      if (doPrice) next.price = effectivePrice(item);
      if (doStock) next.stock = mapVyaparStock(item.quantity, item.stockFlag);
      await upsertAccessory(next);
      accessoryById[item.mappedId] = next;
      updated += 1;
    } else {
      skipped += 1;
    }
  }

  return { updated, skipped, repaired };
}

/**
 * Full sync: fetch Vyapar → upsert cache → optionally push price/stock to linked locals.
 */
export async function syncFromVyapar() {
  await ensureConfigured();
  const settings = await getVyaparSettings();

  try {
    const catalogueId = await resolveCatalogueId(settings.storeAlias, settings.catalogueId);
    if (catalogueId !== settings.catalogueId) {
      await saveVyaparSettings({ catalogueId });
      settings.catalogueId = catalogueId;
    }

    const remote = await fetchVyaparCatalogue(catalogueId);
    const existing = await getVyaparItems();
    const byId = Object.fromEntries(existing.map((i) => [i.id, i]));
    const remoteIds = new Set(remote.map((r) => r.id));

    const merged = remote.map((r) => mergeRemoteIntoCached(r, byId[r.id]));

    if (merged.length) {
      const { error } = await withTimeout(
        supabase.from('vyapar_items').upsert(merged.map(toItemRow)),
        MUTATION_TIMEOUT_MS,
        'Vyapar items upsert timed out',
      );
      if (error) throw migrationRequiredError(error);
    }

    // Soft-mark missing items: keep rows but note they disappeared (do not auto-delete)
    const stale = existing.filter((e) => !remoteIds.has(e.id));
    if (stale.length) {
      await withTimeout(
        supabase.from('vyapar_items').upsert(
          stale.map((s) =>
            toItemRow({
              ...s,
              notes: s.notes?.includes('[Removed from Vyapar store]')
                ? s.notes
                : `${s.notes || ''}\n[Removed from Vyapar store]`.trim(),
            }),
          ),
        ),
        MUTATION_TIMEOUT_MS,
        'Vyapar stale upsert timed out',
      );

      const scooters = await getScooters();
      const accessories = await getAccessories();
      for (const s of stale) {
        if (!s.linked || !s.mappedId) continue;
        if (s.mappedType === 'scooter') {
          const local = scooters.find((x) => x.id === s.mappedId);
          if (local && local.stock !== 'out_of_stock') {
            await upsertScooter({ ...local, stock: 'out_of_stock' });
          }
        } else if (s.mappedType === 'accessory') {
          const local = accessories.find((x) => x.id === s.mappedId);
          if (local && local.stock !== 'out_of_stock') {
            await upsertAccessory({ ...local, stock: 'out_of_stock' });
          }
        }
      }
    }

    const apply = await applyLinkedUpdates(merged.filter((m) => m.linked), {
      ...settings,
      catalogueId,
    });

    const saved = await saveVyaparSettings({
      catalogueId,
      lastSyncedAt: new Date().toISOString(),
      lastSyncError: null,
      lastSyncCount: merged.length,
    });

    clearCache('scooters_v7');
    clearCache('scooters');
    clearCache('accessories_v2');
    clearCache('accessories');

    return {
      settings: saved,
      fetched: merged.length,
      applied: apply.updated,
      skipped: apply.skipped,
      stale: stale.length,
    };
  } catch (err) {
    await saveVyaparSettings({
      lastSyncError: err.message || 'Sync failed',
    }).catch(() => {});
    throw err;
  }
}

/**
 * Publish a Vyapar item into local inventory (create new scooter/accessory) and link it.
 * Does not overwrite existing local name/images on later syncs — only price/stock when enabled.
 */
export async function publishVyaparItem(item, { type } = {}) {
  await ensureConfigured();
  const targetType = type || item.mappedType || suggestMapping(item.categoryVyapar, item.name).mappedType;
  const [scooters, accessories] = await Promise.all([getScooters(), getAccessories()]);
  const existingIds = [
    ...scooters.map((s) => s.id),
    ...accessories.map((a) => a.id),
  ];
  const id = uniqueSlug(effectiveName(item), existingIds);

  if (targetType === 'scooter') {
    const payload = defaultScooterFromVyapar(item, id);
    const created = await upsertScooter(payload);
    const linked = await saveVyaparItem({
      ...item,
      linked: true,
      mappedType: 'scooter',
      mappedId: created.id,
      displayName: item.displayName || item.name,
    });
    return { product: created, item: linked, type: 'scooter' };
  }

  const payload = defaultAccessoryFromVyapar(item, id);
  const created = await upsertAccessory(payload);
  const linked = await saveVyaparItem({
    ...item,
    linked: true,
    mappedType: 'accessory',
    mappedId: created.id,
    mappedCategory: payload.category,
    displayName: item.displayName || item.name,
  });
  return { product: created, item: linked, type: 'accessory' };
}

/**
 * Link Vyapar item to an existing local product. Optionally push name/category once.
 */
export async function linkVyaparItem(item, { type, id, pushName = false, pushCategory = false } = {}) {
  await ensureConfigured();
  if (!type || !id) throw new Error('Pick a local product to link.');

  // Prevent two Vyapar rows claiming the same local product
  const others = await getVyaparItems();
  const conflict = others.find(
    (o) => o.id !== item.id && o.linked && o.mappedType === type && o.mappedId === id,
  );
  if (conflict) {
    throw new Error(`Already linked to “${conflict.name}”. Unlink that item first.`);
  }

  if (type === 'scooter') {
    const scooters = await getScooters();
    const local = scooters.find((s) => s.id === id);
    if (!local) throw new Error('Scooter not found.');
    let next = { ...local };
    if (pushName) next.name = effectiveName(item);
    if (item.localImages?.length && !next.images?.length) next.images = [...item.localImages];
    if (item.syncPrice !== false) next = applyPriceToScooter(next, effectivePrice(item), { previousPrice: local.price });
    if (item.syncStock !== false) next.stock = mapVyaparStock(item.quantity, item.stockFlag);
    await upsertScooter(next);
  } else {
    const accessories = await getAccessories();
    const local = accessories.find((a) => a.id === id);
    if (!local) throw new Error('Accessory not found.');
    const next = { ...local };
    if (pushName) next.name = effectiveName(item);
    if (pushCategory && item.mappedCategory) next.category = item.mappedCategory;
    if (item.localImages?.length && !next.images?.length) next.images = [...item.localImages];
    if (item.syncPrice !== false) next.price = effectivePrice(item);
    if (item.syncStock !== false) next.stock = mapVyaparStock(item.quantity, item.stockFlag);
    await upsertAccessory(next);
  }

  return saveVyaparItem({
    ...item,
    linked: true,
    mappedType: type,
    mappedId: id,
  });
}

export async function unlinkVyaparItem(item) {
  await ensureConfigured();
  return saveVyaparItem({
    ...item,
    linked: false,
    mappedId: null,
  });
}

/**
 * Push local overrides (rename, category, images, description) to the linked product once.
 * Sync never auto-overwrites these afterwards.
 */
export async function pushOverridesToLocal(item) {
  await ensureConfigured();
  if (!item.linked || !item.mappedId || !item.mappedType) {
    throw new Error('Link this item to a local product first.');
  }

  if (item.mappedType === 'scooter') {
    const scooters = await getScooters();
    const local = scooters.find((s) => s.id === item.mappedId);
    if (!local) throw new Error('Linked scooter missing — re-link or publish again.');
    let next = {
      ...local,
      name: effectiveName(item),
      description: item.description?.trim() ? item.description : local.description,
      images: item.localImages?.length ? [...item.localImages] : local.images,
    };
    if (item.syncPrice !== false) next = applyPriceToScooter(next, effectivePrice(item), { previousPrice: local.price });
    if (item.syncStock !== false) next.stock = mapVyaparStock(item.quantity, item.stockFlag);
    const saved = await upsertScooter(next);
    await saveVyaparItem(item);
    return { product: saved, type: 'scooter' };
  }

  const accessories = await getAccessories();
  const local = accessories.find((a) => a.id === item.mappedId);
  if (!local) throw new Error('Linked accessory missing — re-link or publish again.');
  const next = {
    ...local,
    name: effectiveName(item),
    category: item.mappedCategory || local.category,
    description: item.description?.trim() ? item.description : local.description,
    images: item.localImages?.length ? [...item.localImages] : local.images,
  };
  if (item.syncPrice !== false) next.price = effectivePrice(item);
  if (item.syncStock !== false) next.stock = mapVyaparStock(item.quantity, item.stockFlag);
  const saved = await upsertAccessory(next);
  await saveVyaparItem(item);
  return { product: saved, type: 'accessory' };
}

