import { EVENT } from './tracking';

/** Base weights tuned for 0–100 purchase intent (high-intent actions dominate). */
const READINESS_WEIGHTS = {
  [EVENT.PAGE_VIEW]: 0.5,
  [EVENT.SCOOTER_VIEW]: 5,
  [EVENT.EMI_USED]: 14,
  [EVENT.SIMULATOR_USED]: 12,
  [EVENT.COMPARE_USED]: 7,
  [EVENT.WHATSAPP_CLICK]: 16,
  [EVENT.CALL_CLICK]: 15,
  [EVENT.DIRECTIONS_CLICK]: 12,
  [EVENT.CALLBACK_REQUEST]: 24,
  [EVENT.TEST_RIDE_BOOKED]: 30,
  [EVENT.SERVICE_BOOKED]: 26,
  [EVENT.CONTACT_FORM]: 20,
};

/** Soft caps so refresh / spam clicks cannot dominate the score. */
const TYPE_CAPS = {
  [EVENT.PAGE_VIEW]: 3,
  [EVENT.SCOOTER_VIEW]: 20,
  [EVENT.EMI_USED]: 28,
  [EVENT.SIMULATOR_USED]: 24,
  [EVENT.COMPARE_USED]: 14,
  [EVENT.WHATSAPP_CLICK]: 32,
  [EVENT.CALL_CLICK]: 30,
  [EVENT.DIRECTIONS_CLICK]: 24,
};

const SIGNAL_LABELS = {
  [EVENT.SCOOTER_VIEW]: 'Scooter views',
  [EVENT.EMI_USED]: 'EMI calculator',
  [EVENT.SIMULATOR_USED]: 'EV simulator',
  [EVENT.COMPARE_USED]: 'Compare tool',
  [EVENT.WHATSAPP_CLICK]: 'WhatsApp click',
  [EVENT.CALL_CLICK]: 'Call click',
  [EVENT.DIRECTIONS_CLICK]: 'Directions',
  [EVENT.CALLBACK_REQUEST]: 'Callback request',
  [EVENT.TEST_RIDE_BOOKED]: 'Test ride booked',
  [EVENT.SERVICE_BOOKED]: 'Service booked',
  [EVENT.CONTACT_FORM]: 'Contact form',
};

function toPercent(raw) {
  return Math.min(100, Math.round(raw));
}

