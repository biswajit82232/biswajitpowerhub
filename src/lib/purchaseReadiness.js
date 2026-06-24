import { EVENT } from './tracking';

/** Weights tuned for 0–100 purchase intent score */
const READINESS_WEIGHTS = {
  [EVENT.SCOOTER_VIEW]: 4,
  [EVENT.EMI_USED]: 14,
  [EVENT.SIMULATOR_USED]: 12,
  [EVENT.COMPARE_USED]: 6,
  [EVENT.WHATSAPP_CLICK]: 16,
  [EVENT.CALL_CLICK]: 14,
  [EVENT.CALLBACK_REQUEST]: 22,
  [EVENT.TEST_RIDE_BOOKED]: 28,
  [EVENT.CONTACT_FORM]: 18,
};

const SIGNAL_LABELS = {
  [EVENT.SCOOTER_VIEW]: 'Scooter views',
  [EVENT.EMI_USED]: 'EMI calculator',
  [EVENT.SIMULATOR_USED]: 'EV simulator',
  [EVENT.COMPARE_USED]: 'Compare tool',
  [EVENT.WHATSAPP_CLICK]: 'WhatsApp click',
  [EVENT.CALL_CLICK]: 'Call click',
  [EVENT.CALLBACK_REQUEST]: 'Callback request',
  [EVENT.TEST_RIDE_BOOKED]: 'Test ride booked',
  [EVENT.CONTACT_FORM]: 'Contact form',
};

/** Normalize raw score to 0–100 with soft cap */
function toPercent(raw) {
  return Math.min(100, Math.round(raw));
}

/**
 * Purchase Readiness Score — invisible on site, shown in admin.
 * Tracks views, EMI, simulator, WhatsApp, callbacks, etc.
 */
export function computePurchaseReadiness(events = []) {
  let raw = 0;
  const counts = {};
  const scooterViews = {};
  let lastAt = null;

  for (const e of events) {
    raw += READINESS_WEIGHTS[e.type] || 0;
    counts[e.type] = (counts[e.type] || 0) + 1;
    if (e.type === EVENT.SCOOTER_VIEW && e.meta?.scooterId) {
      scooterViews[e.meta.scooterId] = (scooterViews[e.meta.scooterId] || 0) + 1;
    }
    const at = e.at || e.created_at;
    if (at && (!lastAt || at > lastAt)) lastAt = at;
  }

  // Bonus: repeat interest in same model
  const repeatView = Object.values(scooterViews).some((c) => c >= 2);
  if (repeatView) raw += 10;
  if ((counts[EVENT.EMI_USED] || 0) > 0 && (counts[EVENT.SCOOTER_VIEW] || 0) >= 2) raw += 8;
  if ((counts[EVENT.SIMULATOR_USED] || 0) > 0 && (counts[EVENT.WHATSAPP_CLICK] || 0) > 0) raw += 10;

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

const STATUS_PENALTY = { contacted: 15, follow_up: 5, converted: 100, lost: 100 };

/**
 * Intelligent follow-up prioritization for admin queue.
 */
export function computeFollowUpPriority(lead = {}, events = [], readiness = null) {
  const r = readiness || computePurchaseReadiness(events);
  const status = lead.status || 'new';
  const classification = lead.classification || 'cold';

  if (status === 'converted' || status === 'lost') {
    return { ...r, priority: FOLLOW_UP.LATER, priorityLabel: FOLLOW_UP_LABELS[FOLLOW_UP.LATER], priorityRank: 0 };
  }

  let priority = FOLLOW_UP.LATER;
  let priorityRank = 1;

  const hasTestRide = (r.signals || []).some((s) => s.type === EVENT.TEST_RIDE_BOOKED);
  const hasCallback = (r.signals || []).some((s) => s.type === EVENT.CALLBACK_REQUEST);
  const hoursSinceActivity = r.lastActivityAt
    ? (Date.now() - new Date(r.lastActivityAt).getTime()) / 3600000
    : 999;

  const effectiveScore = r.readinessPercent - (STATUS_PENALTY[status] || 0);

  if (
    hasTestRide ||
    hasCallback ||
    r.readinessPercent >= 75 ||
    (classification === 'hot' && status === 'new') ||
    effectiveScore >= 70
  ) {
    priority = FOLLOW_UP.IMMEDIATE;
    priorityRank = 3;
  } else if (
    r.readinessPercent >= 45 ||
    classification === 'hot' ||
    (classification === 'warm' && hoursSinceActivity <= 48) ||
    effectiveScore >= 40
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
  };
}

/** Sort leads: immediate first, then today, then by readiness */
export function sortByFollowUpPriority(a, b) {
  if (b.priorityRank !== a.priorityRank) return b.priorityRank - a.priorityRank;
  return (b.readinessPercent || 0) - (a.readinessPercent || 0);
}
