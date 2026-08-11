/** Free / paid service booking options shown on the website & admin. */

export const SERVICE_KINDS = [
  {
    id: 'free_1',
    label: 'Free 1st service',
    short: '1st free',
    badge: 'Free',
    tone: 'success',
    description: 'First complimentary servicing visit included with your scooter.',
  },
  {
    id: 'free_2',
    label: 'Free 2nd service',
    short: '2nd free',
    badge: 'Free',
    tone: 'success',
    description: 'Second complimentary servicing visit.',
  },
  {
    id: 'free_3',
    label: 'Free 3rd service',
    short: '3rd free',
    badge: 'Free',
    tone: 'success',
    description: 'Third complimentary servicing visit.',
  },
  {
    id: 'paid',
    label: 'Paid service / repair',
    short: 'Paid',
    badge: 'Paid',
    tone: 'brand',
    description: 'Paid servicing, repairs, parts fitment, or other workshop work. Tell us what you need.',
  },
];

export function getServiceKind(id) {
  return SERVICE_KINDS.find((k) => k.id === id) || null;
}

export function serviceKindLabel(id) {
  return getServiceKind(id)?.label || id || 'Service';
}
