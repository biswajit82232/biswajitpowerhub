import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getVisitorId, getLocalLeadSummary, trackEvent, EVENT, classifyLead } from '@/lib/tracking';
import {
  computePurchaseReadiness,
  computeFollowUpPriority,
  sortByFollowUpPriority,
} from '@/lib/purchaseReadiness';
import { getVisitorEventsMap } from '@/features/analytics/popularityService';

/**
 * Upsert a lead record keyed by visitor id, enriched with the current
 * local score/classification. Safe no-op in demo mode.
 */
async function upsertLead({ name, phone, source, scooter }) {
  const visitorId = getVisitorId();
  const { events, score, classification } = getLocalLeadSummary();
  const { readinessPercent, rawScore } = computePurchaseReadiness(events);
  const leadScore = Math.max(score, rawScore);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.rpc('upsert_lead', {
      p_visitor_id: visitorId,
      p_name: name,
      p_phone: phone,
      p_last_source: source,
      p_interested_scooter: scooter || null,
      p_score: leadScore,
      p_classification: classification,
    });
    if (error) {
      console.warn('[Leads] upsert_lead failed:', error.message);
    }
  }
  return { readinessPercent, score: leadScore, classification };
}

export async function submitCallback({ name, phone }) {
  await trackEvent(EVENT.CALLBACK_REQUEST, { name });
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('callbacks')
      .insert({ name, phone, visitor_id: getVisitorId() });
    if (error) throw error;
  } else {
    await new Promise((r) => setTimeout(r, 600));
  }
  await upsertLead({ name, phone, source: 'callback' });
  return { ok: true };
}

export async function submitTestRide({ name, phone, date, time, scooter, scooterId }) {
  await trackEvent(EVENT.TEST_RIDE_BOOKED, { scooter, scooterId });
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('test_rides').insert({
      name,
      phone,
      preferred_date: date,
      preferred_time: time,
      scooter,
      scooter_id: scooterId,
      visitor_id: getVisitorId(),
    });
    if (error) throw error;
  } else {
    await new Promise((r) => setTimeout(r, 600));
  }
  await upsertLead({ name, phone, source: 'test_ride', scooter });
  return { ok: true };
}

export async function submitContact({ name, phone, email, message }) {
  await trackEvent(EVENT.CONTACT_FORM, {});
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('contact_messages').insert({
      name,
      phone,
      email: email || null,
      message,
      visitor_id: getVisitorId(),
    });
    if (error) throw error;
  } else {
    await new Promise((r) => setTimeout(r, 600));
  }
  await upsertLead({ name, phone, source: 'contact' });
  return { ok: true };
}

/* ---------- Admin reads ---------- */

export async function getCallbacks() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('callbacks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTestRides() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('test_rides')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getContactMessages() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLeads() {
  if (!isSupabaseConfigured || !supabase) return getEnrichedLeadsDemo();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('score', { ascending: false });
  if (error) throw error;
  return enrichLeads(data || []);
}

function enrichLeadRow(lead, events = []) {
  const readiness = computePurchaseReadiness(events);
  const followUp = computeFollowUpPriority(lead, events, readiness);
  return {
    ...lead,
    readinessPercent: followUp.readinessPercent,
    priority: followUp.priority,
    priorityLabel: followUp.priorityLabel,
    priorityRank: followUp.priorityRank,
    signals: followUp.signals,
    topScooterId: followUp.topScooterId,
    lastActivityAt: followUp.lastActivityAt,
  };
}

async function enrichLeads(leads) {
  const visitorMap = await getVisitorEventsMap();
  const enriched = leads.map((l) => enrichLeadRow(l, visitorMap[l.visitor_id] || []));

  const [callbacks, testRides] = await Promise.all([getCallbacks(), getTestRides()]);
  const knownVisitors = new Set(leads.map((l) => l.visitor_id).filter(Boolean));
  const knownPhones = new Set(leads.map((l) => l.phone).filter(Boolean));

  for (const cb of callbacks) {
    if (cb.visitor_id && knownVisitors.has(cb.visitor_id)) continue;
    if (cb.phone && knownPhones.has(cb.phone)) continue;
    const events = visitorMap[cb.visitor_id] || [{ type: EVENT.CALLBACK_REQUEST, at: cb.created_at, meta: {} }];
    enriched.push(enrichLeadRow({
      id: `cb-${cb.id}`,
      visitor_id: cb.visitor_id,
      name: cb.name,
      phone: cb.phone,
      last_source: 'callback',
      classification: 'hot',
      status: 'new',
      score: 30,
      updated_at: cb.created_at,
      created_at: cb.created_at,
    }, events));
    if (cb.visitor_id) knownVisitors.add(cb.visitor_id);
    if (cb.phone) knownPhones.add(cb.phone);
  }

  for (const tr of testRides) {
    if (tr.visitor_id && knownVisitors.has(tr.visitor_id)) continue;
    if (tr.phone && knownPhones.has(tr.phone)) continue;
    const events = visitorMap[tr.visitor_id] || [{
      type: EVENT.TEST_RIDE_BOOKED,
      at: tr.created_at,
      meta: { scooterId: tr.scooter_id, name: tr.scooter },
    }];
    enriched.push(enrichLeadRow({
      id: `tr-${tr.id}`,
      visitor_id: tr.visitor_id,
      name: tr.name,
      phone: tr.phone,
      last_source: 'test_ride',
      interested_scooter: tr.scooter,
      classification: 'hot',
      status: 'new',
      score: 35,
      updated_at: tr.created_at,
      created_at: tr.created_at,
    }, events));
    if (tr.visitor_id) knownVisitors.add(tr.visitor_id);
    if (tr.phone) knownPhones.add(tr.phone);
  }

  return enriched.sort(sortByFollowUpPriority);
}

function getEnrichedLeadsDemo() {
  try {
    const events = JSON.parse(localStorage.getItem('bph_events') || '[]');
    const byVisitor = {};
    for (const e of events) {
      const vid = e.visitorId || 'demo';
      if (!byVisitor[vid]) byVisitor[vid] = [];
      byVisitor[vid].push(e);
    }
    const leads = Object.entries(byVisitor).map(([visitor_id, evts], i) => {
      const { classification, score } = classifyLead(evts);
      return enrichLeadRow({
        id: `demo-${i}`,
        visitor_id,
        name: evts.find((e) => e.meta?.name)?.meta?.name || 'Demo visitor',
        phone: null,
        last_source: 'browse',
        classification,
        status: 'new',
        score,
        updated_at: evts[evts.length - 1]?.at,
        created_at: evts[0]?.at,
      }, evts);
    });
    return leads.sort(sortByFollowUpPriority);
  } catch {
    return [];
  }
}

export async function updateLead(id, patch) {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('leads').update(patch).eq('id', id);
  if (error) throw error;
}
