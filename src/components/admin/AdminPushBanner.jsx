import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import {
  dismissAdminPushBanner,
  enableAdminPush,
  getNotificationPermission,
  isAdminPushBannerDismissed,
  isAdminPushConfigured,
  isAdminPushPreferred,
  isAdminPushSupported,
  syncAdminPushSubscription,
} from '@/lib/adminPush';
import { isAndroid } from '@/lib/adminPwa';
import { useToast } from '@/components/ui/Toast';

/** Prompt logged-in admins to enable background alerts (esp. Android PWA). */
export function AdminPushBanner() {
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission());

  useEffect(() => {
    if (!isAdminPushSupported() || !isAdminPushConfigured()) return;
    if (isAdminPushBannerDismissed()) return;

    const perm = getNotificationPermission();
    setPermission(perm);

    if (perm === 'granted' && isAdminPushPreferred()) {
      syncAdminPushSubscription().catch(() => {});
      return;
    }

    if (perm === 'denied') return;
    setShow(true);
  }, []);

  if (!show) return null;

  const onEnable = async () => {
    setBusy(true);
    const result = await enableAdminPush();
    setBusy(false);
    setPermission(getNotificationPermission());

    if (result.ok) {
      toast('Notifications on — you’ll get alerts for new leads in the background.', 'success');
      setShow(false);
      return;
    }

    if (result.reason === 'denied') {
      toast('Notifications are blocked. Allow them in browser settings, then try again.', 'error');
      setShow(false);
      return;
    }

    if (result.reason === 'not_configured') {
      toast('Push keys are missing on the server.', 'error');
      return;
    }

    toast(result.reason || 'Could not enable notifications. Try again after installing the admin app.', 'error');
  };

  const onDismiss = () => {
    dismissAdminPushBanner();
    setShow(false);
  };

  const android = isAndroid();
  const hint = android
    ? 'Get alerts for callbacks, test rides, service bookings, and messages — even when Chrome is closed.'
    : 'Get alerts for new callbacks, test rides, service bookings, and messages.';

  return (
    <div className="mb-4 flex flex-col gap-2.5 rounded-xl border border-brand-100 bg-brand-50/80 p-3 text-heading sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-2xl sm:p-4">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 sm:h-10 sm:w-10 sm:rounded-xl">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xs font-bold sm:text-sm">Background notifications</p>
          <p className="mt-0.5 text-[11px] leading-snug text-body sm:text-xs sm:leading-relaxed">{hint}</p>
          {permission === 'denied' && (
            <p className="mt-1 text-[11px] font-medium text-red-600">Notifications are blocked for this site.</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {permission !== 'denied' && (
          <button
            type="button"
            onClick={onEnable}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <Bell className="h-3.5 w-3.5" />
            {busy ? 'Enabling…' : 'Enable alerts'}
          </button>
        )}
        {permission === 'denied' && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-body">
            <BellOff className="h-3.5 w-3.5" /> Blocked in browser
          </span>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl p-2 text-muted transition hover:bg-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
