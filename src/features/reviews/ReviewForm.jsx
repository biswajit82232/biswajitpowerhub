import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { Field, Input, Textarea, Select, Label } from '@/components/ui/Input';
import { StarInput } from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitReview } from './reviewService';
import { ReviewPhotoUpload } from './ReviewPhotoUpload';
import { isValidName } from '@/features/leads/validation';

export function ReviewForm({ scooters = [] }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', rating: 5, review: '', scooter: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!isValidName(form.name)) e.name = 'Please enter your name';
    if (!form.review || form.review.trim().length < 10) e.review = 'Tell us a little more (10+ characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhoto = ({ file, preview }) => {
    setPhotoFile(file);
    setPhotoPreview(preview || '');
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitReview({ ...form, photoFile });
      setDone(true);
      toast('Thank you! Your review is awaiting approval.', 'success');
    } catch {
      toast('Could not submit review. Please try again.', 'error');
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
        <CheckCircle2 className="h-12 w-12 text-accent-500" />
        <h3 className="text-lg font-bold text-heading">Review submitted!</h3>
        <p className="max-w-xs text-sm text-body">
          Thanks for sharing, {form.name}. We'll publish it after a quick review.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Your Name" htmlFor="rv-name" required error={errors.name}>
        <Input
          id="rv-name"
          placeholder="Full name"
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      <div>
        <Label>Your Rating</Label>
        <StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
      </div>

      <Field label="Scooter Purchased" htmlFor="rv-scooter">
        <Select
          id="rv-scooter"
          value={form.scooter}
          onChange={(e) => setForm({ ...form, scooter: e.target.value })}
        >
          <option value="">Select a model (optional)</option>
          {scooters.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Your Review" htmlFor="rv-text" required error={errors.review}>
        <Textarea
          id="rv-text"
          rows={4}
          placeholder="Share your experience…"
          value={form.review}
          error={errors.review}
          onChange={(e) => setForm({ ...form, review: e.target.value })}
        />
      </Field>

      <div>
        <Label>Photo <span className="ml-1 text-xs font-normal text-muted">(optional)</span></Label>
        <div className="mt-1.5">
          <ReviewPhotoUpload
            preview={photoPreview}
            onChange={handlePhoto}
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={Send}>
        Submit Review
      </Button>
    </form>
  );
}
