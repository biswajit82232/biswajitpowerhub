import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle2 } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SERVICE_KINDS, getServiceKind } from '@/data/serviceKinds';
import { submitServiceBooking } from './leadService';
import { isValidPhone, isValidName, isHoneypotFilled, normalizeIndianMobile, clearFieldError, focusFirstError } from './validation';
import { HoneypotField } from './HoneypotField';
import { useLocale } from '@/context/LocaleContext';

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];

/**
 * Book free (1st/2nd/3rd) or paid scooter service at the showroom.
 * @param {{ scooters?: object[], defaultKind?: string, onSuccess?: () => void }} props
 */
export function ServiceBookingForm({ scooters = [], defaultKind = 'free_1', onSuccess }) {
  const { toast } = useToast();
  const { t } = useLocale();
  const today = new Date().toISOString().split('T')[0];
  const [modelId, setModelId] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceKind: defaultKind,
    details: '',
    date: today,
    time: TIME_SLOTS[0],
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const selectedKind = getServiceKind(form.serviceKind);
  const isPaid = form.serviceKind === 'paid';
  const selectedScooter = useMemo(
    () => (scooters || []).find((s) => s.id === modelId) || null,
    [scooters, modelId],
  );

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (isHoneypotFilled(form.website)) {
      setDone(true);
      return;
    }
    const e = {};
    if (!isValidName(form.name)) e.name = t('form.errName');
    if (!isValidPhone(form.phone)) e.phone = t('form.errPhone');
    if (!form.serviceKind) e.serviceKind = t('form.errService');
    if (!form.date) e.date = t('form.errDate');
    if (isPaid && !form.details.trim()) e.details = t('form.errDetails');
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(ev.currentTarget, e);
      return;
    }
    setLoading(true);
    try {
      await submitServiceBooking({
        name: form.name.trim(),
        phone: normalizeIndianMobile(form.phone),
        serviceKind: form.serviceKind,
        details: form.details.trim(),
        date: form.date,
        time: form.time,
        scooter: selectedScooter?.name || '',
        scooterId: selectedScooter?.id || null,
      });
      setDone(true);
      toast(t('toast.serviceOk'), 'success');
      onSuccess?.();
    } catch {
      toast(t('toast.serviceFail'), 'error');
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
        <h3 className="text-lg font-bold text-heading">{t('done.serviceTitle')}</h3>
        <p className="max-w-sm text-sm text-body">
          {t('done.serviceBody', { kind: selectedKind?.label || 'Service', date: form.date, time: form.time })}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <HoneypotField value={form.website} onChange={(website) => setForm({ ...form, website })} />
      <div>
        <p className="mb-2 text-sm font-semibold text-heading">{t('form.serviceType')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICE_KINDS.map((kind) => {
            const active = form.serviceKind === kind.id;
            return (
              <button
                key={kind.id}
                type="button"
                onClick={() => setForm({ ...form, serviceKind: kind.id })}
                aria-pressed={active}
                className={`rounded-xl px-3 py-3 text-left transition ring-1 ${
                  active
                    ? 'bg-brand-50 ring-2 ring-brand-500'
                    : 'bg-surface ring-line hover:ring-brand-200'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-heading">{t(`svc.${kind.id === 'paid' ? 'paidLabel' : kind.id.replace('_', '')}`)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      kind.id === 'paid'
                        ? 'bg-navy/10 text-navy'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {kind.id === 'paid' ? t('svc.paid') : t('svc.free')}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {t(`svc.${kind.id === 'paid' ? 'paidd' : `${kind.id.replace('_', '')}d`}`)}
                </span>
              </button>
            );
          })}
        </div>
        {errors.serviceKind && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{errors.serviceKind}</p>
        )}
      </div>

      <Field label={t('form.name')} htmlFor="svc-name" required error={errors.name}>
          <Input
            id="svc-name"
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
      <Field label={t('form.phone')} htmlFor="svc-phone" required error={errors.phone}>
          <Input
            id="svc-phone"
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

      {scooters.length > 0 && (
        <Field label={t('form.modelOptional')} htmlFor="svc-model" hint={t('svc.modelHint')}>
          <Select id="svc-model" value={modelId} onChange={(e) => setModelId(e.target.value)}>
            <option value="">{t('form.selectIfKnown')}</option>
            {scooters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('form.preferredDate')} htmlFor="svc-date" required error={errors.date}>
          <Input
            id="svc-date"
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
        <Field label={t('form.preferredTime')} htmlFor="svc-time">
          <Select
            id="svc-time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label={isPaid ? t('form.detailsPaid') : t('form.detailsFree')}
        htmlFor="svc-details"
        required={isPaid}
        error={errors.details}
        hint={isPaid ? t('svc.hintPaid') : t('svc.hintFree')}
      >
        <Textarea
          id="svc-details"
          rows={3}
          placeholder={isPaid ? t('svc.phPaid') : t('svc.phFree')}
          value={form.details}
          error={errors.details}
          name="details"
          onChange={(e) => {
            setForm({ ...form, details: e.target.value });
            clearFieldError(setErrors, 'details');
          }}
        />
      </Field>

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={Wrench}>
        {t('form.bookService')}
      </Button>
    </form>
  );
}
