import { useRef, useState } from 'react';
import { Star, Check, X, EyeOff, Sparkles, Camera, ImageIcon } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
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
            <Button
              type="button"
              variant="softBrand"
              size="xs"
              icon={Camera}
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="softNeutral"
              size="xs"
              disabled={uploading}
              onClick={remove}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Camera}
          disabled={uploading}
          loading={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg sm:w-auto"
        >
          Upload photo
        </Button>
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
  const [showAll, setShowAll] = useState(false);

  const rows = (reviews || []).filter((r) => showAll || r.status === 'pending');

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
      <AdminSEO title="Reviews" />
      <AdminHeader
        title="Review Management"
        subtitle="Pending first — approve, feature, or hide customer reviews."
        action={(
          <label className="flex items-center gap-2 text-xs font-semibold text-body">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show all
          </label>
        )}
      />

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
          Demo mode — showing seed reviews. Connect Supabase to moderate.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Star} title={showAll ? 'No reviews yet' : 'No pending reviews'} />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
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
                <Button
                  type="button"
                  variant="softSuccess"
                  size="xs"
                  icon={Check}
                  onClick={() => act(() => setReviewStatus(r.id, 'approved'), 'Review approved.')}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="softDanger"
                  size="xs"
                  icon={X}
                  onClick={() => act(() => setReviewStatus(r.id, 'rejected'), 'Review rejected.')}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="softNeutral"
                  size="xs"
                  icon={EyeOff}
                  onClick={() => act(() => setReviewStatus(r.id, 'hidden'), 'Review hidden.')}
                >
                  Hide
                </Button>
                <Button
                  type="button"
                  variant="softBrand"
                  size="xs"
                  icon={Sparkles}
                  onClick={() => act(() => setReviewFeatured(r.id, !r.featured), r.featured ? 'Unfeatured.' : 'Featured.')}
                >
                  {r.featured ? 'Unfeature' : 'Feature'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
