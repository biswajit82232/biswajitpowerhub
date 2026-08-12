import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { EVENT, resetLocalTrackingEvents } from '@/lib/tracking';
import { clearCache } from '@/lib/cache';
import { withTimeout, FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS } from '@/lib/utils';

/** Read all local events (demo-mode source of truth). */
function localEvents() {
  try {
    return JSON.parse(localStorage.getItem('bph_events') || '[]');
  } catch {
    return [];
  }
}

async function countRows(table, filter) {
  if (!isSupabaseConfigured || !supabase) return 0;
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  try {
    const { count, error } = await withTimeout(q, FETCH_TIMEOUT_MS, `count(${table}) timed out`);
    if (error) {
      console.warn(`[Analytics] count(${table}) failed:`, error.message);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.warn(`[Analytics] count(${table}) failed:`, err.message);
    return 0;
  }
}

/**
 * Unique visitors who recorded a page_view (not raw refresh count).
 */
async function countUniqueVisitors() {
  if (!isSupabaseConfigured || !supabase) {
    const ev = localEvents().filter((e) => e.type === EVENT.PAGE_VIEW);
    return new Set(ev.map((e) => e.visitorId)).size;
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from('lead_events').select('visitor_id').eq('event_type', EVENT.PAGE_VIEW).limit(8000),
      FETCH_TIMEOUT_MS,
      'Unique visitors fetch timed out',
    );

    if (error) {
      const { count } = await withTimeout(
        supabase
          .from('lead_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', EVENT.PAGE_VIEW),
        FETCH_TIMEOUT_MS,
        'Visitor count timed out',
      );
      return count || 0;
    }

    return new Set((data || []).map((r) => r.visitor_id).filter(Boolean)).size;
  } catch (err) {
    console.warn('[Analytics] unique visitors failed:', err.message);
    return 0;
  }
}

/**
 * High-level dashboard metrics — open work + unique visits + view KPIs.
 */
export async function getOverview() {
  if (isSupabaseConfigured && supabase) {
    const [
      totalLeads,
      hotLeads,
      callbacksOpen,
      callbacksTotal,
      testRidesOpen,
      testRidesTotal,
      serviceOpen,
      serviceTotal,
      unreadMessages,
      pendingReviews,
      visits,
    ] = await Promise.all([
      countRows('leads'),
      countRows('leads', (q) => q.eq('classification', 'hot')),
      countRows('callbacks', (q) => q.eq('handled', false)),
      countRows('callbacks'),
      countRows('test_rides', (q) => q.eq('status', 'requested')),
      countRows('test_rides'),
      countRows('service_bookings', (q) => q.eq('status', 'requested')),
      countRows('service_bookings'),
      countRows('contact_messages', (q) => q.eq('is_read', false)),
      countRows('reviews', (q) => q.eq('status', 'pending')),
      countUniqueVisitors(),
    ]);

    // Scooter view windows for smart KPIs
    const { data: viewRows, error: viewError } = await withTimeout(
      supabase.from('lead_events').select('created_at').eq('event_type', EVENT.SCOOTER_VIEW).limit(8000),
      FETCH_TIMEOUT_MS,
      'Scooter views fetch timed out',
    ).catch((err) => {
      console.warn('[Analytics] scooter view fetch failed:', err.message);
      return { data: [], error: err };
    });
    if (viewError) {
      console.warn('[Analytics] scooter view fetch failed:', viewError.message);
    }

    const now = Date.now();
    const monthMs = 30 * 86400000;
    const weekMs = 7 * 86400000;
    let viewsWeek = 0;
    let viewsMonth = 0;
    const viewsAllTime = (viewRows || []).length;
    for (const row of viewRows || []) {
      const t = new Date(row.created_at).getTime();
      if (Number.isNaN(t)) continue;
      if (now - t <= weekMs) viewsWeek += 1;
      if (now - t <= monthMs) viewsMonth += 1;
    }

    return {
      totalLeads,
      hotLeads,
      callbacks: callbacksOpen,
      callbacksTotal,
      testRides: testRidesOpen,
      testRidesTotal,
      serviceBookings: serviceOpen,
      serviceBookingsTotal: serviceTotal,
      unreadMessages,
      pendingReviews,
      visits,
      viewsWeek,
      viewsMonth,
      viewsAllTime,
      needsAction:
        callbacksOpen + testRidesOpen + serviceOpen + unreadMessages + pendingReviews,
    };
  }

  const ev = localEvents();
  const by = (t) => ev.filter((e) => e.type === t).length;
  const now = Date.now();
  const scooterViews = ev.filter((e) => e.type === EVENT.SCOOTER_VIEW);
  const viewsWeek = scooterViews.filter((e) => now - new Date(e.at).getTime() <= 7 * 86400000).length;
  const viewsMonth = scooterViews.filter((e) => now - new Date(e.at).getTime() <= 30 * 86400000).length;
  const calculatorUsage = by(EVENT.EMI_USED) + by(EVENT.SIMULATOR_USED);
  return {
    totalLeads: new Set(ev.map((e) => e.visitorId)).size,
    hotLeads: calculatorUsage > 0 ? 1 : 0,
    callbacks: by(EVENT.CALLBACK_REQUEST),
    callbacksTotal: by(EVENT.CALLBACK_REQUEST),
    testRides: by(EVENT.TEST_RIDE_BOOKED),
    testRidesTotal: by(EVENT.TEST_RIDE_BOOKED),
    serviceBookings: by(EVENT.SERVICE_BOOKED),
    serviceBookingsTotal: by(EVENT.SERVICE_BOOKED),
    unreadMessages: 0,
    pendingReviews: 0,
    visits: new Set(ev.filter((e) => e.type === EVENT.PAGE_VIEW).map((e) => e.visitorId)).size,
    viewsWeek,
    viewsMonth,
    viewsAllTime: scooterViews.length,
    needsAction: by(EVENT.CALLBACK_REQUEST) + by(EVENT.TEST_RIDE_BOOKED),
    calculatorUsage,
    whatsappClicks: by(EVENT.WHATSAPP_CLICK),
  };
}

