/**
 * Central business configuration for BISWAJIT POWER HUB.
 * Static branding lives here; contact/hours/address are editable in Admin → Settings.
 */

import { toLegacyHours } from '@/features/site/siteHours';

/** Per-day hours seed — open every day 9:00 AM – 8:30 PM */
export const INITIAL_HOURS = {
  mon: { open: '09:00', close: '20:30', closed: false },
  tue: { open: '09:00', close: '20:30', closed: false },
  wed: { open: '09:00', close: '20:30', closed: false },
  thu: { open: '09:00', close: '20:30', closed: false },
  fri: { open: '09:00', close: '20:30', closed: false },
  sat: { open: '09:00', close: '20:30', closed: false },
  sun: { open: '09:00', close: '20:30', closed: false },
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

/** Google review / GBP-aligned rating — keep in sync with live Google reviews */
export const GBP_RATING = {
  ratingValue: 4.8,
  reviewCount: 12,
  bestRating: 5,
  worstRating: 1,
};

/** Defaults for contact & location — used until admin settings load */
export const CONTACT_DEFAULTS = {
  phones: ['9635505436'],
  whatsapp: '919635505436',
  address: {
    line: 'Chunakhali Bus Stand, Nimtala',
    city: 'Berhampore',
    district: 'Murshidabad',
    state: 'West Bengal',
    pincode: '742149',
    country: 'India',
    full: 'Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal, 742149, India',
  },
  maps: {
    link: 'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Berhampore',
    embed:
      'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Bus+Stand+Nimtala+Berhampore+Murshidabad+742149&output=embed',
    staticImage:
      'https://maps.googleapis.com/maps/api/staticmap?center=24.0987,88.2519&zoom=15&size=800x400&markers=color:red%7C24.0987,88.2519&key=',
    /** Set VITE_GOOGLE_PLACE_ID in env for a working “Write a Google review” link */
    placeId: (import.meta.env.VITE_GOOGLE_PLACE_ID || '').trim(),
    reviewLink: (import.meta.env.VITE_GOOGLE_PLACE_ID || '').trim()
      ? `https://search.google.com/local/writereview?placeid=${String(import.meta.env.VITE_GOOGLE_PLACE_ID).trim()}`
      : 'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Berhampore',
  },
  hours: { ...INITIAL_HOURS },
};

/** Public site URL — set VITE_SITE_URL in Vercel for canonical/OG links */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://biswajitpowerhub.in').replace(/\/$/, '');

export const SITE = {
  name: 'Biswajit Power Hub',
  shortName: 'Power Hub',
  tagline: 'Powering Every Ride',
  type: 'EV Dealership & Showroom',
  description:
    'Visit Biswajit Power Hub showroom in Berhampore for premium low-speed electric scooters. Call for a test ride — no licence, no registration for eligible models.',

  ...CONTACT_DEFAULTS,
  hours: toLegacyHours(CONTACT_DEFAULTS.hours),

  social: {
    instagram: 'https://www.instagram.com/biswajitpowerhub',
    facebook: 'https://www.facebook.com/BiswajitPowerHub',
    youtube: '',
  },

  /** Showroom coordinates (Chunakhali, Berhampore) for LocalBusiness schema */
  geo: {
    latitude: '24.0987',
    longitude: '88.2519',
  },

  url: SITE_URL,
};

export function buildAddressFull({ line, city, district, state, pincode, country }) {
  return [line, city, district, state, pincode, country].filter(Boolean).join(', ');
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

  const maps = { ...CONTACT_DEFAULTS.maps, ...partial.maps };
  const placeId = (maps.placeId || '').trim();
  if (placeId) {
    maps.placeId = placeId;
    maps.reviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`;
  } else if (!maps.reviewLink || maps.reviewLink.endsWith('placeid=')) {
    maps.reviewLink = maps.link || CONTACT_DEFAULTS.maps.link;
  }

  return {
    ...SITE,
    phones: partial.phones?.length ? partial.phones : CONTACT_DEFAULTS.phones,
    whatsapp: partial.whatsapp || CONTACT_DEFAULTS.whatsapp,
    address,
    maps,
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
  return `Hi Biswajit Power Hub, I'm interested in a custom battery upgrade${scooterName ? ` for the ${scooterName}` : ''} to increase mileage. Please share options and pricing.`;
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Scooters', to: '/scooters' },
  { label: 'Best in Berhampore', to: '/best-electric-scooters-berhampore' },
  { label: 'Low Budget', to: '/low-budget-electric-scooters-berhampore' },
  { label: 'Battery Upgrade', to: '/battery-upgrade-berhampore' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
];

/** Full footer Quick Links — every remaining indexable page (no exchange/updates) */
export const FOOTER_QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Scooters', to: '/scooters' },
  { label: 'Best in Berhampore', to: '/best-electric-scooters-berhampore' },
  { label: 'Low Budget', to: '/low-budget-electric-scooters-berhampore' },
  { label: 'No Licence', to: '/no-licence-electric-scooters-west-bengal' },
  { label: 'Battery Upgrade', to: '/battery-upgrade-berhampore' },
  { label: 'Test Ride', to: '/test-ride-berhampore' },
  { label: 'Accessories', to: '/accessories' },
  { label: 'Compare', to: '/compare' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/** @deprecated use FOOTER_QUICK_LINKS */
export const FOOTER_SEO_LINKS = FOOTER_QUICK_LINKS;

/** WhatsApp deep link — pass site from useSite() when available */
export function whatsappUrl(
  message = "Hi Biswajit Power Hub, I'd like to know more about your electric scooters.",
  site = SITE,
) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp link to a customer/lead phone (10-digit Indian mobile or full intl number) */
export function whatsappCustomerUrl(
  phone,
  message = "Hi, this is Biswajit Power Hub. We'd like to follow up on your inquiry.",
) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return whatsappUrl(message);
  const num = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${num}?text=${encodeURICommand(message)}`;
}

export function telUrl(phone, site = SITE) {
  const num = phone || site.phones[0];
  return `tel:+91${num}`;
}

/** Display phone for UI */
export function formatPhoneDisplay(phone = SITE.phones[0]) {
  const d = String(phone).replace(/\D/g, '');
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  return `+91 ${d}`;
}
