import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShowroomGuides, sortByShowroomPrice } from '../src/lib/shopperGuide.js';

function scooter(id, price, range, stock = 'in_stock') {
  return {
    id,
    name: id,
    stock,
    price,
    range,
    variants: [{ id: 'std', name: 'Standard', price, range }],
  };
}

test('picks the cheapest in-stock model as the price anchor', () => {
  const guides = buildShowroomGuides([
    scooter('zoom', 64999, 70),
    scooter('single', 45999, 50),
    scooter('activa', 61999, 80),
  ], []);
  assert.equal(guides[0].id, 'single');
  assert.equal(guides[0].role, 'lowest');
  assert.equal(new Set(guides.map((guide) => guide.id)).size, guides.length);
  assert.ok(guides.length <= 3);
});

test('skips out-of-stock models and marks the biggest rupee save', () => {
  const offers = [{
    kind: 'scooter_sale',
    active: true,
    discountPercent: 10,
    priceTechnique: 'exact',
    scooterIds: ['zoom', 'activa'],
  }];
  const guides = buildShowroomGuides([
    scooter('gone', 10000, 40, 'out_of_stock'),
    scooter('zoom', 64999, 55),
    scooter('activa', 61999, 80),
  ], offers);
  assert.ok(!guides.some((guide) => guide.id === 'gone'));
  assert.ok(guides.some((guide) => guide.role === 'bestDeal' && guide.id === 'zoom'));
});

test('sorts payable prices with out-of-stock last', () => {
  const sorted = sortByShowroomPrice([
    scooter('late', 30000, 40, 'out_of_stock'),
    scooter('high', 70000, 60),
    scooter('low', 40000, 45),
  ], []);
  assert.deepEqual(sorted.map((scooter) => scooter.id), ['low', 'high', 'late']);
});
