import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const STORAGE_KEY = 'bph_no_licence_prompt_seen';
const TARGET = '/no-licence-electric-scooters-west-bengal';
const DELAY_MS = 1400;

function alreadySeen() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore private mode */
  }
}

/**
 * First-visit prompt: no-licence scooter interest.
 * No form — Yes goes to the guide; No / X / backdrop / Escape closes easily.
 */
export function FirstVisitNoLicencePrompt() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (alreadySeen()) return;
    if (pathname.startsWith('/admin')) return;
    if (pathname.includes('no-licence-electric-scooters')) {
      markSeen();
      return;
    }

    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    markSeen();
    setOpen(false);
  };

  const accept = () => {
    markSeen();
    setOpen(false);
    navigate(TARGET);
  };

  return (
    <Modal open={open} onClose={dismiss} size="sm" className="!max-w-md">
      <div className="text-center sm:text-left">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 sm:mx-0">
          <Bike className="h-6 w-6" strokeWidth={2.2} />
        </span>

        <h2 className="mt-4 font-display text-xl font-extrabold text-heading sm:text-2xl">
          Looking for a no-licence electric scooter?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-body">
          Low-speed models you can ride without a driving licence or RTO registration in West Bengal —
          from about ₹38,999 at our Berhampore showroom.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={dismiss} className="w-full sm:w-auto">
            No thanks
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={accept} className="w-full sm:w-auto">
            Yes, show me
          </Button>
        </div>
      </div>
    </Modal>
  );
}
