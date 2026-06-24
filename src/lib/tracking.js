import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Lead tracking & scoring engine (Phase 5).
 *
 * A persistent anonymous visitor id is stored in localStorage. Every meaningful
 * interaction is recorded as an event (locally + Supabase when configured).
 * Events feed a scoring model that classifies a visitor as Hot / Warm / Cold.
 */

const VISITOR_KEY = 'bph_visitor_id';
const EVENTS_KEY = 'bph_events';

export const EVENT = {
  PAGE_VIEW: 'page_view',
  SCOOTER_VIEW: 'scooter_view',
  EMI_USED: 'emi_calculator_used',
  SIMULATOR_USED: 'simulator_used',
  WHATSAPP_CLICK: 'whatsapp_click',
  CALL_CLICK: 'call_click',
  CALLBACK_REQUEST: 'callback_request',
  TEST_RIDE_BOOKED: 'test_ride_booked',
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
  [EVENT.CALLBACK_REQUEST]: 30,
  [EVENT.TEST_RIDE_BOOKED]: 35,
  [EVENT.CONTACT_FORM]: 25,
};

export function getVisitorId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id =
      'v_' +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 10);
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
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
    // Keep the log bounded
    const trimmed = events.slice(-400);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Record an interaction event.
 * @param {string} type one of EVENT
 * @param {object} meta arbitrary context (scooterId, name, etc.)
 */
export async function trackEvent(type, meta = {}) {
  if (typeof window === 'undefined') return;
  const visitorId = getVisitorId();
  const event = {
    type,
    meta,
    visitorId,
    at: new Date().toISOString(),
  };

  const events = readLocalEvents();
  events.push(event);
  writeLocalEvents(events);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('lead_events').insert({
        visitor_id: visitorId,
        event_type: type,
        meta,
      });
    } catch {
      /* fail silently — analytics must never break UX */
    }
  }
}

/**
 * Compute a lead score & classification from a list of events.
 * Mirrors the business rules:
 *  - Hot: high-intent actions (EMI, simulator, callback, test ride, whatsapp,
 *    or viewing the same scooter multiple times)
 *  - Warm: multiple visits or multiple scooter views
 *  - Cold: single visit
 */
export function classifyLead(events = []) {
  let score = 0;
  const counts = {};
  const scooterViews = {};
  const visits = new Set();

  for (const e of events) {
    score += SCORE_WEIGHTS[e.type] || 0;
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (e.type === EVENT.SCOOTER_VIEW && e.meta?.scooterId) {
      scooterViews[e.meta.scooterId] = (scooterViews[e.meta.scooterId] || 0) + 1;
    }
    if (e.at) visits.add(new Date(e.at).toDateString());
  }

  const repeatedSameScooter = Object.values(scooterViews).some((c) => c >= 2);
  const highIntent =
    (counts[EVENT.EMI_USED] || 0) > 0 ||
    (counts[EVENT.SIMULATOR_USED] || 0) > 0 ||
    (counts[EVENT.CALLBACK_REQUEST] || 0) > 0 ||
    (counts[EVENT.TEST_RIDE_BOOKED] || 0) > 0 ||
    (counts[EVENT.WHATSAPP_CLICK] || 0) > 0 ||
    (counts[EVENT.CONTACT_FORM] || 0) > 0 ||
    repeatedSameScooter;

  const totalScooterViews = counts[EVENT.SCOOTER_VIEW] || 0;
  const multipleVisits = visits.size >= 2;

  let classification = 'cold';
  if (highIntent || score >= 30) classification = 'hot';
  else if (multipleVisits || totalScooterViews >= 2 || score >= 10) classification = 'warm';

  return { score, classification, counts, visits: visits.size };
}

/** Local summary for the current visitor (used by lead enrichment on submit). */
export function getLocalLeadSummary() {
  const events = readLocalEvents();
  return { events, ...classifyLead(events) };
}
