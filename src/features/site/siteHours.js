/** Format 24h "HH:mm" to 12h display e.g. "10:00 AM" */
export function formatTime12h(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = Number(hStr);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/** Group consecutive days with the same hours for compact display */
export function formatHoursGroups(hours) {
  const short = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const signature = (day) => {
    const d = hours[day];
    if (!d || d.closed) return 'closed';
    return `${d.open}-${d.close}`;
  };

  const formatRange = (sig) => {
    if (sig === 'closed') return 'Closed';
    const [open, close] = sig.split('-');
    return `${formatTime12h(open)} – ${formatTime12h(close)}`;
  };

  const groups = [];
  let i = 0;
  while (i < keys.length) {
    const sig = signature(keys[i]);
    let j = i + 1;
    while (j < keys.length && signature(keys[j]) === sig) j += 1;
    const start = short[keys[i]];
    const end = short[keys[j - 1]];
    const label = start === end ? start : `${start}–${end}`;
    groups.push({ label, text: formatRange(sig) });
    i = j;
  }

  return groups;
}

/**
 * Human-readable hours line for UI/SEO copy.
 * e.g. "Open all days 9:00 AM – 8:30 PM" or "Mon–Sat 9:00 AM – 8:30 PM · Sun Closed"
 */
export function hoursSummary(hours, { short = false } = {}) {
  const groups = formatHoursGroups(hours);
  if (!groups.length) return short ? 'Open daily' : 'Open all days 9:00 AM – 8:30 PM';

  const allOpenSame =
    groups.length === 1 && groups[0].label === 'Mon–Sun' && groups[0].text !== 'Closed';
  if (allOpenSame) {
    return short ? `Open all days ${groups[0].text}` : `Open all days ${groups[0].text}`;
  }

  // Cover Mon–Sun split as "all days" when every day open with same hours but label differs
  const openGroups = groups.filter((g) => g.text !== 'Closed');
  const closedGroups = groups.filter((g) => g.text === 'Closed');
  if (openGroups.length === 1 && closedGroups.length === 0) {
    const g = openGroups[0];
    if (g.label.includes('Mon') && g.label.includes('Sun')) {
      return `Open all days ${g.text}`;
    }
  }

  return groups.map((g) => `${g.label} ${g.text}`).join(' · ');
}

/** Compact default for static seed copy when site context is unavailable */
export const DEFAULT_HOURS_SUMMARY = 'Open all days 9:00 AM – 8:30 PM';
export const DEFAULT_HOURS_SUMMARY_SHORT = 'Open all days 9 AM–8:30 PM';

/** Legacy-style hours object for components expecting weekdays/sunday strings */
export function toLegacyHours(hours) {
  const groups = formatHoursGroups(hours);
  const summary = hoursSummary(hours);
  const allWeek = groups.find((g) => g.label === 'Mon–Sun');
  const weekdays = groups.find((g) => g.label.includes('Mon') && !g.label.includes('Sun'));
  const sunday = groups.find((g) => g.label === 'Sun');
  return {
    weekdays: weekdays?.text || allWeek?.text || groups[0]?.text || '',
    sunday: sunday?.text || (allWeek ? allWeek.text : 'Closed'),
    groups,
    summary,
    summaryShort: hoursSummary(hours, { short: true }),
  };
}
