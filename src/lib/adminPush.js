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

export function explainPushFailure(reason) {
  switch (reason) {
    case 'unsupported':
      return 'Use Chrome on Android (or installed admin app). This browser cannot receive push.';
    case 'not_configured':
      return 'Push keys are missing on the server build.';
    case 'denied':
      return 'Notifications are blocked. In Chrome: site lock icon → Permissions → Notifications → Allow.';
    case 'no_sw':
      return 'Service worker failed to register. Open https://biswajitpowerhub.in/admin and retry.';
    case 'no_supabase':
      return 'Supabase is not configured.';
    case 'not_signed_in':
      return 'Sign in again, then enable alerts.';
    case 'invalid_subscription':
      return 'Browser returned an incomplete push subscription.';
    case 'subscribe_failed':
      return 'Chrome could not create a push subscription. Try installing the admin app, then Enable again.';
    default:
      return reason || 'Could not enable notifications.';
  }
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
  let reg = await navigator.serviceWorker.getRegistration('/admin/');
  if (!reg) {
    reg = await navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' });
  }
  // Ensure active worker before PushManager.subscribe
  if (reg.installing || reg.waiting || !reg.active) {
    await navigator.serviceWorker.ready;
    reg = await navigator.serviceWorker.getRegistration('/admin/') || reg;
  }
  return reg;
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
  if (!reg?.pushManager) return { ok: false, reason: 'no_sw' };

  let sub = await reg.pushManager.getSubscription();
  // Re-subscribe if missing — avoids stale empty state after SW updates
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
    } catch (err) {
      return { ok: false, reason: err?.message || 'subscribe_failed' };
    }
  }

  if (!sub) return { ok: false, reason: 'subscribe_failed' };

  const saved = await upsertSubscription(sub);
  if (!saved.ok) return saved;

  try {
    localStorage.setItem('bph_admin_push', '1');
    localStorage.removeItem('bph_admin_push_dismiss');
  } catch (_) { /* ignore */ }

  // Local proof that OS permission works (even before a lead arrives)
  try {
    await reg.showNotification('BPH Admin alerts on', {
      body: 'You will get notified for new callbacks, test rides, and messages.',
      icon: '/admin/icon-192.png',
      tag: 'bph-admin-enabled',
    });
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

export async function getAdminPushStatus() {
  const supported = isAdminPushSupported();
  const configured = isAdminPushConfigured();
  const permission = getNotificationPermission();
  let subscribed = false;
  if (supported && permission === 'granted') {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/admin/');
      subscribed = Boolean(await reg?.pushManager?.getSubscription());
    } catch (_) { /* ignore */ }
  }
  return {
    supported,
    configured,
    permission,
    subscribed,
    preferred: isAdminPushPreferred(),
  };
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
