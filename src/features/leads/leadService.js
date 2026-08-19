import { supabase, isSupabaseConfigured, requirePersistence } from '@/lib/supabase';
import { getVisitorId, getLocalLeadSummary, trackEvent, EVENT, classifyLead } from '@/lib/tracking';
import {
  computePurchaseReadiness,
  computeFollowUpPriority,
  sortByFollowUpPriority,
} from '@/lib/purchaseReadiness';
import { getVisitorEventsMap } from '@/features/analytics/popularityService';
import { normalizeIndianMobile } from '@/features/leads/validation';
import { withTimeout, FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS } from '@/lib/utils';
import { attributionPayload } from '@/lib/attribution';

function isMissingAttributionColumn(error) {
  const msg = String(error?.message || '');
  return /attribution/i.test(msg) && /column|schema cache|could not find/i.test(msg);
}

async function insertPublicRow(table, payload) {
  const first = await withTimeout(
    supabase.from(table).insert(payload),
    MUTATION_TIMEOUT_MS,
    `${table} submit timed out`,
  );
  if (!first.error) return first;
  if (payload.attribution && isMissingAttributionColumn(first.error)) {
    const rest = { ...payload };
    delete rest.attribution;
    return withTimeout(
      supabase.from(table).insert(rest),
      MUTATION_TIMEOUT_MS,
      `${table} submit timed out`,
    );
  }
  return first;
}

const UPSERT_DEBOUNCE_MS = 2000;
const lastUpsertAt = new Map();

function shouldSkipLeadUpsert(visitorId) {
  const now = Date.now();
  const prev = lastUpsertAt.get(visitorId) || 0;
  if (now - prev < UPSERT_DEBOUNCE_MS) return true;
  lastUpsertAt.set(visitorId, now);
  if (lastUpsertAt.size > 80) {
    [...lastUpsertAt.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(0, 20)
      .forEach(([key]) => lastUpsertAt.delete(key));
  }
  return false;
}

/**
 * Upsert a lead record keyed by visitor id, enriched with the current
 * local score/classification. Safe no-op in demo mode.
 */
async function upsertLead({ name, phone, source, scooter }) {
  const visitorId = getVisitorId();
  const { events, classification } = getLocalLeadSummary();
  const { readinessPercent } = computePurchaseReadiness(events);
  const leadScore = readinessPercent;
  const attribution = attributionPayload();

  if (isSupabaseConfigured && supabase) {
    if (shouldSkipLeadUpsert(visitorId)) {
      return { readinessPercent, score: leadScore, classification };
    }
    const params = {
      p_visitor_id: visitorId,
      p_name: name,
      p_phone: phone,
      p_last_source: source,
      p_interested_scooter: scooter || null,
      p_score: leadScore,
      p_classification: classification,
      p_attribution: attribution,
    };
    try {
      let { error } = await withTimeout(
        supabase.rpc('upsert_lead', params),
        MUTATION_TIMEOUT_MS,
        'Lead upsert timed out',
      );
      if (error && /p_attribution|could not find the function|schema cache/i.test(error.message || '')) {
        const legacy = { ...params };
        delete legacy.p_attribution;
        ({ error } = await withTimeout(
          supabase.rpc('upsert_lead', legacy),
          MUTATION_TIMEOUT_MS,
          'Lead upsert timed out',
        ));
      }
      if (error) {
        console.warn('[Leads] upsert_lead failed:', error.message);
      }
    } catch (err) {
      console.warn('[Leads] upsert_lead failed:', err.message);
    }
  }
  return { readinessPercent, score: leadScore, classification };
}

export async function submitCallback({ name, phone, interest }) {
  const cleanName = String(name || '').trim();
  const cleanPhone = normalizeIndianMobile(phone);
  await trackEvent(EVENT.CALLBACK_REQUEST, { name: cleanName, interest: interest || null });
  if (isSupabaseConfigured && supabase) {
    const { error } = await insertPublicRow('callbacks', {
      name: cleanName,
      phone: cleanPhone,
      visitor_id: getVisitorId(),
      attribution: attributionPayload(),
    });
    if (error) throw error;
  } else {
    requirePersistence('Callback');
    await new Promise((r) => setTimeout(r, 600));
  }
  await upsertLead({
    name: cleanName,
    phone: cleanPhone,
    source: 'callback',
    scooter: interest || null,
  });
  return { ok: true };
}

export async function submitTestRide({ name, phone, date, time, scooter, scooterId }) {
  const cleanName = String(name || '').trim();
  const cleanPhone = normalizeIndianMobile(phone);
  await trackEvent(EVENT.TEST_RIDE_BOOKED, { scooter, scooterId });
  if (isSupabaseConfigured && supabase) {
    const { error } = await insertPublicRow('test_rides', {
      name: cleanName,
      phone: cleanPhone,
      preferred_date: date,
      preferred_time: time,
      scooter,
      scooter_id: scooterId,
      visitor_id: getVisitorId(),
      attribution: attributionPayload(),
    });
    if (error) throw error;
  } else {
    requirePersistence('Test ride');
    await new Promise((r) => setTimeout(r, 600));
  }
  await upsertLead({ name: cleanName, phone: cleanPhone, source: 'test_ride', scooter });
  return { ok: true };
}

export async function submitServiceBooking({
  name,
  phone,
  serviceKind,
  details,
  date,
  time,
  scooter,
  scooterId,
}) {
  const cleanName = String(name || '').trim();
  const cleanPhone = normalizeIndianMobile(phone);
  await trackEvent(EVENT.SERVICE_BOOKED, { serviceKind, scooter, scooterId });
  if (isSupabaseConfigured && supabase) {
    const { error } = await insertPublicRow('service_bookings', {
      name: cleanName,
      phone: cleanPhone,
      service_kind: serviceKind,
      details: details || null,
      preferred_date: date,
      preferred_time: time,
      scooter: scooter || null,
      scooter_id: scooterId || null,
      visitor_id: getVisitorId(),
      attribution: attributionPayload(),
    });
    if (error) throw error;
  } else {
    requirePersistence('Service booking');
    await new Promise((r) => setTimeout(r, 600));
  }
  await upsertLead({ name: cleanName, phone: cleanPhone, source: 'service', scooter });
  return { ok: true };
}

export async function submitContact({ name, phone, email, message, from = 'contact_form' }) {
  const cleanName = String(name || '').trim();
  const cleanPhone = normalizeIndianMobile(phone);
  await trackEvent(EVENT.CONTACT_FORM, { from });
  if (isSupabaseConfigured && supabase) {
    const { error } = await insertPublicRow('contact_messages', {
      name: cleanName,
      phone: cleanPhone,
      email: email || null,
      message,
      visitor_id: getVisitorId(),
      attribution: attributionPayload(),
    });
    if (error) throw error;
  } else {
    requirePersistence('Message');
    await new Promise((r) => setTimeout(r, 600));
  }
  await upsertLead({ name: cleanName, phone: cleanPhone, source: 'contact' });
  return { ok: true };
}

/* ---------- Admin reads ---------- */

// Cap admin list fetches so the panel stays fast as tables grow.
// Newest rows first, so the cap only trims very old history.
export const ADMIN_LIST_LIMIT = 1000;

export async function getCallbacks() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await withTimeout(
    supabase.from('callbacks').select('*').order('created_at', { ascending: false }).limit(ADMIN_LIST_LIMIT),
    FETCH_TIMEOUT_MS,
    'Callbacks fetch timed out',
  );
  if (error) throw error;
  return data;
}