function hoursAgo(iso) {
  if (!iso) return 999;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

/** Newer activity counts more; older signals fade. */
function recencyMultiplier(iso) {
  const h = hoursAgo(iso);
  if (h <= 2) return 1.35;
  if (h <= 12) return 1.2;
  if (h <= 48) return 1.05;
  if (h <= 168) return 0.9;
  return 0.7;
}

/**
 * Purchase Readiness Score — invisible on site, shown in admin.
 */
export function computePurchaseReadiness(events = []) {
  const counts = {};
  const typeRaw = {};
  const scooterViews = {};
  let lastAt = null;
  let firstAt = null;
  const uniqueDays = new Set();

  for (const e of events) {
    const type = e.type || e.event_type;
    if (!type) continue;
    const at = e.at || e.created_at;
    const weight = (READINESS_WEIGHTS[type] || 0) * recencyMultiplier(at);
    typeRaw[type] = (typeRaw[type] || 0) + weight;
    counts[type] = (counts[type] || 0) + 1;

    if (type === EVENT.SCOOTER_VIEW && (e.meta?.scooterId || e.meta?.name)) {
      const sid = e.meta.scooterId || e.meta.name;
      scooterViews[sid] = (scooterViews[sid] || 0) + 1;
    }
    if (at) {
      if (!lastAt || at > lastAt) lastAt = at;
      if (!firstAt || at < firstAt) firstAt = at;
      uniqueDays.add(new Date(at).toDateString());
    }
  }

  let raw = 0;
  for (const [type, value] of Object.entries(typeRaw)) {
    const capped = TYPE_CAPS[type] != null ? Math.min(value, TYPE_CAPS[type]) : value;
    raw += capped;
  }

  // Depth bonuses (quality of engagement, not volume)
  const repeatView = Object.values(scooterViews).some((c) => c >= 2);
  if (repeatView) raw += 10;
  if ((counts[EVENT.EMI_USED] || 0) > 0 && (counts[EVENT.SCOOTER_VIEW] || 0) >= 1) raw += 8;
  if ((counts[EVENT.SIMULATOR_USED] || 0) > 0 && (counts[EVENT.WHATSAPP_CLICK] || 0) > 0) raw += 10;
  if ((counts[EVENT.COMPARE_USED] || 0) > 0 && (counts[EVENT.EMI_USED] || 0) > 0) raw += 6;
  if ((counts[EVENT.DIRECTIONS_CLICK] || 0) > 0 && (counts[EVENT.CALL_CLICK] || 0) > 0) raw += 8;
  if (uniqueDays.size >= 2) raw += 8;
  if (uniqueDays.size >= 3) raw += 6;

  // Multi-channel intent (form + chat / call)
  const channels = [
    EVENT.CALLBACK_REQUEST,
    EVENT.TEST_RIDE_BOOKED,
    EVENT.SERVICE_BOOKED,
    EVENT.CONTACT_FORM,
    EVENT.WHATSAPP_CLICK,
    EVENT.CALL_CLICK,
  ].filter((t) => (counts[t] || 0) > 0).length;
  if (channels >= 2) raw += 12;

  const topScooterEntry = Object.entries(scooterViews).sort((a, b) => b[1] - a[1])[0];
  const signals = Object.entries(counts)
    .filter(([type]) => SIGNAL_LABELS[type])
    .map(([type, count]) => ({ type, label: SIGNAL_LABELS[type], count }))
    .sort((a, b) => (READINESS_WEIGHTS[b.type] || 0) - (READINESS_WEIGHTS[a.type] || 0));

  return {
    readinessPercent: toPercent(raw),
    rawScore: raw,
    signals,
    topScooterId: topScooterEntry?.[0] || null,
    topScooterViews: topScooterEntry?.[1] || 0,
    lastActivityAt: lastAt,
    firstActivityAt: firstAt,
    activeDays: uniqueDays.size,
    hoursSinceActivity: hoursAgo(lastAt),
  };
}

export const FOLLOW_UP = {
  IMMEDIATE: 'immediate',
  TODAY: 'today',
  LATER: 'later',
};

export const FOLLOW_UP_LABELS = {
  [FOLLOW_UP.IMMEDIATE]: 'Call immediately',
  [FOLLOW_UP.TODAY]: 'Call today',
  [FOLLOW_UP.LATER]: 'Follow up later',
};

const STATUS_PENALTY = { contacted: 12, follow_up: 4, converted: 100, lost: 100 };

/**
 * Intelligent follow-up prioritization for admin queue.
 * Fresh high-intent activity can revive a "contacted" lead.
 */
export function computeFollowUpPriority(lead = {}, events = [], readiness = null) {
  const r = readiness || computePurchaseReadiness(events);
  const status = lead.status || 'new';
  const classification = lead.classification || 'cold';
  const hours = r.hoursSinceActivity ?? 999;

  if (status === 'converted' || status === 'lost') {
    return {
      ...r,
      priority: FOLLOW_UP.LATER,
      priorityLabel: FOLLOW_UP_LABELS[FOLLOW_UP.LATER],
      priorityRank: 0,
      effectiveScore: 0,
      slaHours: hours,
    };
  }

  const signalHas = (type) => (r.signals || []).some((s) => s.type === type);
  const hasTestRide = signalHas(EVENT.TEST_RIDE_BOOKED);
  const hasCallback = signalHas(EVENT.CALLBACK_REQUEST);
  const hasService = signalHas(EVENT.SERVICE_BOOKED);
  const hasContact = signalHas(EVENT.CONTACT_FORM);
  const hasOutbound = signalHas(EVENT.WHATSAPP_CLICK) || signalHas(EVENT.CALL_CLICK);

  // New intent after contact → don't bury the lead
  const freshIntent = hours <= 24 && (hasTestRide || hasCallback || hasService || hasContact || hasOutbound);
  const statusPenalty = freshIntent && status === 'contacted' ? 0 : (STATUS_PENALTY[status] || 0);
  const effectiveScore = r.readinessPercent - statusPenalty;

  // SLA urgency: open high-intent sitting too long jumps the queue
  const slaBreach = (hasTestRide || hasCallback || hasService || hasContact) && hours >= 2 && status === 'new';

  let priority = FOLLOW_UP.LATER;
  let priorityRank = 1;

  if (
    hasTestRide ||
    hasCallback ||
    hasService ||
    slaBreach ||
    r.readinessPercent >= 75 ||
    (classification === 'hot' && status === 'new' && hours <= 72) ||
    effectiveScore >= 70 ||
    (freshIntent && r.readinessPercent >= 50)
  ) {
    priority = FOLLOW_UP.IMMEDIATE;
    priorityRank = 3;
  } else if (
    r.readinessPercent >= 40 ||
    classification === 'hot' ||
    hasContact ||
    hasOutbound ||
    (classification === 'warm' && hours <= 48) ||
    effectiveScore >= 35 ||
    (uniqueRecentWarm(r) && hours <= 72)
  ) {
    priority = FOLLOW_UP.TODAY;
    priorityRank = 2;
  }

  return {
    ...r,
    priority,
    priorityLabel: FOLLOW_UP_LABELS[priority],
    priorityRank,
    effectiveScore,
    slaHours: hours,
    slaBreach,
  };
}

function uniqueRecentWarm(r) {
  return (r.activeDays || 0) >= 2 || (r.topScooterViews || 0) >= 2;
}

/** Sort leads: immediate first, then today, then by readiness / freshness */
export function sortByFollowUpPriority(a, b) {
  if (b.priorityRank !== a.priorityRank) return b.priorityRank - a.priorityRank;
  if ((a.slaHours || 999) !== (b.slaHours || 999) && a.priorityRank === 3) {
    return (a.slaHours || 999) - (b.slaHours || 999); // older open intent first
  }
  return (b.readinessPercent || 0) - (a.readinessPercent || 0);
}
