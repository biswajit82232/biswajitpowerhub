import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  describePriceRange,
  isScooterSale,
  normalizeSalePercent,
  quotePrice,
  quoteStartingPrice,
  roundSalePrice,
  saleForScooter,
} from '../src/lib/salePrice.js';

const activa = {
  id: 'activa',
  price: 50000,
  variants: [
    { id: 'std', name: 'Standard', price: 45000 },
    { id: 'pro', name: 'Lithium Pro', price: 52000 },
  ],
};

function sale(overrides = {}) {
  return {
    id: 'sale-1',
    kind: 'scooter_sale',
    active: true,
    discountPercent: 10,
    scooterIds: ['activa'],
    sortOrder: 0,
    ...overrides,
  };
}

test('rounds a percent off to the nearest rupee', () => {
  assert.equal(roundSalePrice(45000, 10), 40500);
  assert.equal(roundSalePrice(49999, 10), 44999);
  assert.equal(roundSalePrice(1000, 0), 1000);
  assert.equal(normalizeSalePercent(10.4), 10);
  assert.equal(normalizeSalePercent(0), null);
  assert.equal(normalizeSalePercent(95), null);
});

test('quotes list price when the scooter is not on sale', () => {
  const quote = quotePrice(45000, null);
  assert.equal(quote.onSale, false);
  assert.equal(quote.sale, 45000);
  assert.equal(quote.saved, 0);
});

test('applies the sale to the starting pack and every variant', () => {
  const offers = [sale()];
  const start = quoteStartingPrice(activa, offers);
  assert.equal(start.list, 45000);
  assert.equal(start.sale, 40500);
  assert.equal(start.percent, 10);
  assert.equal(start.saved, 4500);

  const range = describePriceRange(activa, offers);
  assert.equal(range.onSale, true);
  assert.equal(range.sale.min, 40500);
  assert.equal(range.sale.max, 46800);
  assert.equal(range.list.min, 45000);
});

test('highest active percent wins when two sales include the same scooter', () => {
  const offers = [
    sale({ id: 'low', discountPercent: 10, sortOrder: 0 }),
    sale({ id: 'high', discountPercent: 15, sortOrder: 5, scooterIds: ['activa', 'zoom'] }),
    sale({ id: 'off', discountPercent: 40, active: false }),
  ];
  const winner = saleForScooter('activa', offers);
  assert.equal(winner.id, 'high');
  assert.equal(quotePrice(45000, winner).sale, 38250);
  assert.equal(saleForScooter('zoom', offers).id, 'high');
  assert.equal(saleForScooter('single-light', offers), null);
});

test('ignores a sale with no scooters or a bad percent', () => {
  assert.equal(isScooterSale(sale({ scooterIds: [] })), false);
  assert.equal(isScooterSale(sale({ discountPercent: 0 })), false);
  assert.equal(isScooterSale(sale({ kind: 'promo' })), false);
});
