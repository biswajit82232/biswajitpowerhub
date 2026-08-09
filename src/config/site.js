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
    link: 'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7',
    /**
     * Official Google Maps “Share → Embed a map” URL for BISWAJIT POWER HUB.
     * Includes the business name card (CID + !2s name). Do not use bare place_id embeds —
     * those only show a pin without the shop name.
     */
    embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3641.5628218243573!2d88.2914134!3d24.116864999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f97d8ca9a2f93f%3A0x12cb86e86f5f3df7!2sBISWAJIT%20POWER%20HUB!5e0!3m2!1sen!2sin!4v1786301323227!5m2!1sen!2sin',
    staticImage:
      'https://maps.googleapis.com/maps/api/staticmap?center=24.116865,88.2914134&zoom=16&size=800x400&markers=color:red%7C24.116865,88.2914134&key=',
    /** Set VITE_GOOGLE_PLACE_ID in env to override; default is live GBP listing */
    placeId: (import.meta.env.VITE_GOOGLE_PLACE_ID || 'ChIJP_miqYx9-TkR9z1fb-iGyxI').trim(),
    reviewLink: (() => {
      const id = (import.meta.env.VITE_GOOGLE_PLACE_ID || 'ChIJP_miqYx9-TkR9z1fb-iGyxI').trim();
      return id
        ? `https://search.google.com/local/writereview?placeid=${id}`
        : 'https://maps.app.goo.gl/2SPHtdi1dhLUHHtb7';
    })(),
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

  /** Showroom coordinates from live GBP listing (Chunakhali, Berhampore) */
  geo: {
    latitude: '24.116865',
    longitude: '88.2914134',
  },

  url: SITE_URL,
};

export function buildAddressFull({ line, city, district, state, pincode, country }) {
  return [line, city, district, state, pincode, country].filter(Boolean).join(', ');
}

const DEFAULT_PLACE_ID = 'ChIJP_miqYx9-TkR9z1fb-iGyxI';

/** Working Google Maps iframe src — named embed for our GBP; place_id fallback otherwise. */
export function mapsEmbedFromPlaceId(placeId) {
  const id = (placeId || '').trim();
  if (!id || id === DEFAULT_PLACE_ID) return CONTACT_DEFAULTS.maps.embed;
  return `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1splace_id:${encodeURIComponent(id)}`;
}

function isLegacyMapsEmbed(url) {
  if (!url || typeof url !== 'string') return true;
  if (url.includes('output=embed')) return true;
  if (!url.includes('/maps/embed')) return true;
  // Bare place_id / minimal mfe embeds show a pin without the shop name card
  if (url.includes('place_id:')) return true;
  if (url.includes('origin=mfe') && /!1m2!2m1!1s/.test(url)) return true;
  // Full Share→Embed URLs include the business name as !2s…
  if (!url.includes('!2s') && !url.includes('%21%32%73')) return true;
  return false;
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
  if (!maps.embed?.trim()) {
    maps.embed = CONTACT_DEFAULTS.maps.embed;
  }
  const placeId = (maps.placeId || CONTACT_DEFAULTS.maps.placeId || '').trim();
  if (placeId) {
    maps.placeId = placeId;
    maps.reviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`;
    if (isLegacyMapsEmbed(maps.embed)) {
      maps.embed = mapsEmbedFromPlaceId(placeId);
    }
  } else if (!maps.reviewLink || maps.reviewLink.endsWith('placeid=')) {
    maps.reviewLink = maps.link || CONTACT_DEFAULTS.maps.link;
  }
  if (isLegacyMapsEmbed(maps.embed)) {
    maps.embed = CONTACT_DEFAULTS.maps.embed;
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
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
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
