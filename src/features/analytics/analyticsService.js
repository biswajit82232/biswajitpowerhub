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
 * High-level dashboard metrics. Uses Supabase counts when available,
 * otherwise derives approximate figures from local interaction events.
 */
export async function getOverview() {
  if (isSupabaseConfigured && supabase) {
    const [totalLeads, hotLeads, callbacks, testRides, reviews] = await Promise.all([
      countRows('leads'),
      countRows('leads', (q) => q.eq('classification', 'hot')),
      countRows('callbacks'),
      countRows('test_rides'),
      countRows('reviews', (q) => q.eq('status', 'pending')),
    ]);
    const { count: visitCount } = await supabase
      .from('lead_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', EVENT.PAGE_VIEW);
    return {
      totalLeads,
      hotLeads,
      callbacks,
      testRides,
      pendingReviews: reviews,
      visits: visitCount || 0,
    };
  }

  // Demo fallback from local events
  const ev = localEvents();
  const by = (t) => ev.filter((e) => e.type === t).length;
  const calculatorUsage = by(EVENT.EMI_USED) + by(EVENT.SIMULATOR_USED);
  return {
    totalLeads: new Set(ev.map((e) => e.visitorId)).size,
    hotLeads: calculatorUsage > 0 ? 1 : 0,
    callbacks: by(EVENT.CALLBACK_REQUEST),
    testRides: by(EVENT.TEST_RIDE_BOOKED),
    pendingReviews: 0,
    visits: by(EVENT.PAGE_VIEW),
    calculatorUsage,
    whatsappClicks: by(EVENT.WHATSAPP_CLICK),
  };
}

/** Event aggregates for the analytics page. */
export async function getEventAggregates() {
  let events = [];
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from('lead_events').select('event_type, meta').limit(5000);
    events = (data || []).map((r) => ({ type: r.event_type, meta: r.meta }));
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

  return {
    counts,
    whatsappClicks: counts[EVENT.WHATSAPP_CLICK] || 0,
    callClicks: counts[EVENT.CALL_CLICK] || 0,
    emiUsage: counts[EVENT.EMI_USED] || 0,
    simulatorUsage: counts[EVENT.SIMULATOR_USED] || 0,
    mostViewed: Object.entries(scooterViews)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    total: events.length,
  };
}

const RESET_TABLES = ['lead_events', 'leads', 'callbacks', 'test_rides', 'contact_messages'];

/**
 * Reset dashboard / analytics counts — clears tracking events and lead capture rows.
 * Does not affect inventory, reviews, offers, or settings.
 */
export async function resetAllCounts() {
  resetLocalTrackingEvents();
  clearCache('popularity_engine');

  if (!isSupabaseConfigured || !supabase) {
    return { mode: 'local' };
  }

  const results = await Promise.all(
    RESET_TABLES.map((table) =>
      supabase.from(table).delete().gte('created_at', '1970-01-01T00:00:00Z'),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message || 'Reset failed.');

  return { mode: 'supabase' };
}
