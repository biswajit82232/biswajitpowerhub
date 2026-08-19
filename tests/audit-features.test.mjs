import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyChannel, mergeFirstTouch, buildAttribution, CHANNEL } from '../src/lib/attribution.js';
import { aggregateChannelCloseRates } from '../src/lib/channelReport.js';
import { buildQuoteMessage, listQuoteTemplates } from '../src/lib/whatsappTemplates.js';
import { translate, missingBengaliKeys } from '../src/i18n/messages.js';

test('gclid is classified as ads', () => {
  const ch = classifyChannel({ searchParams: 'gclid=abc123' });
  assert.equal(ch, CHANNEL.ADS);
});

test('utm cpc is ads', () => {
  const ch = classifyChannel({ searchParams: 'utm_source=google&utm_medium=cpc&utm_campaign=no-licence' });
  assert.equal(ch, CHANNEL.ADS);
});

test('google referrer without utm is organic', () => {
  const ch = classifyChannel({
    searchParams: '',
    referrer: 'https://www.google.com/search?q=ev',
    host: 'biswajitpowerhub.in',
  });
  assert.equal(ch, CHANNEL.ORGANIC);
});

test('walk-in src is walk-in', () => {
  assert.equal(classifyChannel({ searchParams: 'src=walk-in' }), CHANNEL.WALK_IN);
});

test('first-touch keeps ads over later direct', () => {
  const first = buildAttribution({ search: '?gclid=1', path: '/ad-landing' });
  const later = buildAttribution({ search: '', path: '/scooters' });
  const merged = mergeFirstTouch(first, later);
  assert.equal(merged.channel, CHANNEL.ADS);
  assert.equal(merged.landing, '/ad-landing');
});

test('direct upgrades when a later visit has UTM', () => {
  const first = buildAttribution({ search: '', path: '/' });
  const paid = buildAttribution({ search: '?utm_medium=cpc&utm_source=google', path: '/' });
  const merged = mergeFirstTouch(first, paid);
  assert.equal(merged.channel, CHANNEL.ADS);
});

test('close-rate is converted / leads per channel', () => {
  const { rows, totals } = aggregateChannelCloseRates({
    leads: [
      { status: 'converted', attribution: { channel: 'ads' } },
      { status: 'new', attribution: { channel: 'ads' } },
      { status: 'converted', attribution: { channel: 'organic' } },
    ],
    testRides: [{ attribution: { channel: 'ads' } }],
  });
  const ads = rows.find((r) => r.channel === 'ads');
  assert.equal(ads.leads, 2);
  assert.equal(ads.converted, 1);
  assert.equal(ads.closeRate, 50);
  assert.equal(ads.testRides, 1);
  assert.equal(totals.leads, 3);
  assert.equal(totals.closeRate, 67);
});

test('page and scooter views split by first-touch channel', () => {
  const { rows, totals } = aggregateChannelCloseRates({
    viewEvents: [
      { visitor_id: 'v1', event_type: 'page_view', meta: { channel: 'ads' }, created_at: '2026-08-01' },
      { visitor_id: 'v1', event_type: 'page_view', meta: { channel: 'ads' }, created_at: '2026-08-02' },
      { visitor_id: 'v1', event_type: 'scooter_view', meta: { channel: 'ads' }, created_at: '2026-08-02' },
      { visitor_id: 'v2', event_type: 'page_view', meta: { channel: 'organic' }, created_at: '2026-08-03' },
    ],
    leads: [{ visitor_id: 'v1', status: 'new', attribution: { channel: 'ads' } }],
  });
  const ads = rows.find((r) => r.channel === 'ads');
  const seo = rows.find((r) => r.channel === 'organic');
  assert.equal(ads.visitors, 1);
  assert.equal(ads.pageViews, 2);
  assert.equal(ads.scooterViews, 1);
  assert.equal(seo.visitors, 1);
  assert.equal(seo.pageViews, 1);
  assert.equal(totals.visitors, 2);
  assert.equal(totals.leadRate, 50);
});

test('price quote includes INR and EMI', () => {
  const scooter = { name: 'Activa', price: 59000, stock: 'in_stock', variants: [] };
  const msg = buildQuoteMessage({
    id: 'price',
    lang: 'en',
    name: 'Rahul',
    scooter,
    settings: { interestRate: 10, defaultTenure: 12, downPaymentPct: 20, fileCharges: 2500 },
  });
  assert.match(msg, /Rahul/);
  assert.match(msg, /Activa/);
  assert.match(msg, /₹/);
});

test('Bengali follow-up template is Bangla', () => {
  const msg = buildQuoteMessage({ id: 'follow', lang: 'bn', name: 'Rahul' });
  assert.match(msg, /নমস্কার/);
});

test('test-ride kind lists confirm template first', () => {
  const list = listQuoteTemplates({ kind: 'test_ride', date: '2026-08-20' });
  assert.equal(list[0].id, 'ride');
});

test('Bengali form strings exist', () => {
  assert.equal(translate('bn', 'form.callback'), 'কল ব্যাক চান');
  assert.equal(translate('en', 'form.callback'), 'Request callback');
  assert.equal(translate('bn', 'pdp.specs'), 'স্পেসিফিকেশন');
  assert.match(translate('bn', 'prompt.body'), /মোবাইল/);
});

test('Bengali covers shopper chrome', () => {
  assert.equal(translate('bn', 'home.explore'), 'আমাদের রেঞ্জ দেখুন');
  assert.equal(translate('bn', 'home.faq'), 'সাধারণ জিজ্ঞাসা');
  assert.equal(translate('bn', 'contact.h1'), 'চুনাখালি, বহরমপুরের কাছে ইলেকট্রিক স্কুটার শোরুম');
  assert.equal(translate('bn', 'svc.pageH1'), 'সার্ভিস ও ব্যাটারি আপগ্রেড');
  assert.equal(translate('bn', 'fin.h1'), 'ফিনান্স ও EMI অপশন');
  assert.equal(translate('bn', 'card.viewMore'), 'আরও দেখুন');
  assert.equal(translate('bn', 'home.getDirection'), 'দিকনির্দেশ');
  assert.equal(translate('bn', 'footer.batteryScooty'), 'ব্যাটারি স্কুটি');
});

test('Bengali table covers every English key', () => {
  assert.deepEqual(missingBengaliKeys(), []);
});
