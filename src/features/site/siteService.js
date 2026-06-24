import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import {
  CONTACT_DEFAULTS,
  buildAddressFull,
  mergeSiteSettings,
  INITIAL_HOURS,
  DEFAULT_DAY_HOURS,
  DAY_KEYS,
} from '@/config/site';

const CACHE_KEY = 'site_settings';
const LOCAL_KEY = 'bph_site_settings';
const ROW_ID = 1;

export { DAY_KEYS, DEFAULT_DAY_HOURS, INITIAL_HOURS };

function normalizeHours(raw) {
  const base = { ...INITIAL_HOURS };
  if (!raw || typeof raw !== 'object') return base;
  for (const day of DAY_KEYS) {
    const d = raw[day];
    if (d && typeof d === 'object') {
      base[day] = {
        open: d.open || DEFAULT_DAY_HOURS.open,
        close: d.close || DEFAULT_DAY_HOURS.close,
        closed: Boolean(d.closed),
      };
    }
  }
  return base;
}

function normalizePhones(raw) {
  const list = Array.isArray(raw) ? raw : CONTACT_DEFAULTS.phones;
  return list.map((p) => String(p).replace(/\D/g, '').slice(-10)).filter(Boolean);
}

function mapRow(data) {
  const address = {
    line: data.address_line || CONTACT_DEFAULTS.address.line,
    city: data.address_city || CONTACT_DEFAULTS.address.city,
    state: data.address_state || CONTACT_DEFAULTS.address.state,
    pincode: data.address_pincode || CONTACT_DEFAULTS.address.pincode,
    country: data.address_country || CONTACT_DEFAULTS.address.country,
  };
  address.full = buildAddressFull(address);

  const phones = normalizePhones(data.phones);
  const whatsapp = (data.whatsapp || CONTACT_DEFAULTS.whatsapp).replace(/\D/g, '');

  return mergeSiteSettings({
    phones: phones.length ? phones : CONTACT_DEFAULTS.phones,
    whatsapp: whatsapp || CONTACT_DEFAULTS.whatsapp,
    address,
    maps: {
      link: data.maps_link || CONTACT_DEFAULTS.maps.link,
      embed: data.maps_embed || CONTACT_DEFAULTS.maps.embed,
    },
    hours: normalizeHours(data.hours),
  });
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? mapRow(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocal(settings) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({
      phones: settings.phones,
      whatsapp: settings.whatsapp,
      address_line: settings.address.line,
      address_city: settings.address.city,
      address_state: settings.address.state,
      address_pincode: settings.address.pincode,
      address_country: settings.address.country,
      maps_link: settings.maps.link,
      maps_embed: settings.maps.embed,
      hours: settings.hours,
    }));
  } catch (_) { /* ignore */ }
}

export function getDefaultSiteSettings() {
  return mergeSiteSettings({
    ...CONTACT_DEFAULTS,
    hours: { ...INITIAL_HOURS },
  });
}

export async function getSiteSettings() {
  return fetchWithCache(CACHE_KEY, async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', ROW_ID)
        .single();
      if (!error && data) return mapRow(data);
    }
    return readLocal() || getDefaultSiteSettings();
  }, 10 * 60);
}

export async function saveSiteSettings(settings) {
  const phones = normalizePhones(settings.phones);
  if (!phones.length) throw new Error('At least one phone number is required.');

  const address = settings.address || {};
  const hours = normalizeHours(settings.hours);
  const merged = mergeSiteSettings({
    phones,
    whatsapp: (settings.whatsapp || phones[0]).replace(/\D/g, '').replace(/^(\d{10})$/, '91$1'),
    address: {
      ...address,
      full: buildAddressFull(address),
    },
    maps: settings.maps || CONTACT_DEFAULTS.maps,
    hours,
  });

  if (isSupabaseConfigured && supabase) {
    clearCache(CACHE_KEY);
    const row = {
      id: ROW_ID,
      phones: merged.phones,
      whatsapp: merged.whatsapp,
      address_line: merged.address.line,
      address_city: merged.address.city,
      address_state: merged.address.state,
      address_pincode: merged.address.pincode,
      address_country: merged.address.country,
      maps_link: merged.maps.link,
      maps_embed: merged.maps.embed,
      hours: merged.hours,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('site_settings').upsert(row);
    if (error) throw error;
  } else {
    writeLocal(merged);
    clearCache(CACHE_KEY);
  }

  return merged;
}

export function applyDefaultHoursToAll(hours) {
  const next = { ...hours };
  for (const day of DAY_KEYS) {
    next[day] = { ...DEFAULT_DAY_HOURS };
  }
  return next;
}

export function resetHoursToInitial() {
  return { ...INITIAL_HOURS };
}
