import { Star, Check, X, EyeOff, Sparkles } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Stars } from '@/components/ui/StarRating';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { getAllReviews, setReviewStatus, setReviewFeatured } from '@/features/reviews/reviewService';
import { isSupabaseConfigured } from '@/lib/supabase';

const STATUS_TONE = { approved: 'success', pending: 'warning', rejected: 'danger', hidden: 'neutral' };

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
        <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
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
            <div key={r.id} className="rounded-2xl bg-surface p-5 ring-1 ring-line shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-heading">{r.name}</p>
                <Stars value={r.rating} />
                <Badge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge>
                {r.featured && <Badge tone="brand" icon={Sparkles}>Featured</Badge>}
                {r.scooter && <Badge tone="neutral">{r.scooter}</Badge>}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-body">“{r.review}”</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => act(() => setReviewStatus(r.id, 'approved'), 'Review approved.')} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100">
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button onClick={() => act(() => setReviewStatus(r.id, 'rejected'), 'Review rejected.')} className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100">
                  <X className="h-4 w-4" /> Reject
                </button>
                <button onClick={() => act(() => setReviewStatus(r.id, 'hidden'), 'Review hidden.')} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
                  <EyeOff className="h-4 w-4" /> Hide
                </button>
                <button onClick={() => act(() => setReviewFeatured(r.id, !r.featured), r.featured ? 'Unfeatured.' : 'Featured.')} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-100">
                  <Sparkles className="h-4 w-4" /> {r.featured ? 'Unfeature' : 'Feature'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