export async function getTestRides() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await withTimeout(
    supabase.from('test_rides').select('*').order('created_at', { ascending: false }).limit(ADMIN_LIST_LIMIT),
    FETCH_TIMEOUT_MS,
    'Test rides fetch timed out',
  );
  if (error) throw error;
  return data;
}

export async function getServiceBookings() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from('service_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_LIST_LIMIT),
    FETCH_TIMEOUT_MS,
    'Service bookings fetch timed out',
  );
  if (error) throw error;
  return data;
}

export async function getContactMessages() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(ADMIN_LIST_LIMIT),
    FETCH_TIMEOUT_MS,
    'Messages fetch timed out',
  );
  if (error) throw error;
  return data;
}

export async function updateCallback(id, patch) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('callbacks').update(patch).eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Callback update timed out',
  );
  if (error) throw error;
}

export async function updateTestRide(id, patch) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('test_rides').update(patch).eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Test ride update timed out',
  );
  if (error) throw error;
}

export async function updateServiceBooking(id, patch) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('service_bookings').update(patch).eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Service booking update timed out',
  );
  if (error) throw error;
}

export async function updateContactMessage(id, patch) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('contact_messages').update(patch).eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Message update timed out',
  );
  if (error) throw error;
}

export async function deleteContactMessage(id) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await withTimeout(
    supabase.from('contact_messages').delete().eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Message delete timed out',
  );
  if (error) throw error;
}

export async function getLeads() {
  if (!isSupabaseConfigured || !supabase) return getEnrichedLeadsDemo();
  const { data, error } = await withTimeout(
    supabase.from('leads').select('*').order('score', { ascending: false }).limit(ADMIN_LIST_LIMIT),
    FETCH_TIMEOUT_MS,
    'Leads fetch timed out',
  );
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
    slaBreach: followUp.slaBreach,
    slaHours: followUp.slaHours,
  };
}

function phoneKey(phone) {
  const n = normalizeIndianMobile(phone);
  return n.length === 10 ? n : '';
}

function findLeadIndex(rows, { visitorId, phone }) {
  if (visitorId) {
    const i = rows.findIndex((l) => l.visitor_id && l.visitor_id === visitorId);
    if (i >= 0) return i;
  }
  const key = phoneKey(phone);
  if (key) {
    const i = rows.findIndex((l) => phoneKey(l.phone) === key);
    if (i >= 0) return i;
  }
  return -1;
}

/**
 * Promote inbox rows (callback / test ride / service) into real `leads` rows
 * so Admin → Leads can edit status/notes. Never returns synthetic cb-/tr-/sb- ids.
 */
