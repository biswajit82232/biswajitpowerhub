import { supabase, isSupabaseConfigured } from './supabase.js';
import { trackGAEvent } from './googleAnalytics.js';
import { clearCache } from './cache.js';
import { withTimeout, FETCH_TIMEOUT_MS } from './utils.js';
import { attributionPayload } from './attribution.js';

/**
 * Lead tracking & scoring engine.
 *
 * Dedupes noisy events (refresh / remount / SPA re-entry) so admin metrics
 * and purchase-readiness scores stay trustworthy.
 */

const VISITOR_KEY = 'bph_visitor_id';
const EVENTS_KEY = 'bph_events';
const DEDUPE_KEY = 'bph_track_dedupe';

/** Same path/scooter won't re-count inside this window (ms). */
const DEDUPE_MS = {
  page_view: 30 * 60 * 1000, // 30 min — refresh shouldn't inflate visits
  scooter_view: 15 * 60 * 1000,
  emi_calculator_used: 10 * 60 * 1000,
  simulator_used: 10 * 60 * 1000,
  compare_used: 10 * 60 * 1000,
};

export const EVENT = {
  PAGE_VIEW: 'page_view',
  SCOOTER_VIEW: 'scooter_view',
  EMI_USED: 'emi_calculator_used',
  SIMULATOR_USED: 'simulator_used',
  WHATSAPP_CLICK: 'whatsapp_click',
  CALL_CLICK: 'call_click',
  DIRECTIONS_CLICK: 'directions_click',
  CALLBACK_REQUEST: 'callback_request',
  TEST_RIDE_BOOKED: 'test_ride_booked',
  SERVICE_BOOKED: 'service_booked',
  CONTACT_FORM: 'contact_form',
  COMPARE_USED: 'compare_used',
};

/** Points awarded per event type for lead scoring. */
const SCORE_WEIGHTS = {
  [EVENT.PAGE_VIEW]: 1,
  [EVENT.SCOOTER_VIEW]: 4,
  [EVENT.EMI_USED]: 15,
  [EVENT.SIMULATOR_USED]: 15,
  [EVENT.COMPARE_USED]: 8,
  [EVENT.WHATSAPP_CLICK]: 20,
  [EVENT.CALL_CLICK]: 18,
  [EVENT.DIRECTIONS_CLICK]: 22,
  [EVENT.CALLBACK_REQUEST]: 30,
  [EVENT.TEST_RIDE_BOOKED]: 35,
  [EVENT.SERVICE_BOOKED]: 32,
  [EVENT.CONTACT_FORM]: 25,
};

const POPULARITY_EVENTS = new Set([
  EVENT.SCOOTER_VIEW,
  EVENT.EMI_USED,
  EVENT.TEST_RIDE_BOOKED,
  EVENT.CALLBACK_REQUEST,
]);

let popularityBustTimer;

function schedulePopularityCacheBust() {
  if (typeof window === 'undefined') return;
  clearTimeout(popularityBustTimer);
  popularityBustTimer = setTimeout(() => clearCache('popularity_engine'), 3000);
}

let fallbackVisitorId = null;

function newVisitorId() {
  return 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function getVisitorId() {
  if (typeof window === 'undefined') return null;
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = newVisitorId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // Private mode / blocked storage throws here. Lead submits call this first,
    // so fall back to a session-lived id rather than failing the form.
    fallbackVisitorId = fallbackVisitorId || newVisitorId();
    return fallbackVisitorId;
  }
}

function readLocalEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalEvents(events) {
  try {
    const trimmed = events.slice(-400);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore quota errors */
  }
}

