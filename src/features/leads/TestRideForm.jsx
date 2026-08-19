import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Field, Input, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitTestRide } from './leadService';
import { isValidPhone, isValidName, isHoneypotFilled, normalizeIndianMobile, clearFieldError, focusFirstError } from './validation';
import { HoneypotField } from './HoneypotField';
import { useLocale } from '@/context/LocaleContext';

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];

/**
 * @param {{ scooter?: object, scooters?: object[], onSuccess?: () => void }} props
 * Pass `scooter` on product pages, or `scooters` list on SEO/landing pages.
 */
export function TestRideForm({ scooter, scooters = [], onSuccess }) {
  const { toast } = useToast();
  const { t } = useLocale();
  const today = new Date().toISOString().split('T')[0];
  const [modelId, setModelId] = useState(scooter?.id || '');
  const [form, setForm] = useState({ name: '', phone: '', date: today, time: TIME_SLOTS[0], website: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const selected = useMemo(() => {
    if (scooter) return scooter;
    return (scooters || []).find((s) => s.id === modelId) || null;
  }, [scooter, scooters, modelId]);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (isHoneypotFilled(form.website)) {
      setDone(true);
      return;
    }
    const e = {};
    if (!isValidName(form.name)) e.name = t('form.errName');
    if (!isValidPhone(form.phone)) e.phone = t('form.errPhone');
    if (!form.date) e.date = t('form.errDate');
    if (!scooter && scooters.length && !modelId) e.model = t('form.errModel');
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(ev.currentTarget, e);
      return;
    }
    setLoading(true);
    try {
      await submitTestRide({
        name: form.name.trim(),
        phone: normalizeIndianMobile(form.phone),
        date: form.date,
        time: form.time,
        scooter: selected?.selectedVariant
          ? `${selected.name} — ${selected.selectedVariant.name}`
          : selected?.name || 'Any model',
        scooterId: selected?.id,
      });
      setDone(true);
      toast(t('toast.rideOk'), 'success');
      onSuccess?.();
    } catch {
      toast(t('toast.rideFail'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-brand-500" />
        <h3 className="text-lg font-bold text-heading">{t('done.rideTitle')}</h3>
        <p className="max-w-xs text-sm text-body">
          {t('done.rideBody', { model: selected?.name || 'scooter', date: form.date, time: form.time })}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <HoneypotField value={form.website} onChange={(website) => setForm({ ...form, website })} />
      <Field label={t('form.name')} htmlFor="tr-name" required error={errors.name}>
        <Input
          id="tr-name"
          name="name"
          placeholder={t('form.fullName')}
          value={form.name}
          error={errors.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            clearFieldError(setErrors, 'name');
          }}
        />
      </Field>
      <Field label={t('form.phone')} htmlFor="tr-phone" required error={errors.phone}>
        <Input
          id="tr-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          maxLength={16}
          placeholder={t('form.phoneHint')}
          value={form.phone}
          error={errors.phone}
          onChange={(e) => {
            setForm({ ...form, phone: e.target.value });
            clearFieldError(setErrors, 'phone');
          }}
        />
      </Field>
      {!scooter && scooters.length > 0 ? (
        <Field label={t('form.model')} htmlFor="tr-model" required error={errors.model}>
          <Select
            id="tr-model"
            name="model"
            value={modelId}
            error={errors.model}
            onChange={(e) => {
              setModelId(e.target.value);
              clearFieldError(setErrors, 'model');
            }}
          >
            <option value="">{t('form.selectModel')}</option>
            {scooters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('form.date')} htmlFor="tr-date" required error={errors.date}>
          <Input
            id="tr-date"
            name="date"
            type="date"
            min={today}
            value={form.date}
            error={errors.date}
            onChange={(e) => {
              setForm({ ...form, date: e.target.value });
              clearFieldError(setErrors, 'date');
            }}
          />
        </Field>
        <Field label={t('form.time')} htmlFor="tr-time">
          <Select id="tr-time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={CalendarCheck}>
        {t('form.bookRide')}
      </Button>
    </form>
  );
}
