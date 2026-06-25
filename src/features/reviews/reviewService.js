import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { REVIEWS } from '@/data/reviews';

const CACHE_KEY = 'reviews_approved_v3';
const CACHE_TTL = 60;

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

function bustReviewCache() {
  clearCache(CACHE_KEY);
  clearCache('reviews_approved');
}

/** Upload a customer review photo to Supabase Storage. Falls back to base64 in demo mode. */
export async function uploadReviewPhoto(file) {
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from('review-photos')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from('review-photos').getPublicUrl(path);
        return data.publicUrl;
      }
      console.warn('[Storage] Review photo upload failed:', error.message);
      throw new Error(error.message || 'Image upload failed');
    } catch (e) {
      console.warn('[Storage] Review photo upload exception:', e);
      throw e instanceof Error ? e : new Error('Image upload failed');
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Public: only approved reviews — cached 60s. */
export async function getApprovedReviews() {
  return fetchWithCache(CACHE_KEY, async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error) {
        return (data || []).map(fromRow);
      }

      console.warn('[Reviews] Supabase fetch failed:', error.message);
      return REVIEWS.filter((r) => r.status === 'approved');
    }

    return REVIEWS.filter((r) => r.status === 'approved');
  }, CACHE_TTL);
}

export async function getFeaturedReviews(limit = 6) {
  const all = await getApprovedReviews();
  const featured = all.filter((r) => r.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** Public submission — clears review cache so new count shows after approval. */
export async function submitReview({ name, rating, review, scooter, photo, photoFile }) {
  let photoUrl = photo || null;
  if (photoFile) {
    photoUrl = await uploadReviewPhoto(photoFile);
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('reviews').insert({
      name,
      rating,
      review,
      scooter,
      photo_url: photoUrl,
      status: 'pending',
      featured: false,
    });
    if (error) throw error;
    return { ok: true };
  }
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
    return (data || []).map(fromRow);
  }
  return REVIEWS;
}

export async function setReviewStatus(id, status) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
  bustReviewCache();
}

export async function setReviewFeatured(id, featured) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('reviews').update({ featured }).eq('id', id);
  if (error) throw error;
  bustReviewCache();
}

export async function setReviewPhoto(id, photoFile) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const photoUrl = await uploadReviewPhoto(photoFile);
  const { error } = await supabase.from('reviews').update({ photo_url: photoUrl }).eq('id', id);
  if (error) throw error;
  bustReviewCache();
  return photoUrl;
}

export async function clearReviewPhoto(id) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('reviews').update({ photo_url: null }).eq('id', id);
  if (error) throw error;
  bustReviewCache();
}