/** Lightweight badge counts for admin nav. */
export async function getInboxBadges() {
  if (!isSupabaseConfigured || !supabase) {
    return { callbacks: 0, messages: 0, reviews: 0, testRides: 0, service: 0, total: 0 };
  }
  const [callbacks, messages, reviews, testRides, service] = await Promise.all([
    countRows('callbacks', (q) => q.eq('handled', false)),
    countRows('contact_messages', (q) => q.eq('is_read', false)),
    countRows('reviews', (q) => q.eq('status', 'pending')),
    countRows('test_rides', (q) => q.eq('status', 'requested')),
    countRows('service_bookings', (q) => q.eq('status', 'requested')),
  ]);
  return {
    callbacks,
    messages,
    reviews,
    testRides,
    service,
    total: callbacks + messages + reviews + testRides + service,
  };
}

/** Event aggregates for the analytics page. */
export async function getEventAggregates() {
  let events = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('lead_events').select('event_type, meta, visitor_id').limit(8000),
        FETCH_TIMEOUT_MS,
        'Event aggregates timed out',
      );
      if (error) {
        console.warn('[Analytics] event aggregate fetch failed:', error.message);
      }
      events = (data || []).map((r) => ({
        type: r.event_type,
        meta: r.meta,
        visitorId: r.visitor_id,
      }));
    } catch (err) {
      console.warn('[Analytics] event aggregate fetch failed:', err.message);
      events = localEvents();
    }
  } else {
    events = localEvents();
  }

  const counts = {};
  const scooterViews = {};
  for (const e of events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (e.type === EVENT.SCOOTER_VIEW) {
      const key = e.meta?.name || e.meta?.scooterId || 'Unknown';
      scooterViews[key] = (scooterViews[key] || 0) + 1;
    }
  }

  const uniqueVisitors = new Set(
    events.filter((e) => e.type === EVENT.PAGE_VIEW).map((e) => e.visitorId).filter(Boolean),
  ).size;

  return {
    counts,
    whatsappClicks: counts[EVENT.WHATSAPP_CLICK] || 0,
    callClicks: counts[EVENT.CALL_CLICK] || 0,
    emiUsage: counts[EVENT.EMI_USED] || 0,
    simulatorUsage: counts[EVENT.SIMULATOR_USED] || 0,
    pageViews: counts[EVENT.PAGE_VIEW] || 0,
    uniqueVisitors,
    mostViewed: Object.entries(scooterViews)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    total: events.length,
  };
}

/** Analytics-only reset — does NOT wipe CRM inbox rows. */
const ANALYTICS_RESET_TABLES = ['lead_events'];

/**
 * Reset website analytics / visit counters only.
 * Leads, callbacks, bookings, and messages are kept.
 */
export async function resetAnalyticsCounts() {
  resetLocalTrackingEvents();
  clearCache('popularity_engine');

  if (!isSupabaseConfigured || !supabase) {
    return { mode: 'local' };
  }

  const results = await Promise.all(
    ANALYTICS_RESET_TABLES.map((table) =>
      withTimeout(
        supabase.from(table).delete().gte('created_at', '1970-01-01T00:00:00Z'),
        MUTATION_TIMEOUT_MS,
        `Reset ${table} timed out`,
      ),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message || 'Reset failed.');

  return { mode: 'supabase' };
}

/** @deprecated use resetAnalyticsCounts — kept name for existing imports */
export async function resetAllCounts() {
  return resetAnalyticsCounts();
}
