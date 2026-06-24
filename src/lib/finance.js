import { FINANCE_DEFAULTS } from '@/config/finance';

/**
 * CD / e-bike finance (Bajaj-style consumer durable loans):
 * - Flat interest on the **full vehicle price** (not loan amount after down payment)
 * - Processing / file charges added to the total
 * - Down payment paid upfront; remaining balance split into equal monthly EMIs
 *
 * Example @ ₹69,999, 10% p.a., 12 mo, ₹2,500 file charge:
 *   interest = 69,999 × 10% = ₹6,999
 *   total    = 69,999 + 6,999 + 2,500 = ₹79,498
 */

export function calculateEMI({ price, downPayment = 0, annualRate, tenureMonths, fileCharges = 0 }) {
  const vehiclePrice = Math.max(0, Number(price));
  const down = Math.max(0, Number(downPayment));
  const n = Number(tenureMonths);
  const rate = Number(annualRate);
  const files = Math.max(0, Number(fileCharges));

  if (vehiclePrice <= 0 || n <= 0) {
    return {
      emi: 0,
      totalInterest: 0,
      totalPayable: down,
      loanAmount: Math.max(0, vehiclePrice - down),
      balanceViaEmi: 0,
      fileCharges: files,
    };
  }

  // Flat interest on full ex-showroom / vehicle price, pro-rated for tenure
  const flatInterest = vehiclePrice * (rate / 100) * (n / 12);
  const totalPayable = vehiclePrice + flatInterest + files;
  const balanceViaEmi = Math.max(0, totalPayable - down);
  const emi = balanceViaEmi / n;
  const loanAmount = Math.max(0, vehiclePrice - down);

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(flatInterest),
    totalPayable: Math.round(totalPayable),
    loanAmount: Math.round(loanAmount),
    balanceViaEmi: Math.round(balanceViaEmi),
    fileCharges: Math.round(files),
  };
}

/**
 * Quick "EMI from ₹X" estimate for cards — uses admin finance settings when provided.
 */
export function emiFrom({ price, annualRate, tenureMonths, downPaymentPct, settings } = {}) {
  const merged = { ...FINANCE_DEFAULTS, ...settings };
  const rate = annualRate ?? merged.interestRate;
  const tenure = tenureMonths ?? merged.defaultTenure;
  const downPct = downPaymentPct ?? merged.downPaymentPct;
  const downPayment = (Number(price) * downPct) / 100;
  return calculateEMI({
    price,
    downPayment,
    annualRate: rate,
    tenureMonths: tenure,
    fileCharges: merged.fileCharges,
  }).emi;
}
