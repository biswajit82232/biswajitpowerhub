import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidPhone,
  isValidName,
  isHoneypotFilled,
  normalizeIndianMobile,
} from '../src/features/leads/validation.js';
import { safeEqual } from '../src/lib/safeEqual.js';
import { safeMapsEmbedUrl } from '../src/lib/mapsEmbed.js';
import { mapVyaparStock } from '../src/features/vyapar/vyaparMapping.js';

test('Indian mobile normalize and validate', () => {
  assert.equal(normalizeIndianMobile('+91 96355 05436'), '9635505436');
  assert.equal(isValidPhone('9635505436'), true);
  assert.equal(isValidPhone('12345'), false);
});

test('name and honeypot', () => {
  assert.equal(isValidName('ab'), true);
  assert.equal(isValidName('a'), false);
  assert.equal(isHoneypotFilled('http://spam'), true);
  assert.equal(isHoneypotFilled(''), false);
});

test('timing-safe compare matches equal secrets', () => {
  assert.equal(safeEqual('secret', 'secret'), true);
  assert.equal(safeEqual('secret', 'secreT'), false);
  assert.equal(safeEqual('ab', 'abc'), false);
});

test('low_stock is qty 1–3', () => {
  assert.equal(mapVyaparStock(1), 'low_stock');
  assert.equal(mapVyaparStock(3), 'low_stock');
  assert.equal(mapVyaparStock(4), 'in_stock');
  assert.equal(mapVyaparStock(0), 'out_of_stock');
});

test('maps embed allowlist', () => {
  assert.ok(safeMapsEmbedUrl('https://www.google.com/maps/embed?pb=abc'));
  assert.equal(safeMapsEmbedUrl('https://evil.example/maps'), '');
  assert.equal(safeMapsEmbedUrl('javascript:alert(1)'), '');
});
