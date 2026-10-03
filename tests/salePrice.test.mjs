import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bestDealScooterId,
  describePriceRange,
  isScooterSale,
  normalizeSalePercent,
  quotePrice,
  quoteStartingPrice,
  roundSalePrice,
  saleForScooter,
  smartSalePrice,
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

test('smart prices stay at or below the percent and land on a showroom ending', () => {
  assert.equal(roundSalePrice(45999, 10), 41399);
  assert.equal(smartSalePrice(45999, 10), 40999);
  assert.equal(smartSalePrice(42999, 10), 38499);
  assert.equal(smartSalePrice(57999, 10), 51999);

  const quote = quotePrice(45999, sale({ scooterIds: ['activa'] }));
  assert.equal(quote.sale, 40999);
  assert.equal(quote.exact, 41399);
  assert.equal(quote.extraSaved, 400);
  assert.ok(quote.sale <= quote.exact);
  assert.equal(quote.percent, 10);
  assert.ok(quote.effectivePercent >= 10);
});

test('exact technique does not add a charm discount', () => {
  const quote = quotePrice(45999, sale({ priceTechnique: 'exact' }));
  assert.equal(quote.sale, 41399);
  assert.equal(quote.extraSaved, 0);
});

test('applies the sale to the starting pack and every variant', () => {
  const offers = [sale({ priceTechnique: 'exact' })];
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
  assert.equal(quotePrice(45000, { ...winner, priceTechnique: 'exact' }).sale, 38250);
  assert.equal(saleForScooter('zoom', offers).id, 'high');
  assert.equal(saleForScooter('single-light', offers), null);
});

test('best deal is the in-stock model that saves the most rupees', () => {
  const offers = [sale({ scooterIds: ['activa', 'zoom'], priceTechnique: 'exact' })];
  const scooters = [
    { id: 'activa', stock: 'in_stock', price: 45000, variants: [] },
    { id: 'zoom', stock: 'in_stock', price: 60000, variants: [] },
    { id: 'gone', stock: 'out_of_stock', price: 90000, variants: [] },
  ];
  assert.equal(bestDealScooterId(scooters, offers), 'zoom');
  assert.equal(bestDealScooterId(scooters.slice(0, 1), offers), null);
});

test('ignores a sale with no scooters or a bad percent', () => {
  assert.equal(isScooterSale(sale({ scooterIds: [] })), false);
  assert.equal(isScooterSale(sale({ discountPercent: 0 })), false);
  assert.equal(isScooterSale(sale({ kind: 'promo' })), false);
});