async function ensureLeadFromInbox({
  source,
  inboxId,
  visitorId,
  name,
  phone,
  scooter,
  score,
  classification = 'hot',
}) {
  const vid = (visitorId && String(visitorId).trim()) || `inbox:${source}:${inboxId}`;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await withTimeout(
        supabase.rpc('upsert_lead', {
          p_visitor_id: vid,
          p_name: name || null,
          p_phone: phone || null,
          p_last_source: source,
          p_interested_scooter: scooter || null,
          p_score: score,
          p_classification: classification,
        }),
        MUTATION_TIMEOUT_MS,
        'Inbox lead upsert timed out',
      );
      if (error) {
        console.warn('[Leads] ensureLeadFromInbox failed:', error.message);
        return null;
      }
      const { data } = await withTimeout(
        supabase.from('leads').select('*').eq('visitor_id', vid).maybeSingle(),
        FETCH_TIMEOUT_MS,
        'Inbox lead fetch timed out',
      );
      return data || null;
    } catch (err) {
      console.warn('[Leads] ensureLeadFromInbox failed:', err.message);
      return null;
    }
  }
  return {
    id: `demo-inbox-${source}-${inboxId}`,
    visitor_id: vid,
    name,
    phone,
    last_source: source,
    interested_scooter: scooter || null,
    classification,
    status: 'new',
    score,
    notes: null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

function attachInboxMeta(lead, source, inboxId) {
  const sources = new Set(lead.inboxSources || []);
  sources.add(source);
  return {
    ...lead,
    inboxSources: [...sources],
    inboxIds: { ...(lead.inboxIds || {}), [source]: inboxId },
  };
}

async function enrichLeads(leads) {
  const visitorMap = await getVisitorEventsMap();
  let enriched = leads.map((l) => enrichLeadRow(l, visitorMap[l.visitor_id] || []));

  const [callbacks, testRides, serviceBookings] = await Promise.all([
    getCallbacks(),
    getTestRides(),
    getServiceBookings(),
  ]);

  const inboxRows = [
    ...callbacks.map((cb) => ({
      source: 'callback',
      inboxId: cb.id,
      visitorId: cb.visitor_id,
      name: cb.name,
      phone: cb.phone,
      scooter: null,
      score: 30,
      fallbackEvents: [{ type: EVENT.CALLBACK_REQUEST, at: cb.created_at, meta: {} }],
    })),
    ...testRides.map((tr) => ({
      source: 'test_ride',
      inboxId: tr.id,
      visitorId: tr.visitor_id,
      name: tr.name,
      phone: tr.phone,
      scooter: tr.scooter,
      score: 35,
      fallbackEvents: [{
        type: EVENT.TEST_RIDE_BOOKED,
        at: tr.created_at,
        meta: { scooterId: tr.scooter_id, name: tr.scooter },
      }],
    })),
    ...serviceBookings.map((sb) => ({
      source: 'service',
      inboxId: sb.id,
      visitorId: sb.visitor_id,
      name: sb.name,
      phone: sb.phone,
      scooter: sb.scooter,
      score: 32,
      fallbackEvents: [{
        type: EVENT.SERVICE_BOOKED,
        at: sb.created_at,
        meta: { serviceKind: sb.service_kind, scooterId: sb.scooter_id, name: sb.scooter },
      }],
    })),
  ];

  const needsPromote = [];

  for (const row of inboxRows) {
    const idx = findLeadIndex(enriched, { visitorId: row.visitorId, phone: row.phone });
    if (idx >= 0) {
      enriched[idx] = attachInboxMeta(
        {
          ...enriched[idx],
          name: enriched[idx].name || row.name,
          phone: enriched[idx].phone || row.phone,
          interested_scooter: enriched[idx].interested_scooter || row.scooter || null,
          last_source: enriched[idx].last_source || row.source,
        },
        row.source,
        row.inboxId,
      );
    } else {
      needsPromote.push(row);
    }
  }

  // Bounded parallel upserts for unmatched inbox rows only.
  const CHUNK = 5;
  for (let i = 0; i < needsPromote.length; i += CHUNK) {
    const chunk = needsPromote.slice(i, i + CHUNK);
    const created = await Promise.all(
      chunk.map((row) =>
        ensureLeadFromInbox({
          source: row.source,
          inboxId: row.inboxId,
          visitorId: row.visitorId,
          name: row.name,
          phone: row.phone,
          scooter: row.scooter,
          score: row.score,
        }).then((lead) => (lead ? { lead, row } : null)),
      ),
    );
    for (const item of created) {
      if (!item) continue;
      const events = visitorMap[item.lead.visitor_id] || item.row.fallbackEvents;
      enriched.push(
        attachInboxMeta(enrichLeadRow(item.lead, events), item.row.source, item.row.inboxId),
      );
    }
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
  const { error } = await withTimeout(
    supabase.from('leads').update(patch).eq('id', id),
    MUTATION_TIMEOUT_MS,
    'Lead update timed out',
  );
  if (error) throw error;
}