function readDedupeMap() {
  try {
    return JSON.parse(sessionStorage.getItem(DEDUPE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeDedupeMap(map) {
  try {
    sessionStorage.setItem(DEDUPE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function dedupeKey(type, meta = {}) {
  if (type === EVENT.PAGE_VIEW) return `page:${meta.path || '/'}`;
  if (type === EVENT.SCOOTER_VIEW) return `scooter:${meta.scooterId || meta.name || 'unknown'}`;
  if (type === EVENT.EMI_USED) return `emi:${meta.scooterId || 'site'}`;
  if (type === EVENT.SIMULATOR_USED) return `sim:${meta.scooterId || 'site'}`;
  if (type === EVENT.COMPARE_USED) return `compare:${(meta.ids || []).slice().sort().join(',') || 'x'}`;
  return null;
}

/** Returns true when this event should be skipped (already counted recently). */
function shouldDedupe(type, meta = {}) {
  const windowMs = DEDUPE_MS[type];
  const key = dedupeKey(type, meta);
  if (!windowMs || !key || typeof sessionStorage === 'undefined') return false;

  const map = readDedupeMap();
  const prev = map[key];
  const now = Date.now();
  if (prev && now - prev < windowMs) return true;

  map[key] = now;
  // Bound map size
  const entries = Object.entries(map);
  if (entries.length > 80) {
    entries
      .sort((a, b) => a[1] - b[1])
      .slice(0, entries.length - 60)
      .forEach(([k]) => { delete map[k]; });
  }
  writeDedupeMap(map);
  return false;
}

function isAdminPath(path = '') {
  return path === '/admin' || path.startsWith('/admin/');
}

/**
 * Record an interaction event.
 * @param {string} type one of EVENT
 * @param {object} meta arbitrary context (scooterId, name, etc.)
 * @returns {Promise<boolean>} true when persisted (not deduped)
 */
export async function trackEvent(type, meta = {}) {
  if (typeof window === 'undefined') return false;

  // Never count admin panel traffic as site visits / leads
  if (type === EVENT.PAGE_VIEW && isAdminPath(meta.path || '')) return false;

  if (shouldDedupe(type, meta)) {
    // Still fire GA page_view navigation for Ads/Analytics accuracy when path changes,
    // but skip our lead_events / scoring store for refresh spam.
    if (type !== EVENT.PAGE_VIEW) return false;
    trackGAEvent(type, meta);
    return false;
  }

  trackGAEvent(type, meta);

  const visitorId = getVisitorId();
  const attr = attributionPayload();
  const mergedMeta = attr ? { ...meta, channel: attr.channel, utm_source: attr.source, utm_medium: attr.medium, utm_campaign: attr.campaign, landing: attr.landing } : meta;
  const event = {
    type,
    meta: mergedMeta,
    visitorId,
    at: new Date().toISOString(),
  };

  const events = readLocalEvents();
  events.push(event);
  writeLocalEvents(events);

  if (isSupabaseConfigured && supabase) {
    // Fire-and-forget: never block a lead form or page render on analytics.
    withTimeout(
      supabase.from('lead_events').insert({
        visitor_id: visitorId,
        event_type: type,
        meta: mergedMeta,
      }),
      FETCH_TIMEOUT_MS,
      'Tracking insert timed out',
    )
      .then(({ error }) => {
        if (error) console.warn('[Tracking] lead_events insert failed:', error.message);
      })
      .catch((err) => {
        console.warn('[Tracking] lead_events insert failed:', err.message);
      });
  }

  if (POPULARITY_EVENTS.has(type)) {
    schedulePopularityCacheBust();
  }

  return true;
}

/**
 * Compute a lead score & classification from a list of events.
 */
export function classifyLead(events = []) {
  let score = 0;
  const counts = {};
  const scooterViews = {};
  const visits = new Set();
  let pageViewsCounted = 0;

  for (const e of events) {
    // Cap page_view contribution — refresh spam must not create "hot" leads
    if (e.type === EVENT.PAGE_VIEW) {
      pageViewsCounted += 1;
      if (pageViewsCounted <= 5) score += SCORE_WEIGHTS[EVENT.PAGE_VIEW];
    } else {
      score += SCORE_WEIGHTS[e.type] || 0;
    }
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (e.type === EVENT.SCOOTER_VIEW && e.meta?.scooterId) {
      scooterViews[e.meta.scooterId] = (scooterViews[e.meta.scooterId] || 0) + 1;
    }
    if (e.at || e.created_at) {
      visits.add(new Date(e.at || e.created_at).toDateString());
    }
  }

  const repeatedSameScooter = Object.values(scooterViews).some((c) => c >= 2);
  const formOrChat =
    (counts[EVENT.CALLBACK_REQUEST] || 0) > 0 ||
    (counts[EVENT.TEST_RIDE_BOOKED] || 0) > 0 ||
    (counts[EVENT.SERVICE_BOOKED] || 0) > 0 ||
    (counts[EVENT.WHATSAPP_CLICK] || 0) > 0 ||
    (counts[EVENT.CALL_CLICK] || 0) > 0 ||
    (counts[EVENT.CONTACT_FORM] || 0) > 0;

  const engaged =
    (counts[EVENT.EMI_USED] || 0) > 0 ||
    (counts[EVENT.SIMULATOR_USED] || 0) > 0 ||
    repeatedSameScooter;

  const totalScooterViews = counts[EVENT.SCOOTER_VIEW] || 0;
  const multipleVisits = visits.size >= 2;

  let classification = 'cold';
  if (formOrChat) classification = 'hot';
  else if (engaged || score >= 40) classification = 'warm';
  else if (multipleVisits || totalScooterViews >= 2 || score >= 10) classification = 'warm';

  return { score, classification, counts, visits: visits.size };
}

/** Local summary for the current visitor (used by lead enrichment on submit). */
export function getLocalLeadSummary() {
  const events = readLocalEvents();
  return { events, ...classifyLead(events) };
}

/** Clear locally stored interaction events (demo / offline analytics). */
export function resetLocalTrackingEvents() {
  try {
    localStorage.removeItem(EVENTS_KEY);
    sessionStorage.removeItem(DEDUPE_KEY);
  } catch {
    /* ignore */
  }
}
