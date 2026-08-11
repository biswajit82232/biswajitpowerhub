import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { timeAgo } from '@/lib/utils';

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
 * Unified "Today" work queue across inbox tables for the admin dashboard.
 */
export async function getTodayQueue(limit = 12) {
  if (!isSupabaseConfigured || !supabase) return [];

  const [callbacks, testRides, service, messages, reviews] = await Promise.all([
    supabase
      .from('callbacks')
      .select('id, name, phone, created_at, handled')
      .eq('handled', false)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('test_rides')
      .select('id, name, phone, scooter, preferred_date, preferred_time, created_at, status')
      .eq('status', 'requested')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('service_bookings')
      .select('id, name, phone, service_kind, scooter, created_at, status')
      .eq('status', 'requested')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('contact_messages')
      .select('id, name, phone, message, created_at, is_read')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('reviews')
      .select('id, name, rating, scooter, created_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const rows = [];

  for (const c of callbacks.data || []) {
    const h = hoursSince(c.created_at);
    rows.push({
      id: `callback:${c.id}`,
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
    });
  }

  for (const t of testRides.data || []) {
    const h = hoursSince(t.created_at);
    rows.push({
      id: `testride:${t.id}`,
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
    });
  }

  for (const s of service.data || []) {
    const h = hoursSince(s.created_at);
    rows.push({
      id: `service:${s.id}`,
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
    });
  }

  for (const m of messages.data || []) {
    const h = hoursSince(m.created_at);
    rows.push({
      id: `message:${m.id}`,
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
    });
  }

  for (const r of reviews.data || []) {
    const h = hoursSince(r.created_at);
    rows.push({
      id: `review:${r.id}`,
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
    });
  }

  return rows
    .sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;
      return a.hours - b.hours;
    })
    .slice(0, limit);
}

export const QUEUE_KIND_LABEL = {
  callback: 'Callback',
  test_ride: 'Test ride',
  service: 'Service',
  message: 'Message',
  review: 'Review',
};
