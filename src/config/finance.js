/**
 * Default finance settings (overridable from the Admin > Finance Settings panel,
 * persisted in Supabase `finance_settings`). These are the fallback defaults.
 */
export const FINANCE_DEFAULTS = {
  interestRate: 12, // annual % reducing-balance approximation (flat-style indicative)
  downPaymentPct: 20, // default down payment as % of price
  tenureOptions: [6, 12, 18, 24, 36], // months
  defaultTenure: 12,
  minDownPaymentPct: 10,
  maxDownPaymentPct: 60,
  promo: {
    active: false,
    label: '',
  },
  // EV Usage Simulator — petrol comparison defaults
  petrolPricePerLitre: 110, // ₹/L
  petrolMileageKmPerLitre: 40, // km/L for a typical petrol scooter
};

export const EMI_DISCLAIMER =
  'EMI values are indicative and subject to lender approval.';
