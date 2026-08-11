import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle2 } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SERVICE_KINDS, getServiceKind } from '@/data/serviceKinds';
import { submitServiceBooking } from './leadService';
import { isValidPhone, isValidName } from './validation';

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];

/**
 * Book free (1st/2nd/3rd) or paid scooter service at the showroom.
 * @param {{ scooters?: object[], defaultKind?: string, onSuccess?: () => void }} props
 */
export function ServiceBookingForm({ scooters = [], defaultKind = 'free_1', onSuccess }) {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [modelId, setModelId] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceKind: defaultKind,
    details: '',
    date: today,
    time: TIME_SLOTS[0],
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

  const validate = () => {
    const e = {};
    if (!isValidName(form.name)) e.name = 'Please enter your name';
    if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit number';
    if (!form.serviceKind) e.serviceKind = 'Choose a service type';
    if (!form.date) e.date = 'Pick a date';
    if (isPaid && !form.details.trim()) e.details = 'Tell us what work you need';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitServiceBooking({
        name: form.name,
        phone: form.phone,
        serviceKind: form.serviceKind,
        details: form.details.trim(),
        date: form.date,
        time: form.time,
        scooter: selectedScooter?.name || '',
        scooterId: selectedScooter?.id || null,
      });
      setDone(true);
      toast('Service booked! We will confirm shortly.', 'success');
      onSuccess?.();
    } catch {
      toast('Could not book right now. Please call or WhatsApp us.', 'error');
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
        <h3 className="text-lg font-bold text-heading">Service request sent!</h3>
        <p className="max-w-sm text-sm text-body">
          {selectedKind?.label || 'Service'} on {form.date} at {form.time}.
          We&apos;ll confirm your slot at the showroom.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-heading">Service type</p>
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
                  <span className="text-sm font-bold text-heading">{kind.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      kind.id === 'paid'
                        ? 'bg-navy/10 text-navy'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {kind.badge}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted">{kind.description}</span>
              </button>
            );
          })}
        </div>
        {errors.serviceKind && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{errors.serviceKind}</p>
        )}
      </div>

      <Field label="Your Name" htmlFor="svc-name" required error={errors.name}>
        <Input
          id="svc-name"
          placeholder="Full name"
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="Phone Number" htmlFor="svc-phone" required error={errors.phone}>
        <Input
          id="svc-phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile"
          value={form.phone}
          error={errors.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
        />
      </Field>

      {scooters.length > 0 && (
        <Field label="Scooter model (optional)" htmlFor="svc-model" hint="Helps us prepare parts & tools">
          <Select id="svc-model" value={modelId} onChange={(e) => setModelId(e.target.value)}>
            <option value="">Select if known</option>
            {scooters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Preferred date" htmlFor="svc-date" required error={errors.date}>
          <Input
            id="svc-date"
            type="date"
            min={today}
            value={form.date}
            error={errors.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </Field>
        <Field label="Preferred time" htmlFor="svc-time">
          <Select
            id="svc-time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label={isPaid ? 'What do you need?' : 'Notes (optional)'}
        htmlFor="svc-details"
        required={isPaid}
        error={errors.details}
        hint={isPaid ? 'Describe the issue, noise, battery, brakes, etc.' : 'Purchase date, invoice no., or anything we should know'}
      >
        <Textarea
          id="svc-details"
          rows={3}
          placeholder={
            isPaid
              ? 'e.g. Battery not holding charge, brake noise, controller check…'
              : 'Optional notes for the workshop'
          }
          value={form.details}
          error={errors.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
        />
      </Field>

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={Wrench}>
        Book Service
      </Button>
    </form>
  );
}
