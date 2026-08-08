import { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, CheckCircle2 } from 'lucide-react';
import { Field, Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitCallback } from './leadService';
import { isValidPhone, isValidName } from './validation';

export function CallbackForm({ compact = false }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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
      await submitCallback(form);
      setDone(true);
      toast('Thanks! We will call you back shortly.', 'success');
    } catch {
      toast('Something went wrong. Please try WhatsApp or call us.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-accent-50 px-6 py-10 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-accent-500" />
        <h3 className="text-lg font-bold text-heading">Request received!</h3>
        <p className="max-w-xs text-sm text-body">
          Our team will call <span className="font-semibold">{form.name}</span> at {form.phone} very soon.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
      <Field label="Your Name" htmlFor="cb-name" required error={errors.name}>
        <Input
          id="cb-name"
          placeholder="e.g. Rahul Sharma"
          value={form.name}
          error={errors.name}
          autoComplete="name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="Phone Number" htmlFor="cb-phone" required error={errors.phone}>
        <Input
          id="cb-phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={form.phone}
          error={errors.phone}
          autoComplete="tel"
          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
        />
      </Field>
      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={PhoneCall}>
        Request Callback
      </Button>
      <p className="text-center text-xs text-muted">
        We respect your privacy. No spam, ever.
      </p>
    </form>
  );
}
