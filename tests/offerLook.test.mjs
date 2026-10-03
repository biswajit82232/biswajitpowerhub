import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPercentCopy, offerHeadline, offerLook, offerSupport, presentOffers } from '../src/components/offers/offerLook.js';

const t = (key, vars) => (vars?.pct != null ? `${key}:${vars.pct}` : key);

test('a sale offer is named, not written as a percent', () => {
  const offer = {
    kind: 'scooter_sale',
    title: 'Showroom Sale',
    discountText: '10% OFF',
    discountPercent: 10,
  };
  assert.equal(isPercentCopy('10% OFF'), true);
  assert.equal(offerHeadline(offer, t), 'Showroom Sale');
  assert.equal(offerSupport(offer), '');
  assert.equal(offerLook(offer, t).chip, null);
  assert.equal(presentOffers([offer, { id: 'gift', kind: 'free_with_purchase', sortOrder: 1 }]).map((row) => row.kind).join(','), 'free_with_purchase');
});

test('a promo keeps its offer line and code', () => {
  const offer = {
    kind: 'promo',
    title: 'Durga Puja Special',
    discountText: 'Up to ₹3,000 off',
    promoCode: 'PUJA',
  };
  assert.equal(offerHeadline(offer, t), 'Up to ₹3,000 off');
  assert.equal(offerSupport(offer), 'Durga Puja Special');
  assert.equal(offerLook(offer, t).chip, 'PUJA');
});
