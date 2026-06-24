import { useEffect, useState } from 'react';
import { Download, X, Smartphone, Share, MoreVertical } from 'lucide-react';
import {
  dismissAdminInstall,
  hasInstallPrompt,
  isAdminInstallDismissed,
  isAdminStandalone,
  isAndroid,
  isIos,
  isMobileDevice,
  isSecureForPwa,
  promptAdminInstall,
} from '@/lib/adminPwa';

export function AdminInstallBanner() {
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const ios = isIos();
  const android = isAndroid();
  const secure = isSecureForPwa();

  useEffect(() => {
    if (isAdminStandalone() || isAdminInstallDismissed()) return;

    const onReady = () => {
      setShow(true);
      setCanInstall(hasInstallPrompt());
    };

    window.addEventListener('admin-pwa-installable', onReady);

    // Always show on mobile admin — Android needs HTTPS; banner explains how
    if (isMobileDevice()) {
      setShow(true);
      setCanInstall(hasInstallPrompt());
    }

    return () => window.removeEventListener('admin-pwa-installable', onReady);
  }, []);

  if (!show || isAdminStandalone()) return null;

  const onInstall = async () => {
    setInstalling(true);
    const { ok } = await promptAdminInstall();
    setInstalling(false);
    if (ok) setShow(false);
  };

  const onDismiss = () => {
    dismissAdminInstall();
    setShow(false);
  };

  let hint = 'Add to home screen — opens directly to your admin panel.';
  if (ios) {
    hint = 'Tap Share, then "Add to Home Screen".';
  } else if (android && !secure) {
    hint = 'Use https:// (not http://) on your phone. Run npm run dev, then open the https:// address shown in terminal.';
  } else if (android && canInstall) {
    hint = 'Tap Install below, or Chrome menu ⋮ → "Install app".';
  } else if (android) {
    hint = 'Remove any old home-screen shortcut first. Then Chrome menu ⋮ → "Install app" (not just "Add to Home screen").';
  }

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-600 p-4 text-white shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Smartphone className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-sm font-bold">Install Admin App</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/85">{hint}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {android && canInstall && (
          <button
            type="button"
            onClick={onInstall}
            disabled={installing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-brand-700 transition hover:bg-white/90 disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {installing ? 'Installing…' : 'Install'}
          </button>
        )}
        {ios && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold">
            <Share className="h-3.5 w-3.5" /> Share → Add to Home Screen
          </span>
        )}
        {android && !canInstall && secure && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold">
            <MoreVertical className="h-3.5 w-3.5" /> Menu → Install app
          </span>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl p-2 text-white/80 transition hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
