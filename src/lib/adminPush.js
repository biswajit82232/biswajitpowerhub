import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim() || '';

export function isAdminPushSupported() {
  return (
    typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && window.isSecureContext === true
  );
}

export function isAdminPushConfigured() {
  return Boolean(VAPID_PUBLIC);
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

async function getAdminRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration('/admin/');
  if (existing) return existing;
  return navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' });
}

async function upsertSubscription(sub) {
  if (!isSupabaseConfigured || !supabase) return { ok: false, reason: 'no_supabase' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' };

  const json = sub.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) return { ok: false, reason: 'invalid_subscription' };

  const { error } = await supabase.from('admin_push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent?.slice(0, 300) || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

async function removeSubscription(endpoint) {
  if (!isSupabaseConfigured || !supabase || !endpoint) return;
  await supabase.from('admin_push_subscriptions').delete().eq('endpoint', endpoint);
}

/** Request permission, subscribe PushManager, persist for server delivery. */
export async function enableAdminPush() {
  if (!isAdminPushSupported()) return { ok: false, reason: 'unsupported' };
  if (!isAdminPushConfigured()) return { ok: false, reason: 'not_configured' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  const reg = await getAdminRegistration();
  if (!reg) return { ok: false, reason: 'no_sw' };

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    });
  }

  const saved = await upsertSubscription(sub);
  if (!saved.ok) return saved;

  try {
    localStorage.setItem('bph_admin_push', '1');
  } catch (_) { /* ignore */ }

  return { ok: true };
}

export async function disableAdminPush() {
  const reg = await navigator.serviceWorker.getRegistration('/admin/');
  const sub = await reg?.pushManager?.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe().catch(() => {});
    await removeSubscription(endpoint);
  }
  try {
    localStorage.setItem('bph_admin_push', '0');
  } catch (_) { /* ignore */ }
  return { ok: true };
}

export async function syncAdminPushSubscription() {
  if (!isAdminPushSupported() || !isAdminPushConfigured()) return { ok: false };
  if (Notification.permission !== 'granted') return { ok: false, reason: 'no_permission' };

  const reg = await getAdminRegistration();
  const sub = await reg?.pushManager?.getSubscription();
  if (!sub) return { ok: false, reason: 'no_subscription' };
  return upsertSubscription(sub);
}

export function isAdminPushPreferred() {
  try {
    return localStorage.getItem('bph_admin_push') === '1';
  } catch {
    return false;
  }
}

export function isAdminPushBannerDismissed() {
  try {
    return localStorage.getItem('bph_admin_push_dismiss') === '1';
  } catch {
    return false;
  }
}

export function dismissAdminPushBanner() {
  try {
    localStorage.setItem('bph_admin_push_dismiss', '1');
  } catch (_) { /* ignore */ }
}
