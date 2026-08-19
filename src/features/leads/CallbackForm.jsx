import { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, CheckCircle2 } from 'lucide-react';
import { Field, Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitCallback } from './leadService';
import { isValidPhone, isValidName, isHoneypotFilled, normalizeIndianMobile, clearFieldError, focusFirstError } from './validation';
import { HoneypotField } from './HoneypotField';
import { useLocale } from '@/context/LocaleContext';

export function CallbackForm({ compact = false }) {
  const { toast } = useToast();
  const { t } = useLocale();
  const [form, setForm] = useState({ name: '', phone: '', website: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (isHoneypotFilled(form.website)) {
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
      const phone = normalizeIndianMobile(form.phone);
      await submitCallback({ name: form.name.trim(), phone });
      setDone(true);
      toast(t('toast.callbackOk'), 'success');
    } catch {
      toast(t('toast.callbackFail'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-brand-50 px-6 py-10 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-brand-500" />
        <h3 className="text-lg font-bold text-heading">{t('done.callbackTitle')}</h3>
        <p className="max-w-xs text-sm text-body">
          {t('done.callbackBody', { name: form.name, phone: normalizeIndianMobile(form.phone) || form.phone })}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`relative ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <HoneypotField value={form.website} onChange={(website) => setForm({ ...form, website })} />
      <Field label={t('form.name')} htmlFor="cb-name" required error={errors.name}>
        <Input
          id="cb-name"
          name="name"
          placeholder={t('form.fullName')}
          value={form.name}
          error={errors.name}
          autoComplete="name"
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            clearFieldError(setErrors, 'name');
          }}
        />
      </Field>
      <Field label={t('form.phone')} htmlFor="cb-phone" required error={errors.phone}>
        <Input
          id="cb-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          maxLength={16}
          placeholder={t('form.phoneHint')}
          value={form.phone}
          error={errors.phone}
          autoComplete="tel"
          onChange={(e) => {
            setForm({ ...form, phone: e.target.value });
            clearFieldError(setErrors, 'phone');
          }}
        />
      </Field>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        icon={PhoneCall}
        className="min-h-12"
      >
        {t('form.callback')}
      </Button>
    </form>
  );
}
