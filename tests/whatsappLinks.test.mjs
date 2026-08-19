import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsappCatalogUrl } from '../src/lib/whatsappLinks.js';

test('whatsapp catalog url uses wa.me/c with country code', () => {
  assert.equal(whatsappCatalogUrl({ whatsapp: '919635505436' }), 'https://wa.me/c/919635505436');
  assert.equal(whatsappCatalogUrl({ whatsapp: '9635505436' }), 'https://wa.me/c/919635505436');
});

test('whatsapp catalog url prefers a valid custom catalog link', () => {
  assert.equal(
    whatsappCatalogUrl({
      whatsapp: '919635505436',
      social: { whatsappCatalog: 'https://wa.me/c/919999999999' },
    }),
    'https://wa.me/c/919999999999',
  );
});

test('whatsapp catalog url ignores non-WhatsApp custom links', () => {
  assert.equal(
    whatsappCatalogUrl({
      whatsapp: '919635505436',
      social: { whatsappCatalog: 'https://example.com/catalog' },
    }),
    'https://wa.me/c/919635505436',
  );
});
