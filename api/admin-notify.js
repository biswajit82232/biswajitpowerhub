/**
 * Supabase Database Webhook → Web Push for admin devices.
 *
 * Env (Vercel):
 *   VAPID_PUBLIC_KEY / VITE_VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT          (mailto:you@example.com)
 *   ADMIN_NOTIFY_SECRET    (shared with Supabase webhook Authorization header)
 *   SUPABASE_URL / VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Supabase → Database → Webhooks: INSERT on
 *   callbacks, test_rides, service_bookings, contact_messages, reviews
 * URL: https://<your-domain>/api/admin-notify
 * HTTP Header: Authorization: Bearer <ADMIN_NOTIFY_SECRET>
 */
import webpush from 'web-push';
import { safeEqual } from '../src/lib/safeEqual.js';

function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '';
  return `····${digits.slice(-4)}`;
}

const EVENT_COPY = {
  callbacks: {
    title: 'New callback request',
    path: '/admin/callbacks',
    tag: 'bph-callback',
    body: (r) => [r.name, maskPhone(r.phone)].filter(Boolean).join(' · ') || 'Someone requested a callback.',
  },
  test_rides: {
    title: 'New test ride booking',
    path: '/admin/test-rides',
    tag: 'bph-testride',
    body: (r) => {
      const bits = [r.name, maskPhone(r.phone), r.scooter_name || r.scooter || r.model].filter(Boolean);
      return bits.join(' · ') || 'A test ride was booked.';
    },
  },
  service_bookings: {
    title: 'New service booking',
    path: '/admin/service-bookings',
    tag: 'bph-service',
    body: (r) => [r.name, maskPhone(r.phone), r.scooter_name || r.model].filter(Boolean).join(' · ') || 'A service booking arrived.',
  },
  contact_messages: {
    title: 'New contact message',
    path: '/admin/messages',
    tag: 'bph-message',
    body: (r) => {
      const preview = (r.message || r.subject || '').toString().trim().slice(0, 80);
      return [r.name, preview].filter(Boolean).join(' — ') || 'You have a new message.';
    },
  },
  reviews: {
    title: 'New review pending',
    path: '/admin/reviews',
    tag: 'bph-review',
    body: (r) => {
      const rating = r.rating != null ? `${r.rating}★` : null;
      return [r.name, rating].filter(Boolean).join(' · ') || 'A review is waiting for approval.';
    },
  },
};

const recentNotifies = new Map();
const DEDUPE_MS = 10 * 60 * 1000;

function alreadyNotified(table, id) {
  if (!table || !id) return false;
  const key = `${table}:${id}`;
  const now = Date.now();
  const prev = recentNotifies.get(key);
  if (prev && now - prev < DEDUPE_MS) return true;
  recentNotifies.set(key, now);
  if (recentNotifies.size > 200) {
    for (const [k, ts] of recentNotifies) {
      if (now - ts > DEDUPE_MS) recentNotifies.delete(k);
    }
  }
  return false;
}

function env(name, ...aliases) {
  for (const key of [name, ...aliases]) {
    const v = process.env[key];
    if (v && String(v).trim()) return String(v).trim();
  }
  return '';
}

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ error: message });
}

function buildPayload(table, record) {
  const conf = EVENT_COPY[table];
  if (!conf) return null;
  return {
    title: conf.title,
    body: conf.body(record || {}),
    url: conf.path,
    tag: conf.tag,
  };
}

async function fetchSubscriptions(supabaseUrl, serviceKey) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/rpc/list_admin_push_subscriptions`,
    {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load subscriptions (${res.status}): ${text}`);
  }
  return res.json();
}

async function deleteSubscription(supabaseUrl, serviceKey, id) {
  await fetch(`${supabaseUrl}/rest/v1/admin_push_subscriptions?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = env('ADMIN_NOTIFY_SECRET');
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!secret || !safeEqual(token, secret)) {
    return unauthorized(res);
  }

  const vapidPublic = env('VAPID_PUBLIC_KEY', 'VITE_VAPID_PUBLIC_KEY');
  const vapidPrivate = env('VAPID_PRIVATE_KEY');
  const vapidSubject = env('VAPID_SUBJECT') || 'mailto:admin@biswajitpowerhub.in';
  const supabaseUrl = env('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');

  if (!vapidPublic || !vapidPrivate || !supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: 'Missing VAPID or Supabase service credentials on the server.',
    });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  const table = body.table || body.record?.table;
  const type = (body.type || body.event || 'INSERT').toUpperCase();
  const record = body.record || body.row || body.new || {};

  if (type && type !== 'INSERT') {
    return res.status(200).json({ ok: true, skipped: true, reason: 'not_insert' });
  }

  if (alreadyNotified(table, record.id)) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'duplicate' });
  }

  const payload = buildPayload(table, record);
  if (!payload) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'unknown_table', table });
  }

  let subscriptions = [];
  try {
    subscriptions = await fetchSubscriptions(supabaseUrl, serviceKey);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  if (!subscriptions.length) {
    return res.status(200).json({ ok: true, sent: 0 });
  }

  const json = JSON.stringify(payload);
  let sent = 0;
  let pruned = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          json,
          { urgency: 'high', TTL: 60 * 60 * 12 },
        );
        sent += 1;
      } catch (err) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          await deleteSubscription(supabaseUrl, serviceKey, sub.id);
          pruned += 1;
        }
      }
    }),
  );

  return res.status(200).json({ ok: true, sent, pruned, table });
}
