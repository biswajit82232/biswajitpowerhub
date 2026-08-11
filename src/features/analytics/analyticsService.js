import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { EVENT, resetLocalTrackingEvents } from '@/lib/tracking';
import { clearCache } from '@/lib/cache';

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
  const { count } = await q;
  return count || 0;
}

/**
 * Unique visitors who recorded a page_view (not raw refresh count).
 */
async function countUniqueVisitors() {
  if (!isSupabaseConfigured || !supabase) {
    const ev = localEvents().filter((e) => e.type === EVENT.PAGE_VIEW);
    return new Set(ev.map((e) => e.visitorId)).size;
  }

  // Prefer distinct visitor_id — fall back to capped select if RPC unavailable
  const { data, error } = await supabase
    .from('lead_events')
    .select('visitor_id')
    .eq('event_type', EVENT.PAGE_VIEW)
    .limit(8000);

  if (error) {
    const { count } = await supabase
      .from('lead_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', EVENT.PAGE_VIEW);
    return count || 0;
  }

  return new Set((data || []).map((r) => r.visitor_id).filter(Boolean)).size;
}

/**
 * High-level dashboard metrics — open work + unique visits.
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
      needsAction:
        callbacksOpen + testRidesOpen + serviceOpen + unreadMessages + pendingReviews,
    };
  }

  const ev = localEvents();
  const by = (t) => ev.filter((e) => e.type === t).length;
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
    const { data } = await supabase.from('lead_events').select('event_type, meta, visitor_id').limit(8000);
    events = (data || []).map((r) => ({
      type: r.event_type,
      meta: r.meta,
      visitorId: r.visitor_id,
    }));
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
      supabase.from(table).delete().gte('created_at', '1970-01-01T00:00:00Z'),
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
