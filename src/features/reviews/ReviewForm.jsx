import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Camera, X, ImagePlus } from 'lucide-react';
import { Field, Input, Textarea, Select, Label } from '@/components/ui/Input';
import { StarInput } from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitReview } from './reviewService';
import { isValidName } from '@/features/leads/validation';
import { cn } from '@/lib/utils';

const MAX_SIZE_MB = 4;
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

function PhotoUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onChange(null, 'Only image files are supported.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onChange(null, `Photo must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result, null);
    reader.readAsDataURL(file);
  };

  const onFileInput = (e) => processFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const clear = (e) => {
    e.stopPropagation();
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <img
          src={value}
          alt="Preview"
          className="h-24 w-24 rounded-xl object-cover ring-2 ring-brand-200 shadow-soft"
        />
        <button
          type="button"
          onClick={clear}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
          aria-label="Remove photo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
        >
          <Camera className="h-3.5 w-3.5" /> Change photo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={onFileInput}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-all',
        dragging
          ? 'border-brand-400 bg-brand-50 scale-[1.01]'
          : 'border-line bg-surface-alt/60 hover:border-brand-300 hover:bg-brand-50/40'
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-cyan-500 shadow-sm">
        <ImagePlus className="h-5 w-5 text-white" />
      </span>
      <div>
        <p className="text-sm font-semibold text-heading">
          Tap to upload <span className="text-brand-600">a photo</span>
        </p>
        <p className="mt-0.5 text-xs text-muted">JPG, PNG, WebP — max {MAX_SIZE_MB} MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={onFileInput}
      />
    </div>
  );
}

export function ReviewForm({ scooters = [] }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', rating: 5, review: '', scooter: '', photo: '' });
  const [photoError, setPhotoError] = useState('');
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

  const handlePhoto = (dataUrl, error) => {
    setPhotoError(error || '');
    setForm((f) => ({ ...f, photo: dataUrl || '' }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitReview(form);
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
          <PhotoUpload value={form.photo} onChange={handlePhoto} />
        </div>
        {photoError && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{photoError}</p>
        )}
      </div>

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={Send}>
        Submit Review
      </Button>
    </form>
  );
}
