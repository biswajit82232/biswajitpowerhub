import { DAY_KEYS, DAY_LABELS } from '@/config/site';

const SCHEMA_DAYS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/** Schema.org OpeningHoursSpecification from admin hours */
export function openingHoursSchema(hoursPerDay) {
  if (!hoursPerDay) return undefined;
  return DAY_KEYS.map((day) => {
    const d = hoursPerDay[day];
    if (!d || d.closed) return null;
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAYS[day] || DAY_LABELS[day],
      opens: d.open,
      closes: d.close,
    };
  }).filter(Boolean);
}
