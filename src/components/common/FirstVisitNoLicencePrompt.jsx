import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, PhoneCall, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useSite } from '@/context/SiteSettingsContext';
import { useLocale } from '@/context/LocaleContext';
import { submitCallback } from '@/features/leads/leadService';
import {
  isValidName,
  isValidPhone,
  isHoneypotFilled,
  normalizeIndianMobile,
  clearFieldError,
  focusFirstError,
} from '@/features/leads/validation';
import { HoneypotField } from '@/features/leads/HoneypotField';

const STORAGE_KEY = 'bph_no_licence_prompt_seen';
const GUIDE = '/no-licence-electric-scooters-west-bengal';
/** Wait longer so shoppers can browse before any interrupt. */
const DELAY_MS = 28000;
/** Only show after meaningful scroll engagement. */
const MIN_SCROLL_PX = 320;
const INTEREST = 'No-licence scooter';
const LOGO_SRC = '/logo.png';
const LOGO_FALLBACK = '/logo-192.png';

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
    /* ignore */
  }
}

/**
 * First-visit brand prompt with callback (name + phone) for no-licence interest.
 * Centered dialog; submissions appear under Admin → Callbacks.
 */
export function FirstVisitNoLicencePrompt() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { site } = useSite();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', website: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (alreadySeen()) return;
    if (pathname.startsWith('/admin')) return;
    if (pathname.includes('no-licence-electric-scooters')) {
      markSeen();
      return;
    }
    // Skip interruptive modal on conversion / form-heavy pages.
    if (
      pathname.startsWith('/contact') ||
      pathname.startsWith('/service') ||
      pathname.startsWith('/ad-landing') ||
      pathname.startsWith('/test-ride')
    ) {
      return;
    }

    let scrolledEnough = false;
    let timerReady = false;
    let opened = false;

    const tryOpen = () => {
      if (opened || alreadySeen()) return;
      if (!scrolledEnough || !timerReady) return;
      opened = true;
      setOpen(true);
    };

    const onScroll = () => {
      if (window.scrollY >= MIN_SCROLL_PX) {
        scrolledEnough = true;
        window.removeEventListener('scroll', onScroll);
        tryOpen();
      }
    };

    const t = window.setTimeout(() => {
      timerReady = true;
      tryOpen();
    }, DELAY_MS);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  const dismiss = () => {
    markSeen();
    setOpen(false);
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (isHoneypotFilled(form.website)) {
      markSeen();
      setDone(true);
      return;
    }
    const e = {};
    if (!isValidName(form.name)) e.name = t('form.errName');
    if (!isValidPhone(form.phone)) e.phone = t('form.errPhone');
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(ev.currentTarget, e);
      return;
    }
    setLoading(true);
    try {
      await submitCallback({
        name: form.name.trim(),
        phone: normalizeIndianMobile(form.phone),
        interest: INTEREST,
      });
      markSeen();
      setDone(true);
      toast(t('toast.callbackOk'), 'success');
    } catch {
      toast(t('toast.callbackFail'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const browseGuide = () => {
    markSeen();
    setOpen(false);
    navigate(GUIDE);
  };

  const brand = site?.name || 'Biswajit Power Hub';

  return (
    <Modal
      open={open}
      onClose={dismiss}
      size="sm"
      centered
      hideHeader
      className="!max-w-[22.5rem] overflow-hidden !rounded-2xl shadow-2xl ring-1 ring-navy/10 sm:!max-w-md"
    >
      <div className="relative overflow-hidden bg-white">
        {/* Brand header */}
        <div className="relative bg-navy px-5 pb-5 pt-4 text-white sm:px-6 sm:pb-6 sm:pt-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: 'linear-gradient(135deg, #A1002A 0%, transparent 55%)' }}
            aria-hidden
          />
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('prompt.close')}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>

          <div className="relative flex items-center gap-3 pr-8">
            <img
              src={LOGO_SRC}
              alt=""
              width={48}
              height={48}
              className="h-11 w-auto max-w-[5.5rem] rounded-lg bg-white object-contain px-1.5 py-1 shadow-sm"
              onError={(e) => {
                if (e.currentTarget.src.includes(LOGO_FALLBACK)) return;
                e.currentTarget.src = LOGO_FALLBACK;
              }}
            />
            <div className="min-w-0">
              <p className="font-display text-sm font-extrabold tracking-wide text-white sm:text-base">
                {brand}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                Berhampore · Murshidabad
              </p>
            </div>
          </div>

          <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-200">
            {t('prompt.kicker')}
          </p>
          <h2 className="relative mt-1.5 font-display text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
            {t('prompt.title')}
          </h2>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <CheckCircle2 className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <h3 className="mt-3 font-display text-lg font-extrabold text-navy">
                {t('done.callbackTitle')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-body">
                {t('prompt.receivedBody', {
                  brand,
                  name: form.name,
                  phone: normalizeIndianMobile(form.phone) || form.phone,
                })}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Button type="button" variant="dealerPrimary" fullWidth onClick={browseGuide}>
                  {t('prompt.viewModels')}
                </Button>
                <Button type="button" variant="ghost" size="sm" fullWidth onClick={dismiss}>
                  {t('prompt.close')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-body">
                {t('prompt.body')}
              </p>

              <form onSubmit={onSubmit} className="relative mt-4 space-y-3">
                <HoneypotField
                  id="nl-cb-website"
                  value={form.website}
                  onChange={(website) => setForm({ ...form, website })}
                />
                <Field label={t('form.name')} htmlFor="nl-cb-name" required error={errors.name}>
                  <Input
                    id="nl-cb-name"
                    name="name"
                    placeholder={t('form.fullName')}
                    value={form.name}
                    error={errors.name}
                    autoComplete="name"
                    className="h-11"
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      clearFieldError(setErrors, 'name');
                    }}
                  />
                </Field>
                <Field label={t('form.phone')} htmlFor="nl-cb-phone" required error={errors.phone}>
                  <Input
                    id="nl-cb-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={16}
                    placeholder={t('form.phoneHint')}
                    value={form.phone}
                    error={errors.phone}
                    autoComplete="tel"
                    className="h-11"
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      clearFieldError(setErrors, 'phone');
                    }}
                  />
                </Field>

                <Button
                  type="submit"
                  variant="dealerPrimary"
                  fullWidth
                  loading={loading}
                  icon={PhoneCall}
                >
                  {t('form.callback')}
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={browseGuide}
                  className="text-xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-700"
                >
                  {t('prompt.browse')}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="text-xs font-medium text-muted hover:text-heading"
                >
                  {t('prompt.notNow')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
