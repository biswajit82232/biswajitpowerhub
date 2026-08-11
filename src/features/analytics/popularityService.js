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

function bump(map, key, n = 1) {
  if (!key) return;
  map[key] = (map[key] || 0) + n;
}

function toRanked(obj, labelKey) {
  return Object.entries(obj)
    .map(([id, value]) => ({ id, label: id, [labelKey]: value, value }))
    .sort((a, b) => b.value - a.value);
}

function toCountMap(obj) {
  return new Map(Object.entries(obj));
}

/**
 * Popularity engine — real website behaviour + catalog fame inputs.
 */
export async function getPopularityEngine() {
  return fetchWithCache('popularity_engine', async () => {
    const events = await fetchRawEvents();
    const viewsWeek = {};
    const viewsMonth = {};
    const viewsAllTime = {};
    const intentMonth = {};

    for (const e of events) {
      const key = scooterKey(e.meta);
      if (!key) continue;

      if (e.type === EVENT.SCOOTER_VIEW) {
        bump(viewsAllTime, key);
        if (inWindow(e.at, MS_WEEK)) bump(viewsWeek, key);
        if (inWindow(e.at, MS_MONTH)) bump(viewsMonth, key);
      }

      if (inWindow(e.at, MS_MONTH)) {
        if (e.type === EVENT.TEST_RIDE_BOOKED) bump(intentMonth, key, 10);
        else if (e.type === EVENT.CALLBACK_REQUEST && (e.meta?.scooterId || e.meta?.interest)) {
          bump(intentMonth, key, 8);
        } else if (e.type === EVENT.EMI_USED && e.meta?.scooterId) bump(intentMonth, key, 5);
        else if (e.type === EVENT.SIMULATOR_USED && e.meta?.scooterId) bump(intentMonth, key, 4);
        else if (e.type === EVENT.SCOOTER_VIEW) bump(intentMonth, key, 1);
      }
    }

    const mostViewedWeek = toRanked(viewsWeek, 'views').slice(0, 5);
    const mostViewedMonth = toRanked(viewsMonth, 'views').slice(0, 5);
    const mostViewedAllTime = toRanked(viewsAllTime, 'views').slice(0, 5);
    const mostIntentMonth = toRanked(intentMonth, 'intentScore').slice(0, 5);

    const popularWeekIds = new Set(mostViewedWeek.slice(0, 3).map((x) => x.id));
    const topIntentMonthIds = new Set(mostIntentMonth.slice(0, 3).map((x) => x.id));
    const famousIds = new Set([
      ...mostViewedWeek.slice(0, 2).map((x) => x.id),
      ...mostIntentMonth.slice(0, 2).map((x) => x.id),
      ...mostViewedMonth.slice(0, 2).map((x) => x.id),
    ]);

    const totalViewsWeek = Object.values(viewsWeek).reduce((a, b) => a + b, 0);
    const totalViewsMonth = Object.values(viewsMonth).reduce((a, b) => a + b, 0);
    const totalViewsAllTime = Object.values(viewsAllTime).reduce((a, b) => a + b, 0);

    return {
      mostViewedWeek,
      mostViewedMonth,
      mostViewedAllTime,
      mostIntentMonth,
      popularWeekIds,
      topIntentMonthIds,
      famousIds,
      viewsWeekMap: toCountMap(viewsWeek),
      viewsMonthMap: toCountMap(viewsMonth),
      viewsAllTimeMap: toCountMap(viewsAllTime),
      intentMonthMap: toCountMap(intentMonth),
      totalViewsWeek,
      totalViewsMonth,
      totalViewsAllTime,
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

  // Normalize id sets to include both id and name for matching
  const expandSet = (set) => {
    const out = new Set(set);
    for (const key of set) {
      const match = scooters.find((s) => s.id === key || s.name === key);
      if (match) {
        out.add(match.id);
        out.add(match.name);
      }
    }
    return out;
  };

  return {
    valueBadges: badgeMap,
    mostViewedWeek: resolveNames(popularity.mostViewedWeek),
    mostViewedMonth: resolveNames(popularity.mostViewedMonth),
    mostViewedAllTime: resolveNames(popularity.mostViewedAllTime),
    mostIntentMonth: resolveNames(popularity.mostIntentMonth),
    popularWeekIds: expandSet(popularity.popularWeekIds),
    topIntentMonthIds: expandSet(popularity.topIntentMonthIds),
    famousIds: expandSet(popularity.famousIds),
    viewsWeekMap: popularity.viewsWeekMap,
    viewsMonthMap: popularity.viewsMonthMap,
    viewsAllTimeMap: popularity.viewsAllTimeMap,
    intentMonthMap: popularity.intentMonthMap,
    totalViewsWeek: popularity.totalViewsWeek,
    totalViewsMonth: popularity.totalViewsMonth,
    totalViewsAllTime: popularity.totalViewsAllTime,
  };
}
