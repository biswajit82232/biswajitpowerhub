import { useRef, useState } from 'react';
import { Star, Check, X, EyeOff, Sparkles, Camera, ImageIcon } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Stars } from '@/components/ui/StarRating';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import {
  getAllReviews,
  setReviewStatus,
  setReviewFeatured,
  setReviewPhoto,
  clearReviewPhoto,
} from '@/features/reviews/reviewService';
import { isSupabaseConfigured } from '@/lib/supabase';

const STATUS_TONE = { approved: 'success', pending: 'warning', rejected: 'danger', hidden: 'neutral' };

function ReviewPhotoAdmin({ review, onUpdated }) {
  const inputRef = useRef(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 4 * 1024 * 1024) {
      toast('Photo must be under 4 MB.', 'error');
      return;
    }
    setUploading(true);
    try {
      await setReviewPhoto(review.id, file);
      toast('Review photo updated.', 'success');
      onUpdated();
    } catch (e) {
      toast(e.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    setUploading(true);
    try {
      await clearReviewPhoto(review.id);
      toast('Photo removed.', 'success');
      onUpdated();
    } catch (e) {
      toast(e.message || 'Could not remove photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-dashed border-line bg-surface-alt/40 p-3 sm:mt-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <ImageIcon className="h-3.5 w-3.5" /> Customer photo
      </p>
      {review.photo ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <img
            src={review.photo}
            alt={`${review.name} review photo`}
            className="h-28 w-full max-w-[200px] rounded-lg object-cover ring-1 ring-line sm:h-24"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" /> Change
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={remove}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface px-3 py-3 text-sm font-medium text-brand-600 ring-1 ring-line transition hover:bg-brand-50 disabled:opacity-50 sm:w-auto sm:px-4"
        >
          <Camera className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload photo'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </div>
  );
}

export default function AdminReviews() {
  const { toast } = useToast();
  const { data: reviews, loading, refetch } = useAsync(() => getAllReviews(), []);

  const guard = () => {
    if (!isSupabaseConfigured) {
      toast('Connect Supabase to moderate reviews.', 'error');
      return false;
    }
    return true;
  };

  const act = async (fn, msg) => {
    if (!guard()) return;
    try {
      await fn();
      toast(msg, 'success');
      refetch();
    } catch (e) {
      toast(e.message || 'Action failed.', 'error');
    }
  };

  return (
    <>
      <SEO title="Reviews" noindex />
      <AdminHeader title="Review Management" subtitle="Approve, feature, or hide customer reviews." />

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
          Demo mode — showing seed reviews. Connect Supabase to moderate.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : reviews?.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-surface p-3 ring-1 ring-line shadow-soft sm:rounded-2xl sm:p-5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <p className="font-bold text-heading">{r.name}</p>
                <Stars value={r.rating} />
                <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge>
                {r.featured && <Badge tone="brand" icon={Sparkles}>Featured</Badge>}
                {r.scooter && <Badge tone="neutral">{r.scooter}</Badge>}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-body sm:mt-3">&ldquo;{r.review}&rdquo;</p>

              {isSupabaseConfigured && (
                <ReviewPhotoAdmin review={r} onUpdated={refetch} />
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap">
                <button onClick={() => act(() => setReviewStatus(r.id, 'approved'), 'Review approved.')} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 sm:text-sm">
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Approve
                </button>
                <button onClick={() => act(() => setReviewStatus(r.id, 'rejected'), 'Review rejected.')} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100 sm:text-sm">
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Reject
                </button>
                <button onClick={() => act(() => setReviewStatus(r.id, 'hidden'), 'Review hidden.')} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 sm:text-sm">
                  <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Hide
                </button>
                <button onClick={() => act(() => setReviewFeatured(r.id, !r.featured), r.featured ? 'Unfeatured.' : 'Featured.')} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 sm:text-sm">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {r.featured ? 'Unfeature' : 'Feature'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
