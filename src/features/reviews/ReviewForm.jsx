import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { Field, Input, Textarea, Select, Label } from '@/components/ui/Input';
import { StarInput } from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitReview } from './reviewService';
import { ReviewPhotoUpload } from './ReviewPhotoUpload';
import { isValidName, isHoneypotFilled, clearFieldError, focusFirstError } from '@/features/leads/validation';
import { HoneypotField } from '@/features/leads/HoneypotField';
import { useLocale } from '@/context/LocaleContext';

export function ReviewForm({ scooters = [] }) {
  const { toast } = useToast();
  const { t } = useLocale();
  const [form, setForm] = useState({ name: '', rating: 5, review: '', scooter: '', website: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handlePhoto = ({ file, preview }) => {
    setPhotoFile(file);
    setPhotoPreview(preview || '');
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (isHoneypotFilled(form.website)) {
      setDone(true);
      return;
    }
    const e = {};
    if (!isValidName(form.name)) e.name = t('form.errName');
    const rating = Number(form.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      e.rating = t('form.errRating');
    }
    if (!form.review || form.review.trim().length < 10) e.review = t('form.errReview');
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(ev.currentTarget, e);
      return;
    }
    setLoading(true);
    try {
      await submitReview({ ...form, photoFile });
      setDone(true);
      toast(t('toast.reviewOk'), 'success');
    } catch {
      toast(t('toast.reviewFail'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-8 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-brand-500" />
        <h3 className="text-lg font-bold text-heading">{t('done.reviewTitle')}</h3>
        <p className="max-w-xs text-sm text-body">
          {t('done.reviewBody', { name: form.name })}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <HoneypotField value={form.website} onChange={(website) => setForm({ ...form, website })} />
      <Field label={t('review.name')} htmlFor="rv-name" required error={errors.name}>
        <Input
          id="rv-name"
          name="name"
          placeholder="Full name"
          value={form.name}
          error={errors.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            clearFieldError(setErrors, 'name');
          }}
        />
      </Field>

      <div>
        <Label>{t('review.rating')}</Label>
        <StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
        {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
      </div>

      <Field label={t('review.scooter')} htmlFor="rv-scooter">
        <Select
          id="rv-scooter"
          value={form.scooter}
          onChange={(e) => setForm({ ...form, scooter: e.target.value })}
        >
          <option value="">{t('review.selectModel')}</option>
          {scooters.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t('review.story')} htmlFor="rv-text" required error={errors.review}>
        <Textarea
          id="rv-text"
          name="review"
          rows={4}
          placeholder={t('review.placeholder')}
          value={form.review}
          error={errors.review}
          onChange={(e) => {
            setForm({ ...form, review: e.target.value });
            clearFieldError(setErrors, 'review');
          }}
        />
      </Field>

      <div>
        <Label>{t('review.photo')} <span className="ml-1 text-xs font-normal text-muted">({t('form.optional')})</span></Label>
        <div className="mt-1.5">
          <ReviewPhotoUpload
            preview={photoPreview}
            onChange={handlePhoto}
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={Send}>
        {t('review.submit')}
      </Button>
    </form>
  );
}
