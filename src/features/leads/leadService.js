import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getVisitorId, getLocalLeadSummary, trackEvent, EVENT } from '@/lib/tracking';

/**
 * Upsert a lead record keyed by visitor id, enriched with the current
 * local score/classification. Safe no-op in demo mode.
 */
async function upsertLead({ name, phone, source, scooter }) {
  const visitorId = getVisitorId();
  const { score, classification } = getLocalLeadSummary();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('leads').upsert(
        {
          visitor_id: visitorId,
          name,
          phone,
          last_source: source,
          interested_scooter: scooter || null,
          score,
          classification,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'visitor_id' }
      );
    } catch {
      /* ignore */
    }
  }
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
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('score', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateLead(id, patch) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('leads').update(patch).eq('id', id);
  if (error) throw error;
}
