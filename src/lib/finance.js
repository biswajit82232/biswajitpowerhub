/**
 * EMI calculation utilities.
 * Standard reducing-balance EMI formula:
 *   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * where r = monthly interest rate, n = number of months.
 */

export function calculateEMI({ price, downPayment = 0, annualRate, tenureMonths }) {
  const principal = Math.max(0, Number(price) - Number(downPayment));
  const n = Number(tenureMonths);
  const r = Number(annualRate) / 12 / 100;

  if (principal <= 0 || n <= 0) {
    return { emi: 0, totalInterest: 0, totalPayable: principal, principal };
  }

  let emi;
  if (r === 0) {
    emi = principal / n;
  } else {
    const factor = Math.pow(1 + r, n);
    emi = (principal * r * factor) / (factor - 1);
  }

  const totalPayable = emi * n;
  const totalInterest = totalPayable - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable + Number(downPayment)),
    principal: Math.round(principal),
  };
}

/**
 * Quick "EMI from ₹X" estimate for cards using default tenure & rate.
 */
export function emiFrom({ price, annualRate = 12, tenureMonths = 12, downPaymentPct = 20 }) {
  const downPayment = (price * downPaymentPct) / 100;
  return calculateEMI({ price, downPayment, annualRate, tenureMonths }).emi;
}
