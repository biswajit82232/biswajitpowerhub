/**
 * Central business configuration for BISWAJIT POWER HUB.
 * Static branding lives here; contact/hours/address are editable in Admin → Settings.
 */

import { toLegacyHours } from '@/features/site/siteHours';

/** Per-day hours seed — Mon–Sat 10–8, Sun 11–6 */
export const INITIAL_HOURS = {
  mon: { open: '10:00', close: '20:00', closed: false },
  tue: { open: '10:00', close: '20:00', closed: false },
  wed: { open: '10:00', close: '20:00', closed: false },
  thu: { open: '10:00', close: '20:00', closed: false },
  fri: { open: '10:00', close: '20:00', closed: false },
  sat: { open: '10:00', close: '20:00', closed: false },
  sun: { open: '11:00', close: '18:00', closed: false },
};

/** Default time range when resetting a day in admin (9 AM – 8:30 PM) */
export const DEFAULT_DAY_HOURS = { open: '09:00', close: '20:30', closed: false };

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DAY_LABELS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/** Defaults for contact & location — used until admin settings load */
export const CONTACT_DEFAULTS = {
  phones: ['9635505436', '9775441797'],
  whatsapp: '919635505436',
  address: {
    line: 'Nimtala, Chunakhali, Berhampore',
    city: 'Berhampore',
    state: 'West Bengal',
    pincode: '742149',
    country: 'India',
    full: 'Nimtala, Chunakhali, Berhampore, West Bengal, 742149, India',
  },
  maps: {
    link: 'https://maps.app.goo.gl/jRPDFP7DyfPocFEj8?g_st=ac',
    embed:
      'https://www.google.com/maps?q=Nimtala%2C%20Chunakhali%2C%20Berhampore%2C%20West%20Bengal%20742149&output=embed',
  },
  hours: { ...INITIAL_HOURS },
};

/** Public site URL — set VITE_SITE_URL in Vercel for canonical/OG links */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://biswajitpowerhub.vercel.app';

export const SITE = {
  name: 'BISWAJIT POWER HUB',
  shortName: 'Power Hub',
  tagline: 'Powering Every Ride',
  type: 'EV Dealership & Showroom',
  description:
    'Premium low-speed electric scooters in Berhampore, West Bengal. Ride electric, save more, power every ride.',

  ...CONTACT_DEFAULTS,
  hours: toLegacyHours(CONTACT_DEFAULTS.hours),

  social: {
    instagram: '',
    facebook: '',
    youtube: '',
  },

  url: SITE_URL,
};

export function buildAddressFull({ line, state, pincode, country }) {
  return [line, state, pincode, country].filter(Boolean).join(', ');
}

/** Merge admin-editable fields into a full site object */
export function mergeSiteSettings(partial) {
  const address = {
    ...CONTACT_DEFAULTS.address,
    ...partial.address,
  };
  address.full = buildAddressFull(address);

  const hoursPerDay = partial.hours || CONTACT_DEFAULTS.hours;
  const legacyHours = toLegacyHours(hoursPerDay);

  return {
    ...SITE,
    phones: partial.phones?.length ? partial.phones : CONTACT_DEFAULTS.phones,
    whatsapp: partial.whatsapp || CONTACT_DEFAULTS.whatsapp,
    address,
    maps: { ...CONTACT_DEFAULTS.maps, ...partial.maps },
    hours: legacyHours,
    hoursPerDay,
  };
}

/** Premium showroom perks — shown on homepage, footer, and product pages */
export const PREMIUM_PERKS = [
  {
    id: 'servicing',
    title: '3 Free Servicing',
    desc: 'Complimentary service visits at our showroom.',
    highlight: '3×',
  },
  {
    id: 'warranty',
    title: '1 Year Motor & Controller Warranty',
    desc: 'Full-year motor & controller coverage.',
    highlight: '1 Yr',
  },
  {
    id: 'batteryUpgrade',
    title: 'Custom Battery Upgrades',
    desc: 'Need more range? Higher AH batteries & custom mods — ask us.',
    highlight: '+ Range',
  },
];

/** Short copy for battery upgrade mentions across the site */
export const BATTERY_UPGRADE_TAGLINE =
  'Need more mileage? We offer custom higher-AH battery upgrades on eligible models — contact us to know more.';

export function batteryUpgradeWhatsappMessage(scooterName) {
  return `Hi BISWAJIT POWER HUB, I'm interested in a custom battery upgrade${scooterName ? ` for the ${scooterName}` : ''} to increase mileage. Please share options and pricing.`;
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Scooters', to: '/scooters' },
  { label: 'Parts', to: '/accessories' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
];

/** WhatsApp deep link — pass site from useSite() when available */
export function whatsappUrl(
  message = "Hi BISWAJIT POWER HUB, I'd like to know more about your electric scooters.",
  site = SITE,
) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp link to a customer/lead phone (10-digit Indian mobile or full intl number) */
export function whatsappCustomerUrl(
  phone,
  message = "Hi, this is BISWAJIT POWER HUB. We'd like to follow up on your inquiry.",
) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return whatsappUrl(message);
  const num = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone, site = SITE) {
  const num = phone || site.phones[0];
  return `tel:+91${num}`;
}
