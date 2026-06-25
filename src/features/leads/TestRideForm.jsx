import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Field, Input, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitTestRide } from './leadService';
import { isValidPhone, isValidName } from './validation';

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];

export function TestRideForm({ scooter, onSuccess }) {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ name: '', phone: '', date: today, time: TIME_SLOTS[0] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!isValidName(form.name)) e.name = 'Please enter your name';
    if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit number';
    if (!form.date) e.date = 'Pick a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitTestRide({
        ...form,
        scooter: scooter?.selectedVariant
          ? `${scooter.name} — ${scooter.selectedVariant.name}`
          : scooter?.name,
        scooterId: scooter?.id,
      });
      setDone(true);
      toast('Test ride booked! We will confirm shortly.', 'success');
      onSuccess?.();
    } catch {
      toast('Could not book right now. Please WhatsApp us.', 'error');
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
        <CheckCircle2 className="h-12 w-12 text-accent-500" />
        <h3 className="text-lg font-bold text-heading">Test ride requested!</h3>
        <p className="max-w-xs text-sm text-body">
          We'll confirm your {scooter?.name} test ride on {form.date} at {form.time}.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Your Name" htmlFor="tr-name" required error={errors.name}>
        <Input
          id="tr-name"
          placeholder="Full name"
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="Phone Number" htmlFor="tr-phone" required error={errors.phone}>
        <Input
          id="tr-phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile"
          value={form.phone}
          error={errors.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date" htmlFor="tr-date" required error={errors.date}>
          <Input
            id="tr-date"
            type="date"
            min={today}
            value={form.date}
            error={errors.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </Field>
        <Field label="Time" htmlFor="tr-time">
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
        Book Test Ride
      </Button>
    </form>
  );
}
