import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo, withTimeout, FETCH_TIMEOUT_MS } from '@/lib/utils';
import {
  updateCallback,
  updateTestRide,
  updateServiceBooking,
  updateContactMessage,
} from '@/features/leads/leadService';
import { setReviewStatus } from '@/features/reviews/reviewService';

function hoursSince(iso) {
  if (!iso) return 999;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

function slaLabel(hours) {
  if (hours < 1) return 'Just now';
  if (hours < 2) return `${Math.round(hours * 60)}m waiting`;
  if (hours < 24) return `${Math.round(hours)}h waiting`;
  return `${Math.round(hours / 24)}d waiting`;
}

/**
 * Unified open work queue across inbox tables for the admin Inbox home.
 */
export async function getTodayQueue(limit = 80) {
  if (!isSupabaseConfigured || !supabase) return [];

  const perType = Math.min(50, Math.max(20, limit));

  const timed = (query, label) =>
    withTimeout(query, FETCH_TIMEOUT_MS, `${label} timed out`).catch((err) => {
      console.warn(`[Inbox] ${label} failed:`, err.message);
      return { data: [], error: err };
    });

  const [callbacks, testRides, service, messages, reviews] = await Promise.all([
    timed(
      supabase
        .from('callbacks')
        .select('id, name, phone, created_at, handled')
        .eq('handled', false)
        .order('created_at', { ascending: false })
        .limit(perType),
      'callbacks',
    ),
    timed(
      supabase
        .from('test_rides')
        .select('id, name, phone, scooter, preferred_date, preferred_time, created_at, status')
        .eq('status', 'requested')
        .order('created_at', { ascending: false })
        .limit(perType),
      'test rides',
    ),
    timed(
      supabase
        .from('service_bookings')
        .select('id, name, phone, service_kind, scooter, created_at, status')
        .eq('status', 'requested')
        .order('created_at', { ascending: false })
        .limit(perType),
      'service bookings',
    ),
    timed(
      supabase
        .from('contact_messages')
        .select('id, name, phone, message, created_at, is_read')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(perType),
      'messages',
    ),
    timed(
      supabase
        .from('reviews')
        .select('id, name, rating, scooter, created_at, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(Math.min(20, perType)),
      'reviews',
    ),
  ]);

  const rows = [];

  for (const c of callbacks.data || []) {
    const h = hoursSince(c.created_at);
    rows.push({
      id: `callback:${c.id}`,
      recordId: c.id,
      kind: 'callback',
      title: c.name,
      subtitle: c.phone,
      phone: c.phone,
      href: '/admin/callbacks',
      created_at: c.created_at,
      hours: h,
      sla: slaLabel(h),
      urgency: h >= 2 ? 3 : 2,
      when: timeAgo(c.created_at),
      doneLabel: 'Mark handled',
    });
  }

  for (const t of testRides.data || []) {
    const h = hoursSince(t.created_at);
    rows.push({
      id: `testride:${t.id}`,
      recordId: t.id,
      kind: 'test_ride',
      title: t.name,
      subtitle: [t.scooter, t.preferred_date, t.preferred_time].filter(Boolean).join(' · '),
      phone: t.phone,
      href: '/admin/test-rides',
      created_at: t.created_at,
      hours: h,
      sla: slaLabel(h),
      urgency: h >= 2 ? 3 : 2,
      when: timeAgo(t.created_at),
      doneLabel: 'Confirm',
    });
  }

  for (const s of service.data || []) {
    const h = hoursSince(s.created_at);
    rows.push({
      id: `service:${s.id}`,
      recordId: s.id,
      kind: 'service',
      title: s.name,
      subtitle: [s.service_kind, s.scooter].filter(Boolean).join(' · '),
      phone: s.phone,
      href: '/admin/service-bookings',
      created_at: s.created_at,
      hours: h,
      sla: slaLabel(h),
      urgency: h >= 4 ? 3 : 2,
      when: timeAgo(s.created_at),
      doneLabel: 'Confirm',
    });
  }

  for (const m of messages.data || []) {
    const h = hoursSince(m.created_at);
    rows.push({
      id: `message:${m.id}`,
      recordId: m.id,
      kind: 'message',
      title: m.name,
      subtitle: (m.message || '').slice(0, 80),
      phone: m.phone,
      href: '/admin/messages',
      created_at: m.created_at,
      hours: h,
      sla: slaLabel(h),
      urgency: h >= 6 ? 3 : 1,
      when: timeAgo(m.created_at),
      doneLabel: 'Mark read',
    });
  }

  for (const r of reviews.data || []) {
    const h = hoursSince(r.created_at);
    rows.push({
      id: `review:${r.id}`,
      recordId: r.id,
      kind: 'review',
      title: r.name,
      subtitle: `${r.rating || '?'}★ · ${r.scooter || 'Review'}`,
      phone: null,
      href: '/admin/reviews',
      created_at: r.created_at,
      hours: h,
      sla: slaLabel(h),
      urgency: 1,
      when: timeAgo(r.created_at),
      doneLabel: 'Approve',
    });
  }

  return rows
    .sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;
      return a.hours - b.hours;
    })
    .slice(0, limit);
}

/** Resolve an open inbox item from the unified Inbox home. */
export async function resolveInboxItem(item) {
  if (!item?.kind || !item?.recordId) throw new Error('Invalid inbox item.');

  switch (item.kind) {
    case 'callback':
      await updateCallback(item.recordId, { handled: true });
      break;
    case 'test_ride':
      await updateTestRide(item.recordId, { status: 'confirmed' });
      break;
    case 'service':
      await updateServiceBooking(item.recordId, { status: 'confirmed' });
      break;
    case 'message':
      await updateContactMessage(item.recordId, { is_read: true });
      break;
    case 'review':
      await setReviewStatus(item.recordId, 'approved');
      break;
    default:
      throw new Error(`Unknown inbox kind: ${item.kind}`);
  }
}

export const QUEUE_KIND_LABEL = {
  callback: 'Callback',
  test_ride: 'Test ride',
  service: 'Service',
  message: 'Message',
  review: 'Review',
};

export const QUEUE_KIND_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'callback', label: 'Callbacks', badgeKey: 'callbacks' },
  { id: 'test_ride', label: 'Test rides', badgeKey: 'testRides' },
  { id: 'service', label: 'Service', badgeKey: 'service' },
  { id: 'message', label: 'Messages', badgeKey: 'messages' },
  { id: 'review', label: 'Reviews', badgeKey: 'reviews' },
];
