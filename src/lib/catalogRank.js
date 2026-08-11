/**
 * Smart catalog ranking — famous / high-intent models rise to the top.
 * Combines live popularity, value badges, and stock so shoppers see winners first.
 */

/** Stable id for scooter_view keys that may be id OR name. */
export function resolveScooterId(key, scooters = []) {
  if (!key) return null;
  const byId = scooters.find((s) => s.id === key);
  if (byId) return byId.id;
  const byName = scooters.find((s) => s.name === key);
  return byName?.id || key;
}

/**
 * Fame score for one scooter (higher = list first).
 */
export function computeFameScore(scooter, insights = {}) {
  if (!scooter) return 0;
  const id = scooter.id;
  const name = scooter.name;

  const weekViews = lookupCount(insights.viewsWeekMap, id, name);
  const monthViews = lookupCount(insights.viewsMonthMap, id, name);
  const allViews = lookupCount(insights.viewsAllTimeMap, id, name);
  const intent = lookupCount(insights.intentMonthMap, id, name);

  let score = 0;
  score += weekViews * 8;
  score += monthViews * 3;
  score += allViews * 1;
  score += intent * 4;

  if (insights.popularWeekIds?.has?.(id) || insights.popularWeekIds?.has?.(name)) score += 40;
  if (insights.topIntentMonthIds?.has?.(id) || insights.topIntentMonthIds?.has?.(name)) score += 35;

  const badges = insights.valueBadges?.get?.(id) || [];
  score += badges.length * 18;

  if (scooter.featured) score += 25;
  if (scooter.stock === 'in_stock') score += 12;
  if (scooter.stock === 'out_of_stock') score -= 40;
  if (scooter.noLicence) score += 6;

  // Mild price preference so ties don't feel random (cheaper slightly higher)
  score += Math.max(0, 20 - (scooter.price || 0) / 5000);

  return score;
}

function lookupCount(map, id, name) {
  if (!map) return 0;
  if (map instanceof Map) return map.get(id) || map.get(name) || 0;
  return map[id] || map[name] || 0;
}

/**
 * Sort scooters: famous first, then price as soft fallback.
 */
export function sortScootersByFame(scooters = [], insights = {}) {
  return [...scooters].sort((a, b) => {
    const fb = computeFameScore(b, insights);
    const fa = computeFameScore(a, insights);
    if (fb !== fa) return fb - fa;
    return (a.price || 0) - (b.price || 0);
  });
}

/**
 * Build display tags for a scooter card (max 2 to avoid clutter).
 */
export function getScooterDiscoveryTags(scooter, insights = {}) {
  if (!scooter || !insights) return [];
  const tags = [];
  const id = scooter.id;
  const name = scooter.name;

  if (insights.popularWeekIds?.has?.(id) || insights.popularWeekIds?.has?.(name)) {
    tags.push({ id: 'trending', label: 'Trending', tone: 'hot' });
  }
  if (insights.topIntentMonthIds?.has?.(id) || insights.topIntentMonthIds?.has?.(name)) {
    tags.push({ id: 'hot', label: 'Hot pick', tone: 'warm' });
  }

  const badges = insights.valueBadges?.get?.(id) || [];
  for (const b of badges) {
    if (tags.length >= 2) break;
    if (!tags.some((t) => t.id === b.id)) {
      tags.push({ id: b.id, label: b.label, tone: b.tone || 'brand' });
    }
  }

  return tags.slice(0, 2);
}
