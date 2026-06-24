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

export async function getFinanceSettings({ bypassCache = false } = {}) {
  if (bypassCache) clearCache('finance_settings');

  return fetchWithCache('finance_settings', async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('finance_settings')
        .select('*')
        .eq('id', ROW_ID)
        .single();
      if (error) {
        console.warn('[finance] Failed to load settings:', error.message);
      }
      if (!error && data) {
        return {
          interestRate: Number(data.interest_rate ?? FINANCE_DEFAULTS.interestRate),
          downPaymentPct: Number(data.down_payment_pct ?? FINANCE_DEFAULTS.downPaymentPct),
          tenureOptions: data.tenure_options || FINANCE_DEFAULTS.tenureOptions,
          defaultTenure: Number(data.default_tenure ?? FINANCE_DEFAULTS.defaultTenure),
          minDownPaymentPct: Number(data.min_down_payment_pct ?? FINANCE_DEFAULTS.minDownPaymentPct),
          maxDownPaymentPct: Number(data.max_down_payment_pct ?? FINANCE_DEFAULTS.maxDownPaymentPct),
          fileCharges: Number(data.file_charges ?? FINANCE_DEFAULTS.fileCharges),
          promo: data.promo || FINANCE_DEFAULTS.promo,
          petrolPricePerLitre: Number(data.petrol_price_per_litre ?? FINANCE_DEFAULTS.petrolPricePerLitre),
          petrolMileageKmPerLitre: Number(data.petrol_mileage_km_per_litre ?? FINANCE_DEFAULTS.petrolMileageKmPerLitre),
          heroImageUrl: data.hero_image_url || null,
        };
      }
    }
    return { ...FINANCE_DEFAULTS, heroImageUrl: null };
  }, 60); // 1 min — admin changes should show on site quickly
}

export async function saveFinanceSettings(settings) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const row = {
    id: ROW_ID,
    interest_rate: settings.interestRate,
    down_payment_pct: settings.downPaymentPct,
    tenure_options: settings.tenureOptions,
    default_tenure: settings.defaultTenure,
    min_down_payment_pct: settings.minDownPaymentPct,
    max_down_payment_pct: settings.maxDownPaymentPct,
    file_charges: settings.fileCharges,
    petrol_price_per_litre: settings.petrolPricePerLitre,
    petrol_mileage_km_per_litre: settings.petrolMileageKmPerLitre,
    updated_at: new Date().toISOString(),
  };
  if (settings.promo !== undefined) row.promo = settings.promo;
  const { error } = await supabase.from('finance_settings').upsert(row);
  if (error) throw error;
  clearCache('finance_settings');
}

/** Save homepage hero image only (stored in finance_settings.hero_image_url). */
export async function saveHeroImage(heroImageUrl) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase
    .from('finance_settings')
    .update({
      hero_image_url: heroImageUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ROW_ID);
  if (error) throw error;
  clearCache('finance_settings');
}
