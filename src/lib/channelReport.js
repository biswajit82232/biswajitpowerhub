import { CHANNEL, CHANNEL_LABELS, CHANNEL_ORDER, channelFromLead } from './attribution.js';

const PAGE_VIEW = 'page_view';
const SCOOTER_VIEW = 'scooter_view';

function eventType(e) {
  return e?.event_type || e?.type || '';
}

function visitorId(e) {
  return e?.visitor_id || e?.visitorId || '';
}

function eventChannel(e) {
  return e?.meta?.channel || e?.attribution?.channel || null;
}

function eventTime(e) {
  return new Date(e?.created_at || e?.at || 0).getTime();
}

/**
 * First-touch channel per visitor (direct upgrades if a later event has a real source).
 */
export function firstTouchByVisitor(events = []) {
  const map = new Map();
  const sorted = [...events].sort((a, b) => eventTime(a) - eventTime(b));
  for (const e of sorted) {
    const vid = visitorId(e);
    const ch = eventChannel(e);
    if (!vid || !ch) continue;
    const prev = map.get(vid);
    if (!prev || (prev === CHANNEL.DIRECT && ch !== CHANNEL.DIRECT)) {
      map.set(vid, ch);
    }
  }
  return map;
}

function emptyRow(channel) {
  return {
    channel,
    label: CHANNEL_LABELS[channel] || channel,
    visitors: 0,
    pageViews: 0,
    scooterViews: 0,
    leads: 0,
    converted: 0,
    lost: 0,
    testRides: 0,
    closeRate: 0,
    leadRate: 0,
  };
}

function hasTraffic(row) {
  return row.leads > 0 || row.testRides > 0 || row.visitors > 0 || row.pageViews > 0 || row.scooterViews > 0;
}

/**
 * Ads vs SEO traffic + close-rate from leads, test rides, and view events.
 */
export function aggregateChannelCloseRates({
  leads = [],
  testRides = [],
  pageViewEvents = [],
  viewEvents = pageViewEvents,
} = {}) {
  const events = viewEvents.length ? viewEvents : pageViewEvents;
  const pageMap = firstTouchByVisitor(events);
  const by = Object.fromEntries(CHANNEL_ORDER.map((c) => [c, emptyRow(c)]));
  const countedVisitors = new Set();

  for (const e of events) {
    const vid = visitorId(e);
    const type = eventType(e);
    const ch = (vid && pageMap.get(vid)) || eventChannel(e) || CHANNEL.UNKNOWN;
    const key = by[ch] ? ch : CHANNEL.UNKNOWN;

    if (type === PAGE_VIEW) by[key].pageViews += 1;
    if (type === SCOOTER_VIEW) by[key].scooterViews += 1;

    if (vid && type === PAGE_VIEW && !countedVisitors.has(vid)) {
      countedVisitors.add(vid);
      by[key].visitors += 1;
    }
  }

  for (const lead of leads) {
    const ch = channelFromLead(lead, pageMap);
    const key = by[ch] ? ch : CHANNEL.UNKNOWN;
    by[key].leads += 1;
    if (lead.status === 'converted') by[key].converted += 1;
    if (lead.status === 'lost') by[key].lost += 1;
  }

  for (const ride of testRides) {
    const ch = ride?.attribution?.channel || CHANNEL.UNKNOWN;
    const key = by[ch] ? ch : CHANNEL.UNKNOWN;
    by[key].testRides += 1;
  }

  const rows = CHANNEL_ORDER.map((c) => {
    const row = by[c];
    row.closeRate = row.leads ? Math.round((row.converted / row.leads) * 100) : 0;
    row.leadRate = row.visitors ? Math.round((row.leads / row.visitors) * 100) : 0;
    return row;
  }).filter(hasTraffic);

  const totals = rows.reduce(
    (acc, r) => {
      acc.visitors += r.visitors;
      acc.pageViews += r.pageViews;
      acc.scooterViews += r.scooterViews;
      acc.leads += r.leads;
      acc.converted += r.converted;
      acc.testRides += r.testRides;
      return acc;
    },
    { visitors: 0, pageViews: 0, scooterViews: 0, leads: 0, converted: 0, testRides: 0 },
  );
  totals.closeRate = totals.leads ? Math.round((totals.converted / totals.leads) * 100) : 0;
  totals.leadRate = totals.visitors ? Math.round((totals.leads / totals.visitors) * 100) : 0;

  return { rows, totals };
}
