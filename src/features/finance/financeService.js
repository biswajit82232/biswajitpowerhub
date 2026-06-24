import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { FINANCE_DEFAULTS } from '@/config/finance';

const ROW_ID = 1; // single-row settings table

export async function getFinanceSettings() {
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
      };
    }
  }
  return FINANCE_DEFAULTS;
}

export async function saveFinanceSettings(settings) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured.');
  const { error } = await supabase.from('finance_settings').upsert({
    id: ROW_ID,
    interest_rate: settings.interestRate,
    down_payment_pct: settings.downPaymentPct,
    tenure_options: settings.tenureOptions,
    default_tenure: settings.defaultTenure,
    min_down_payment_pct: settings.minDownPaymentPct,
    max_down_payment_pct: settings.maxDownPaymentPct,
    promo: settings.promo,
    petrol_price_per_litre: settings.petrolPricePerLitre,
    petrol_mileage_km_per_litre: settings.petrolMileageKmPerLitre,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
