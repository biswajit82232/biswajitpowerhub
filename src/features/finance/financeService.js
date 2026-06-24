import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchWithCache, clearCache } from '@/lib/cache';
import { FINANCE_DEFAULTS } from '@/config/finance';

/** Upload a hero image to Supabase Storage (or base64 fallback). */
export async function uploadHeroImage(file) {
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `hero/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('scooter-images')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from('scooter-images').getPublicUrl(path);
        return data.publicUrl;
      }
      console.warn('[Storage] Hero upload failed, using base64:', error.message);
    } catch (e) {
      console.warn('[Storage] Hero upload exception, using base64:', e);
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ROW_ID = 1; // single-row settings table

export async function getFinanceSettings() {
  return fetchWithCache('finance_settings', async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('finance_settings')
        .select('*')
        .eq('id', ROW_ID)
        .single();
      if (!error && data) {
        return {
          interestRate: Number(data.interest_rate),
          downPaymentPct: Number(data.down_payment_pct),
          tenureOptions: data.tenure_options || FINANCE_DEFAULTS.tenureOptions,
          defaultTenure: Number(data.default_tenure) || FINANCE_DEFAULTS.defaultTenure,
          minDownPaymentPct: Number(data.min_down_payment_pct) || FINANCE_DEFAULTS.minDownPaymentPct,
          maxDownPaymentPct: Number(data.max_down_payment_pct) || FINANCE_DEFAULTS.maxDownPaymentPct,
          promo: data.promo || FINANCE_DEFAULTS.promo,
          petrolPricePerLitre: Number(data.petrol_price_per_litre) || FINANCE_DEFAULTS.petrolPricePerLitre,
          petrolMileageKmPerLitre: Number(data.petrol_mileage_km_per_litre) || FINANCE_DEFAULTS.petrolMileageKmPerLitre,
          heroImageUrl: data.hero_image_url || null,
        };
      }
    }
    return FINANCE_DEFAULTS;
  }, 10 * 60); // 10 min — settings change rarely
}

export async function saveFinanceSettings(settings) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  clearCache('finance_settings');
  const row = {
    id: ROW_ID,
    interest_rate: settings.interestRate,
    down_payment_pct: settings.downPaymentPct,
    tenure_options: settings.tenureOptions,
    default_tenure: settings.defaultTenure,
    min_down_payment_pct: settings.minDownPaymentPct,
    max_down_payment_pct: settings.maxDownPaymentPct,
    petrol_price_per_litre: settings.petrolPricePerLitre,
    petrol_mileage_km_per_litre: settings.petrolMileageKmPerLitre,
    hero_image_url: settings.heroImageUrl ?? null,
    updated_at: new Date().toISOString(),
  };
  if (settings.promo !== undefined) row.promo = settings.promo;
  const { error } = await supabase.from('finance_settings').upsert(row);
  if (error) throw error;
}
