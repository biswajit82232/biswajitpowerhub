/**
 * Seed scooter catalog — used as a fallback / demo dataset when Supabase
 * is not configured, and as the seed source for `supabase/seed.sql`.
 *
 * Each model has two battery variants: Standard and Lithium Pro.
 * Listing price is the Standard variant (starting price).
 *
 * All models are LOW-SPEED, NON-RTO electric scooters (<= 25 km/h).
 */

import { DEFAULT_REAL_RANGE_FACTOR } from '../lib/rangeDefaults.js';

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
  warranty: '1 year motor & controller',
  batteryWarranty: '6 months',
  motor: '250W BLDC Hub Motor',
  noLicence: true,
  noRegistration: true,
  stock: 'in_stock',
  realRangeFactor: DEFAULT_REAL_RANGE_FACTOR,
  isBudget: false,
  isPremium: false,
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
    price: 38999,
    hue: 'blue',
    images: [],
    weight: '58 kg',
    loadCapacity: '130 kg',
    featured: true,
    description:
      'The Single Light is our most accessible electric scooter in Berhampore — perfect for short daily hops, school drops, and market runs across Murshidabad. Lightweight and easy to handle in narrow lanes, with no licence or RTO registration required for this low-speed model. Choose Standard or Lithium Pro battery at Biswajit Power Hub, Chunakhali.',
    variants: buildVariants(38999, 49999, 50, 65),
    ...SHARED,
    isBudget: true,
  },
  {
    id: 'double-light',
    name: 'Double Light',
    tagline: 'Everyday errands, extra comfort',
    price: 40999,
    hue: 'teal',
    images: [],
    weight: '65 kg',
    loadCapacity: '140 kg',
    featured: true,
    description:
      'The Double Light balances comfort and practicality for daily shop runs and town commutes in Berhampore and Murshidabad. Generous range on both battery options, with a planted ride that replaces petrol scooters effortlessly — no licence needed on this low-speed EV at Biswajit Power Hub.',
    variants: buildVariants(40999, 51999, 60, 75),
    ...SHARED,
    isBudget: true,
  },
  {
    id: 'activa',
    name: 'Activa',
    tagline: 'Long-range comfort for longer trips',
    price: 45999,
    hue: 'green',
    images: [],
    weight: '72 kg',
    loadCapacity: '150 kg',
    featured: true,
    description:
      'The Activa Electric Scooter is built for riders in Berhampore who need serious range — Murshidabad district trips on a single charge. Spacious, comfortable, and dependable, with Standard or Lithium Pro batteries. No licence, no registration for this low-speed model. Test ride at Chunakhali Bus Stand.',
    variants: buildVariants(45999, 57999, 80, 95),
    ...SHARED,
    isPremium: true,
    chargingTime: '5–6 hrs',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    tagline: 'Premium pickup, smooth daily commute',
    price: 42999,
    hue: 'indigo',
    images: [],
    weight: '75 kg',
    loadCapacity: '155 kg',
    featured: true,
    description:
      'The Zoom Electric Scooter delivers a premium ride feel with strong pickup and smooth handling for office commutes across Berhampore. Choose Standard for value or Lithium Pro for maximum range. Low-speed, no licence required. Visit Biswajit Power Hub in Murshidabad for a free test ride.',
    variants: buildVariants(42999, 54999, 70, 120),
    ...SHARED,
    isBudget: true,
    isPremium: true,
    chargingTime: '5–6 hrs',
  },
];

export const STOCK_LABELS = {
  in_stock: { label: 'In Stock', tone: 'success' },
  low_stock: { label: 'Few Left', tone: 'warning' },
  out_of_stock: { label: 'Out of Stock', tone: 'danger' },
};
