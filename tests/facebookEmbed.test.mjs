import { test } from 'node:test';
import assert from 'node:assert/strict';
import { facebookPagePluginSrc, facebookPluginHref } from '../src/lib/facebookEmbed.js';

const PAGE = 'https://www.facebook.com/p/Biswajit-Power-Hub-61583295660105/';

test('facebook page plugin src encodes a public page URL', () => {
  const src = facebookPagePluginSrc(PAGE, 500, 620);
  assert.match(src, /^https:\/\/www\.facebook\.com\/plugins\/page\.php\?/);
  assert.match(src, /tabs=timeline/);
  assert.match(src, /href=https%3A%2F%2Fwww.facebook.com%2F61583295660105/);
});

test('facebook /p/ URLs resolve to the numeric page id for the plugin', () => {
  assert.equal(facebookPluginHref(PAGE), 'https://www.facebook.com/61583295660105');
});

test('facebook page plugin src rejects non-Facebook URLs', () => {
  assert.equal(facebookPagePluginSrc('https://www.instagram.com/biswajitpowerhub/'), '');
  assert.equal(facebookPagePluginSrc('not-a-url'), '');
  assert.equal(facebookPagePluginSrc(''), '');
});

test('facebook page plugin width is clamped to Meta limits', () => {
  const src = facebookPagePluginSrc(PAGE, 900, 620);
  assert.match(src, /width=500/);
});
