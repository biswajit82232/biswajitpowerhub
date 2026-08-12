import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withTimeout, clamp, slugify } from '../src/lib/utils.js';

test('withTimeout resolves when the work finishes in time', async () => {
  const value = await withTimeout(Promise.resolve(7), 200, 'timed out');
  assert.equal(value, 7);
});

test('withTimeout rejects when the work hangs', async () => {
  await assert.rejects(
    () => withTimeout(new Promise(() => {}), 20, 'Request timed out'),
    /Request timed out/,
  );
});

test('clamp stays within bounds', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(99, 0, 10), 10);
});

test('slugify builds URL-safe ids', () => {
  assert.equal(slugify('Zoom Lithium Pro'), 'zoom-lithium-pro');
});
