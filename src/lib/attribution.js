/**
 * First-touch marketing attribution (UTM, gclid, referrer).
 * Sticky in localStorage so later form submits still know how the visit started.
 */

export const ATTRIBUTION_KEY = 'bph_attribution';

export const CHANNEL = {
  ADS: 'ads',
  ORGANIC: 'organic',
  DIRECT: 'direct',
  REFERRAL: 'referral',
  WALK_IN: 'walk-in',
  UNKNOWN: 'unknown',
};

export const CHANNEL_LABELS = {
  [CHANNEL.ADS]: 'Google Ads',
  [CHANNEL.ORGANIC]: 'Organic / SEO',
  [CHANNEL.DIRECT]: 'Direct',
  [CHANNEL.REFERRAL]: 'Referral',
  [CHANNEL.WALK_IN]: 'Walk-in',
  [CHANNEL.UNKNOWN]: 'Unknown',
};

export const CHANNEL_ORDER = [
  CHANNEL.ADS,
  CHANNEL.ORGANIC,
  CHANNEL.DIRECT,
  CHANNEL.REFERRAL,
  CHANNEL.WALK_IN,
  CHANNEL.UNKNOWN,
];

const PAID_MEDIUM = new Set(['cpc', 'ppc', 'paid', 'paid-search', 'paidsearch', 'display', 'cpm', 'cpv']);
const PAID_SOURCE = new Set(['googleads', 'google-ads', 'google_ads', 'gads']);

function paramsFrom(search) {
  if (search instanceof URLSearchParams) return search;
  const raw = String(search || '');
  return new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
}

function sameHost(referrer, host) {
  if (!referrer || !host) return false;
  try {
    return new URL(referrer).host.replace(/^www\./, '') === String(host).replace(/^www\./, '');
  } catch {
    return false;
  }
}

export function classifyChannel({ searchParams, referrer = '', host = '' } = {}) {
  const p = paramsFrom(searchParams);
  const src = (p.get('utm_source') || p.get('source') || '').trim().toLowerCase();
  const medium = (p.get('utm_medium') || '').trim().toLowerCase();
  const walk = (p.get('src') || src || '').toLowerCase();
  const gclid = (p.get('gclid') || p.get('gbraid') || p.get('wbraid') || '').trim();

  if (walk === 'walk-in' || walk === 'walkin' || src === 'walk-in' || src === 'showroom') {
    return CHANNEL.WALK_IN;
  }
  if (gclid || PAID_MEDIUM.has(medium) || PAID_SOURCE.has(src)) return CHANNEL.ADS;
  if (src) {
    if (medium === 'organic' || src === 'google' && medium === 'organic') return CHANNEL.ORGANIC;
    if (medium === 'organic') return CHANNEL.ORGANIC;
    return CHANNEL.REFERRAL;
  }

  if (referrer && !sameHost(referrer, host)) {
    try {
      const refHost = new URL(referrer).hostname.toLowerCase();
      if (refHost.includes('google.') || refHost === 'google.com') return CHANNEL.ORGANIC;
      return CHANNEL.REFERRAL;
    } catch {
      return CHANNEL.REFERRAL;
    }
  }

  return CHANNEL.DIRECT;
}

export function buildAttribution({ search = '', referrer = '', host = '', path = '/' } = {}) {
  const p = paramsFrom(search);
  const channel = classifyChannel({ searchParams: p, referrer, host });
  const source = (p.get('utm_source') || p.get('source') || '').trim() || null;
  const medium = (p.get('utm_medium') || '').trim() || null;
  const campaign = (p.get('utm_campaign') || '').trim() || null;
  const content = (p.get('utm_content') || '').trim() || null;
  const term = (p.get('utm_term') || '').trim() || null;
  const gclid = (p.get('gclid') || p.get('gbraid') || p.get('wbraid') || '').trim() || null;
  const landing = path || '/';

  const hasSignal = Boolean(source || medium || campaign || gclid || (referrer && !sameHost(referrer, host)));

  return {
    channel,
    source,
    medium,
    campaign,
    content,
    term,
    gclid,
    landing,
    referrer: referrer && !sameHost(referrer, host) ? String(referrer).slice(0, 300) : null,
    capturedAt: new Date().toISOString(),
    hasSignal,
  };
}

export function mergeFirstTouch(existing, incoming) {
  if (!incoming) return existing || null;
  if (!existing) return incoming;
  if (existing.channel === CHANNEL.DIRECT && incoming.channel !== CHANNEL.DIRECT) {
    return { ...incoming, firstLanding: existing.landing || incoming.landing };
  }
  return existing;
}

function readStored() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function getStoredAttribution() {
  return readStored();
}

export function captureAttribution({ search = '', referrer = '', host = '', path = '/' } = {}) {
  const incoming = buildAttribution({ search, referrer, host, path });
  const merged = mergeFirstTouch(readStored(), incoming);
  writeStored(merged);
  return merged;
}

/** Capture from the current window + React Router location. */
export function captureFromLocation(location) {
  if (typeof window === 'undefined' || !location) return getStoredAttribution();
  return captureAttribution({
    search: location.search || '',
    referrer: document.referrer || '',
    host: window.location.host,
    path: location.pathname || '/',
  });
}

/** Compact payload for lead_events meta and form inserts. */
export function attributionPayload(attr = getStoredAttribution()) {
  if (!attr) return null;
  return {
    channel: attr.channel || CHANNEL.UNKNOWN,
    source: attr.source || null,
    medium: attr.medium || null,
    campaign: attr.campaign || null,
    content: attr.content || null,
    term: attr.term || null,
    gclid: attr.gclid || null,
    landing: attr.landing || null,
  };
}

export function channelFromLead(lead, pageViewByVisitor = new Map()) {
  const fromCol = lead?.attribution?.channel;
  if (fromCol) return fromCol;
  const fromVisitor = pageViewByVisitor.get(lead?.visitor_id);
  if (fromVisitor) return fromVisitor;
  return CHANNEL.UNKNOWN;
}
