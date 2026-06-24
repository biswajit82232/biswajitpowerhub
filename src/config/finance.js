/**
 * Default finance settings (overridable from the Admin > Finance Settings panel,
 * persisted in Supabase `finance_settings`). These are the fallback defaults.
 */
export const FINANCE_DEFAULTS = {
  interestRate: 12, // % p.a. — flat interest on full vehicle price (CD / e-bike finance)
  downPaymentPct: 20, // default down payment as % of price
  tenureOptions: [6, 12, 18, 24, 36], // months
  defaultTenure: 12,
  minDownPaymentPct: 10,
  maxDownPaymentPct: 60,
  fileCharges: 2500, // processing fee included in total (not shown separately on site)
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

export const EMI_DISCLAIMER_NOTE =
  'Loan and down payment depend on eligibility.';
