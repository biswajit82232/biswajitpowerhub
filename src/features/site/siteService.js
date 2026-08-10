import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import {
  CONTACT_DEFAULTS,
  buildAddressFull,
  mergeSiteSettings,
  INITIAL_HOURS,
  DEFAULT_DAY_HOURS,
  DAY_KEYS,
  PREMIUM_PERKS,
  DEFAULT_RANGE_TABS,
  BATTERY_UPGRADE_TAGLINE,
  GBP_RATING,
  SITE,
} from '@/config/site';
import { SITE_FAQS } from '@/data/seoContent';

const CACHE_KEY = 'site_settings_v4';
const LEGACY_CACHE_KEY = 'site_settings';
const LOCAL_KEY = 'bph_site_settings';
const ROW_ID = 1;
const CACHE_TTL = 30;

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

function defaultContent() {
  return {
    branding: {
      name: SITE.name,
      tagline: SITE.tagline,
      description: SITE.description,
      shortName: SITE.shortName,
    },
    social: { ...SITE.social },
    geo: {
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
      placeId: SITE.maps.placeId,
    },
    gbp: { ...GBP_RATING },
    perks: PREMIUM_PERKS.map((p) => ({ ...p })),
    faqs: SITE_FAQS.map((f) => ({ ...f })),
    rangeTabs: DEFAULT_RANGE_TABS.map((t) => ({ ...t })),
    batteryUpgradeTagline: BATTERY_UPGRADE_TAGLINE,
  };
}

function normalizeContent(raw) {
  const base = defaultContent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    branding: { ...base.branding, ...(raw.branding || {}) },
    social: { ...base.social, ...(raw.social || {}) },
    geo: { ...base.geo, ...(raw.geo || {}) },
    gbp: { ...base.gbp, ...(raw.gbp || {}) },
    perks: Array.isArray(raw.perks) && raw.perks.length ? raw.perks : base.perks,
    faqs: Array.isArray(raw.faqs) && raw.faqs.length ? raw.faqs : base.faqs,
    rangeTabs: Array.isArray(raw.rangeTabs) && raw.rangeTabs.length ? raw.rangeTabs : base.rangeTabs,
    batteryUpgradeTagline: raw.batteryUpgradeTagline || base.batteryUpgradeTagline,
  };
}

function mapRow(data) {
  const address = {
    line: data.address_line || CONTACT_DEFAULTS.address.line,
    city: data.address_city || CONTACT_DEFAULTS.address.city,
    district: data.address_district || CONTACT_DEFAULTS.address.district,
    state: data.address_state || CONTACT_DEFAULTS.address.state,
    pincode: data.address_pincode || CONTACT_DEFAULTS.address.pincode,
    country: data.address_country || CONTACT_DEFAULTS.address.country,
  };
  address.full = buildAddressFull(address);

  const phones = normalizePhones(data.phones);
  const whatsapp = (data.whatsapp || CONTACT_DEFAULTS.whatsapp).replace(/\D/g, '');
  const content = normalizeContent(data.content);

  return mergeSiteSettings({
    phones: phones.length ? phones : CONTACT_DEFAULTS.phones,
    whatsapp: whatsapp || CONTACT_DEFAULTS.whatsapp,
    address,
    maps: {
      link: data.maps_link || CONTACT_DEFAULTS.maps.link,
      embed: data.maps_embed || CONTACT_DEFAULTS.maps.embed,
      placeId: content.geo.placeId || CONTACT_DEFAULTS.maps.placeId,
    },
    hours: normalizeHours(data.hours),
    content,
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

function contentPayload(settings) {
  return {
    branding: {
      name: settings.name,
      tagline: settings.tagline,
      description: settings.description,
      shortName: settings.shortName,
    },
    social: settings.social || {},
    geo: {
      latitude: settings.geo?.latitude,
      longitude: settings.geo?.longitude,
      placeId: settings.maps?.placeId || settings.geo?.placeId,
    },
    gbp: settings.gbp || { ...GBP_RATING },
    perks: settings.perks || [],
    faqs: settings.faqs || [],
    rangeTabs: settings.rangeTabs || DEFAULT_RANGE_TABS,
    batteryUpgradeTagline: settings.batteryUpgradeTagline || BATTERY_UPGRADE_TAGLINE,
  };
}

function writeLocal(settings) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({
      phones: settings.phones,
      whatsapp: settings.whatsapp,
      address_line: settings.address.line,
      address_city: settings.address.city,
      address_district: settings.address.district,
      address_state: settings.address.state,
      address_pincode: settings.address.pincode,
      address_country: settings.address.country,
      maps_link: settings.maps.link,
      maps_embed: settings.maps.embed,
      hours: settings.hoursPerDay || settings.hours,
      content: contentPayload(settings),
    }));
  } catch (_) { /* ignore */ }
}

function bustSiteCache() {
  clearCache(CACHE_KEY);
  clearCache(LEGACY_CACHE_KEY);
  clearCache('site_settings_v3');
}

export function getDefaultSiteSettings() {
  return mergeSiteSettings({
    ...CONTACT_DEFAULTS,
    hours: { ...INITIAL_HOURS },
    content: defaultContent(),
  });
}

export async function getSiteSettings({ bypassCache = false } = {}) {
  if (bypassCache) bustSiteCache();

  return fetchWithCache(CACHE_KEY, async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', ROW_ID)
        .maybeSingle();

      if (!error && data) return mapRow(data);

      if (!error) return getDefaultSiteSettings();

      if (error?.code === '42P01') {
        return getDefaultSiteSettings();
      }

      console.warn('[Site settings] Supabase fetch failed:', error.message);
      return getDefaultSiteSettings();
    }

    return readLocal() || getDefaultSiteSettings();
  }, CACHE_TTL);
}

export async function saveSiteSettings(settings) {
  const phones = normalizePhones(settings.phones);
  if (!phones.length) throw new Error('At least one phone number is required.');

  const address = settings.address || {};
  const hours = normalizeHours(settings.hours);
  const content = contentPayload(settings);
  const merged = mergeSiteSettings({
    phones,
    whatsapp: (settings.whatsapp || phones[0]).replace(/\D/g, '').replace(/^(\d{10})$/, '91$1'),
    address: {
      ...address,
      full: buildAddressFull(address),
    },
    maps: {
      ...(settings.maps || CONTACT_DEFAULTS.maps),
      placeId: content.geo.placeId || settings.maps?.placeId,
    },
    hours,
    content,
  });

  if (isSupabaseConfigured && supabase) {
    bustSiteCache();
    const row = {
      id: ROW_ID,
      phones: merged.phones,
      whatsapp: merged.whatsapp,
      address_line: merged.address.line,
      address_city: merged.address.city,
      address_district: merged.address.district,
      address_state: merged.address.state,
      address_pincode: merged.address.pincode,
      address_country: merged.address.country,
      maps_link: merged.maps.link,
      maps_embed: merged.maps.embed,
      hours: merged.hoursPerDay || hours,
      content,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('site_settings').upsert(row);
    if (error) throw error;
  } else {
    writeLocal(merged);
    bustSiteCache();
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
