import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, CheckCircle2, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { submitCallback } from '@/features/leads/leadService';
import { isValidName, isValidPhone } from '@/features/leads/validation';

const STORAGE_KEY = 'bph_no_licence_prompt_seen';
const GUIDE = '/no-licence-electric-scooters-west-bengal';
const DELAY_MS = 1400;
const INTEREST = 'No-licence scooter';

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
 * First-visit prompt with callback (name + phone) for no-licence interest.
 * Easy to exit; submissions appear under Admin → Callbacks.
 */
export function FirstVisitNoLicencePrompt() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
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

    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    markSeen();
    setOpen(false);
  };

  const validate = () => {
    const e = {};
    if (!isValidName(form.name)) e.name = 'Please enter your name';
    if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitCallback({
        name: form.name.trim(),
        phone: form.phone,
        interest: INTEREST,
      });
      markSeen();
      setDone(true);
      toast('Thanks! We will call you shortly.', 'success');
    } catch {
      toast('Could not submit. Please call or WhatsApp us.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const browseGuide = () => {
    markSeen();
    setOpen(false);
    navigate(GUIDE);
  };

  return (
    <Modal open={open} onClose={dismiss} size="sm" className="!max-w-md">
      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-2 text-center"
        >
          <CheckCircle2 className="h-11 w-11 text-brand-500" />
          <h2 className="font-display text-lg font-extrabold text-heading">We got your number</h2>
          <p className="text-sm text-body">
            Our team will call <span className="font-semibold">{form.name}</span> at {form.phone} soon
            about no-licence scooters.
          </p>
          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" size="sm" fullWidth onClick={browseGuide}>
              Browse models
            </Button>
            <Button type="button" variant="primary" size="sm" fullWidth onClick={dismiss}>
              Close
            </Button>
          </div>
        </motion.div>
      ) : (
        <div>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Bike className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-extrabold text-heading sm:text-xl">
                Looking for a no-licence electric scooter?
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-body">
                Leave your name &amp; number — we&apos;ll call you back. No spam.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <Field label="Your name" htmlFor="nl-cb-name" required error={errors.name}>
              <Input
                id="nl-cb-name"
                placeholder="Full name"
                value={form.name}
                error={errors.name}
                autoComplete="name"
                className="h-11"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Phone number" htmlFor="nl-cb-phone" required error={errors.phone}>
              <Input
                id="nl-cb-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                value={form.phone}
                error={errors.phone}
                autoComplete="tel"
                className="h-11"
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="md"
              loading={loading}
              icon={PhoneCall}
            >
              Yes — call me back
            </Button>
          </form>

          <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={browseGuide}
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Just browse models
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="text-sm font-medium text-muted hover:text-heading"
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
