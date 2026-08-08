import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { EVENT } from '@/lib/tracking';
import { fetchWithCache } from '@/lib/cache';
import { computeValueBadges } from '@/lib/valueBadges';

const MS_DAY = 86400000;
const MS_WEEK = 7 * MS_DAY;
const MS_MONTH = 30 * MS_DAY;

function localEvents() {
  try {
    return JSON.parse(localStorage.getItem('bph_events') || '[]');
  } catch {
    return [];
  }
}

function normalizeEvent(row) {
  if (row.type) {
    return { type: row.type, meta: row.meta || {}, at: row.at, visitorId: row.visitorId };
  }
  return {
    type: row.event_type,
    meta: row.meta || {},
    at: row.created_at,
    visitorId: row.visitor_id,
  };
}

export async function fetchRawEvents(limit = 8000) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.rpc('get_analytics_events', {
      p_limit: limit,
    });
    if (error) {
      console.warn('[Analytics] get_analytics_events failed:', error.message);
      return localEvents().map(normalizeEvent);
    }
    return (data || []).map(normalizeEvent);
  }
  return localEvents().map(normalizeEvent);
}

/** Group events by visitor_id for lead enrichment */
export async function getVisitorEventsMap() {
  const events = await fetchRawEvents();
  const map = {};
  for (const e of events) {
    const vid = e.visitorId || 'unknown';
    if (!map[vid]) map[vid] = [];
    map[vid].push(e);
  }
  return map;
}

function scooterKey(meta) {
  return meta?.scooterId || meta?.name || null;
}

function inWindow(at, ms) {
  if (!at) return false;
  return Date.now() - new Date(at).getTime() <= ms;
}

/**
 * Popularity engine — real website behaviour.
 * mostViewedWeek: SCOOTER_VIEW in last 7 days
 * topIntentMonth: test rides + EMI + callbacks per scooter in last 30 days (purchase proxy)
 */
export async function getPopularityEngine() {
  return fetchWithCache('popularity_engine', async () => {
    const events = await fetchRawEvents();
    const viewsWeek = {};
    const intentMonth = {};

    for (const e of events) {
      const key = scooterKey(e.meta);
      if (!key) continue;

      if (e.type === EVENT.SCOOTER_VIEW && inWindow(e.at, MS_WEEK)) {
        viewsWeek[key] = (viewsWeek[key] || 0) + 1;
      }

      if (inWindow(e.at, MS_MONTH)) {
        if (e.type === EVENT.TEST_RIDE_BOOKED) {
          intentMonth[key] = (intentMonth[key] || 0) + 10;
        } else if (e.type === EVENT.CALLBACK_REQUEST && e.meta?.scooterId) {
          intentMonth[key] = (intentMonth[key] || 0) + 8;
        } else if (e.type === EVENT.EMI_USED && e.meta?.scooterId) {
          intentMonth[key] = (intentMonth[key] || 0) + 5;
        } else if (e.type === EVENT.SCOOTER_VIEW) {
          intentMonth[key] = (intentMonth[key] || 0) + 1;
        }
      }
    }

    const toRanked = (obj, labelKey) =>
      Object.entries(obj)
        .map(([id, value]) => ({ id, label: id, [labelKey]: value, value }))
        .sort((a, b) => b.value - a.value);

    const mostViewedWeek = toRanked(viewsWeek, 'views').slice(0, 5);
    const mostIntentMonth = toRanked(intentMonth, 'intentScore').slice(0, 5);

    const popularWeekIds = new Set(mostViewedWeek.slice(0, 3).map((x) => x.id));
    const topIntentMonthIds = new Set(mostIntentMonth.slice(0, 3).map((x) => x.id));

    return {
      mostViewedWeek,
      mostIntentMonth,
      popularWeekIds,
      topIntentMonthIds,
    };
  }, 5 * 60);
}

/** Value badges + popularity tags for catalog pages */
export async function getScooterInsights(scooters = []) {
  const [popularity, badgeMap] = await Promise.all([
    getPopularityEngine(),
    Promise.resolve(computeValueBadges(scooters)),
  ]);

  const resolveNames = (ranked) =>
    ranked.map((row) => {
      const match = scooters.find((s) => s.id === row.id || s.name === row.id);
      return { ...row, label: match?.name || row.id, scooter: match || null };
    });

  return {
    valueBadges: badgeMap,
    mostViewedWeek: resolveNames(popularity.mostViewedWeek),
    mostIntentMonth: resolveNames(popularity.mostIntentMonth),
    popularWeekIds: popularity.popularWeekIds,
    topIntentMonthIds: popularity.topIntentMonthIds,
  };
}
