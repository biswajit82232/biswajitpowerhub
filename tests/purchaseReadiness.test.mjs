import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePurchaseReadiness } from '../src/lib/purchaseReadiness.js';
import { classifyLead, EVENT } from '../src/lib/tracking.js';

function ev(type, extra = {}) {
  return { type, at: new Date().toISOString(), meta: extra.meta || {} };
}

test('directions-only is not hot', () => {
  const { classification } = classifyLead([ev(EVENT.DIRECTIONS_CLICK)]);
  assert.notEqual(classification, 'hot');
});

test('WhatsApp click is hot', () => {
  const { classification } = classifyLead([ev(EVENT.WHATSAPP_CLICK)]);
  assert.equal(classification, 'hot');
});

test('form events are capped in readiness', () => {
  const spam = Array.from({ length: 20 }, () => ev(EVENT.CALLBACK_REQUEST));
  const { readinessPercent } = computePurchaseReadiness(spam);
  assert.ok(readinessPercent <= 100);
  const once = computePurchaseReadiness([ev(EVENT.CALLBACK_REQUEST)]);
  assert.ok(readinessPercent - once.readinessPercent < 40);
});
