/**
 * Seed scooter catalog — used as a fallback / demo dataset when Supabase
 * is not configured, and as the seed source for `supabase/seed.sql`.
 *
 * Each model has two battery variants: Standard and Lithium Pro.
 * Listing price is the Standard variant (starting price).
 *
 * All models are LOW-SPEED, NON-RTO electric scooters (<= 25 km/h).
 */

const STANDARD_LITHIUM = [
  {
    id: 'standard',
    name: 'Standard',
    batteryType: 'Standard battery',
    batteryCapacity: '48V / 24Ah',
    batteryWarranty: '6 months',
  },
  {
    id: 'lithium-pro',
    name: 'Lithium Pro',
    batteryType: 'Lithium Pro battery',
    batteryCapacity: '48V / 40Ah',
    batteryWarranty: '2 years',
  },
];

function buildVariants(standardPrice, lithiumPrice, standardRange, lithiumRange) {
  return [
    { ...STANDARD_LITHIUM[0], price: standardPrice, range: standardRange },
    { ...STANDARD_LITHIUM[1], price: lithiumPrice, range: lithiumRange },
  ];
}

const SHARED = {
  brand: 'PowerHub',
  topSpeed: 25,
  chargingTime: '4–5 hrs',
  warranty: '2 years',
  batteryWarranty: '6 months',
  motor: '250W BLDC Hub Motor',
  noLicence: true,
  noRegistration: true,
  stock: 'in_stock',
  realRangeFactor: 0.82,
  colors: ['Pearl White', 'Matte Black', 'Sky Blue'],
  features: [
    'LED headlamp & tail lamp',
    'Digital LCD console',
    'Regenerative braking',
    'Side-stand motor cut-off',
    'Comfortable wide seat',
    'Home charging from any 5A socket',
  ],
  benefits: [
    'No licence required for eligible riders',
    'No registration paperwork',
    'Two battery options — pick what fits your budget',
    'Low running cost vs petrol',
  ],
};

export const SCOOTERS = [
  {
    id: 'single-light',
    name: 'Single Light',
    tagline: 'Compact, budget-friendly city runabout',
    price: 43000,
    hue: 'blue',
    images: [],
    weight: '58 kg',
    loadCapacity: '130 kg',
    featured: true,
    description:
      'The Single Light is our most accessible model — perfect for short daily hops, school drops, and market runs. Lightweight and easy to handle in narrow lanes, with a choice of Standard or Lithium Pro battery.',
    variants: buildVariants(43000, 55000, 50, 65),
    ...SHARED,
  },
  {
    id: 'double-light',
    name: 'Double Light',
    tagline: 'Everyday errands, extra comfort',
    price: 45000,
    hue: 'teal',
    images: [],
    weight: '65 kg',
    loadCapacity: '140 kg',
    featured: true,
    description:
      'The Double Light balances comfort and practicality for daily shop runs and town commutes. Generous range on both battery options, with a planted ride that replaces petrol scooters effortlessly.',
    variants: buildVariants(45000, 57000, 60, 75),
    ...SHARED,
  },
  {
    id: 'activa',
    name: 'Activa',
    tagline: 'Long-range comfort for longer trips',
    price: 58000,
    hue: 'green',
    images: [],
    weight: '72 kg',
    loadCapacity: '150 kg',
    featured: true,
    description:
      'The Activa is built for riders who need serious range — Berhampore to Kandi and back on a single charge. Spacious, comfortable, and dependable, with Standard or Lithium Pro batteries to match your daily distance.',
    variants: buildVariants(58000, 70000, 80, 95),
    ...SHARED,
    chargingTime: '5–6 hrs',
    warranty: '3 years',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    tagline: 'Premium pickup, smooth daily commute',
    price: 63000,
    hue: 'indigo',
    images: [],
    weight: '75 kg',
    loadCapacity: '155 kg',
    featured: true,
    description:
      'The Zoom delivers a premium ride feel with strong pickup and smooth handling for office commutes and longer daily runs. Choose Standard for value or Lithium Pro for maximum range and battery life.',
    variants: buildVariants(63000, 75000, 70, 120),
    ...SHARED,
    chargingTime: '5–6 hrs',
    warranty: '3 years',
  },
];

export const STOCK_LABELS = {
  in_stock: { label: 'In Stock', tone: 'success' },
  low_stock: { label: 'Few Left', tone: 'warning' },
  out_of_stock: { label: 'Out of Stock', tone: 'danger' },
};
