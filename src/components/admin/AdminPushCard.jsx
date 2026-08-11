import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  disableAdminPush,
  enableAdminPush,
  explainPushFailure,
  getAdminPushStatus,
  isAdminPushConfigured,
  isAdminPushSupported,
} from '@/lib/adminPush';
import { useToast } from '@/components/ui/Toast';

/** Always-visible admin control — Enable alerts even if the top banner was dismissed. */
export function AdminPushCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const next = await getAdminPushStatus();
    setStatus(next);
    return next;
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  if (!isAdminPushConfigured()) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Push notifications are not configured on this deploy (`VITE_VAPID_PUBLIC_KEY` missing).
      </div>
    );
  }

  if (!isAdminPushSupported()) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-body">
        <p className="font-semibold text-heading">Background notifications</p>
        <p className="mt-1 text-xs text-muted">
          Open this admin panel in <strong>Chrome on Android</strong>, ideally after installing the admin app,
          then return here to enable alerts.
        </p>
      </div>
    );
  }

  const onEnable = async () => {
    setBusy(true);
    const result = await enableAdminPush();
    await refresh();
    setBusy(false);
    if (result.ok) {
      toast('Notifications enabled — you should see a test alert now.', 'success');
      return;
    }
    toast(explainPushFailure(result.reason), 'error');
  };

  const onDisable = async () => {
    setBusy(true);
    await disableAdminPush();
    await refresh();
    setBusy(false);
    toast('Notifications turned off on this device.', 'info');
  };

  const enabled = status?.permission === 'granted' && status?.subscribed;
  const blocked = status?.permission === 'denied';

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            {enabled ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-display text-sm font-bold text-heading">Background notifications</p>
            <p className="mt-1 text-xs leading-relaxed text-body">
              Alerts for callbacks, test rides, service bookings, messages, and reviews — including when the app is closed.
            </p>
            <p className="mt-2 text-[11px] font-medium text-muted">
              Status:{' '}
              {blocked && 'Blocked in browser'}
              {!blocked && enabled && 'On for this device'}
              {!blocked && !enabled && status?.permission === 'granted' && 'Permission on, but not subscribed — tap Enable'}
              {!blocked && status?.permission === 'default' && 'Not enabled yet'}
              {!status && 'Checking…'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {!blocked && !enabled && (
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
          {!blocked && enabled && (
            <>
              <button
                type="button"
                onClick={onEnable}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50 disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Test again
              </button>
              <button
                type="button"
                onClick={onDisable}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-muted transition hover:bg-white disabled:opacity-60"
              >
                <BellOff className="h-3.5 w-3.5" />
                Off
              </button>
            </>
          )}
          {blocked && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-100">
              <BellOff className="h-3.5 w-3.5" />
              Blocked — allow in Chrome site settings
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
