import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { REVIEWS } from '@/data/reviews';

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    rating: Number(row.rating),
    review: row.review,
    scooter: row.scooter,
    photo: row.photo_url || '',
    status: row.status,
    featured: row.featured,
    created_at: row.created_at,
  };
}

/** Public: only approved reviews. */
export async function getApprovedReviews() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error && data) return data.map(fromRow);
  }
  return REVIEWS.filter((r) => r.status === 'approved');
}

export async function getFeaturedReviews(limit = 6) {
  const all = await getApprovedReviews();
  const featured = all.filter((r) => r.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** Public submission — defaults to pending status for moderation. */
export async function submitReview({ name, rating, review, scooter, photo }) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('reviews').insert({
      name,
      rating,
      review,
      scooter,
      photo_url: photo || null,
      status: 'pending',
      featured: false,
    });
    if (error) throw error;
    return { ok: true };
  }
  // Demo mode
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, demo: true };
}

/* ---------- Admin ---------- */

export async function getAllReviews() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(fromRow);
  }
  return REVIEWS;
}

export async function setReviewStatus(id, status) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function setReviewFeatured(id, featured) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('reviews').update({ featured }).eq('id', id);
  if (error) throw error;
}
