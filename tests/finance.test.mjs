import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEMI, emiFrom } from '../src/lib/finance.js';
import { FINANCE_DEFAULTS } from '../src/config/finance.js';

test('flat-on-MRP example: ₹69,999 at 10% for 12 months + ₹2,500 files', () => {
  const r = calculateEMI({
    price: 69999,
    downPayment: 0,
    annualRate: 10,
    tenureMonths: 12,
    fileCharges: 2500,
  });
  assert.equal(r.totalInterest, 7000);
  assert.equal(r.totalPayable, 79499);
  assert.equal(r.emi, Math.round(79499 / 12));
});

test('emiFrom uses default file charges from finance config', () => {
  const emi = emiFrom({ price: 50000, settings: FINANCE_DEFAULTS });
  assert.equal(typeof emi, 'number');
  assert.ok(emi > 0);
});
