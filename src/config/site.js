/**
 * Central business configuration for BISWAJIT POWER HUB.
 * Static branding lives here; contact/hours/address/content are editable in Admin → Settings.
 */

import { toLegacyHours } from '@/features/site/siteHours';
import { SITE_FAQS as DEFAULT_SITE_FAQS } from '@/data/seoContent';

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
  ratingValue: 3.9,
  reviewCount: 17,
  bestRating: 5,
  worstRating: 1,
};

/** Exact NAP string to paste into Google Business Profile (must match site + schema) */
export const GBP_NAP = {
  name: 'BISWAJIT POWER HUB',
  website: 'https://biswajitpowerhub.in',
  phoneDisplay: '096355 05436',
  phoneDigits: '9635505436',
  address:
    'Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149',
  hoursSummary: 'Open all days 9:00 AM – 8:30 PM',
};

/** Explore Our Range tabs — labels/enabled editable in Admin → Settings */
export const DEFAULT_RANGE_TABS = [
  { id: 'all', label: 'ALL', enabled: true },
  { id: 'budget', label: 'BUDGET', enabled: true },
  { id: 'no-licence', label: 'NO LICENCE', enabled: true },
  { id: 'premium', label: 'PREMIUM', enabled: true },
];

/** Premium showroom perks — shown on homepage, service, product pages */
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

  gbp: { ...GBP_RATING },
  perks: PREMIUM_PERKS,
  faqs: DEFAULT_SITE_FAQS,
  rangeTabs: DEFAULT_RANGE_TABS,
  batteryUpgradeTagline: BATTERY_UPGRADE_TAGLINE,

  url: SITE_URL,
};

/** Social + Google Maps profile URLs for LocalBusiness / Organization sameAs */
export function siteSameAs(site = SITE) {
  return [
    site.social?.instagram,
    site.social?.facebook,
    site.social?.youtube,
    site.maps?.link,
  ].filter(Boolean);
}

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
  if (url.includes('place_id:')) return true;
  if (url.includes('origin=mfe') && /!1m2!2m1!1s/.test(url)) return true;
  if (!url.includes('!2s') && !url.includes('%21%32%73')) return true;
  return false;
}

function normalizeRangeTabs(raw) {
  const byId = Object.fromEntries(DEFAULT_RANGE_TABS.map((t) => [t.id, { ...t }]));
  if (Array.isArray(raw)) {
    for (const t of raw) {
      if (t?.id && byId[t.id]) {
        byId[t.id] = {
          id: t.id,
          label: (t.label || byId[t.id].label).toString(),
          enabled: t.enabled !== false,
        };
      }
    }
  }
  return DEFAULT_RANGE_TABS.map((t) => byId[t.id]);
}

function normalizePerks(raw) {
  if (!Array.isArray(raw) || !raw.length) return PREMIUM_PERKS.map((p) => ({ ...p }));
  return raw
    .filter((p) => p && (p.title || p.desc))
    .map((p, i) => ({
      id: p.id || `perk-${i + 1}`,
      title: p.title || '',
      desc: p.desc || '',
      highlight: p.highlight || '',
    }));
}

function normalizeFaqs(raw) {
  if (!Array.isArray(raw) || !raw.length) return DEFAULT_SITE_FAQS.map((f) => ({ ...f }));
  return raw
    .filter((f) => f && (f.question || f.answer))
    .map((f) => ({
      question: f.question || '',
      answer: f.answer || '',
    }));
}

/** Merge admin-editable fields into a full site object */
export function mergeSiteSettings(partial = {}) {
  const content = partial.content && typeof partial.content === 'object' ? partial.content : {};
  const branding = { ...(content.branding || partial.branding || {}) };
  const social = { ...SITE.social, ...(content.social || partial.social || {}) };
  const geoIn = { ...SITE.geo, ...(content.geo || partial.geo || {}) };
  const gbp = {
    ...GBP_RATING,
    ...(content.gbp || partial.gbp || {}),
  };
  gbp.ratingValue = Number(gbp.ratingValue) || GBP_RATING.ratingValue;
  gbp.reviewCount = Number(gbp.reviewCount) || GBP_RATING.reviewCount;

  const address = {
    ...CONTACT_DEFAULTS.address,
    ...partial.address,
  };
  address.full = buildAddressFull(address);

  const hoursPerDay = partial.hours || CONTACT_DEFAULTS.hours;
  const legacyHours = toLegacyHours(hoursPerDay);

  const maps = { ...CONTACT_DEFAULTS.maps, ...partial.maps };
  const placeFromContent = (content.geo?.placeId || geoIn.placeId || '').trim();
  if (placeFromContent && !maps.placeId) maps.placeId = placeFromContent;
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

  const name = (branding.name || SITE.name).trim() || SITE.name;
  const tagline = (branding.tagline || SITE.tagline).trim() || SITE.tagline;
  const description = (branding.description || SITE.description).trim() || SITE.description;

  return {
    ...SITE,
    name,
    tagline,
    description,
    shortName: branding.shortName || SITE.shortName,
    phones: partial.phones?.length ? partial.phones : CONTACT_DEFAULTS.phones,
    whatsapp: partial.whatsapp || CONTACT_DEFAULTS.whatsapp,
    address,
    maps,
    hours: legacyHours,
    hoursPerDay,
    social,
    geo: {
      latitude: String(geoIn.latitude || SITE.geo.latitude),
      longitude: String(geoIn.longitude || SITE.geo.longitude),
      placeId: placeId || SITE.maps.placeId,
    },
    gbp,
    perks: normalizePerks(content.perks || partial.perks),
    faqs: normalizeFaqs(content.faqs || partial.faqs),
    rangeTabs: normalizeRangeTabs(content.rangeTabs || partial.rangeTabs),
    batteryUpgradeTagline:
      (content.batteryUpgradeTagline || partial.batteryUpgradeTagline || BATTERY_UPGRADE_TAGLINE).trim()
      || BATTERY_UPGRADE_TAGLINE,
  };
}

/** Top nav — dealer IA (ALL CAPS labels rendered in Navbar) */
export const NAV_LINKS = [
  {
    label: 'PRODUCT',
    to: '/scooters',
    children: [
      { label: 'Scooters', to: '/scooters' },
      { label: 'Accessories', to: '/accessories' },
      { label: 'Compare', to: '/compare' },
    ],
  },
  { label: 'ABOUT US', to: '/about' },
  { label: 'SERVICE', to: '/service' },
  { label: 'FINANCE', to: '/finance' },
  { label: 'CONTACT US', to: '/contact' },
];

/** Footer — Models column (populated from catalog on Footer; static seeds here) */
export const FOOTER_MODEL_LINKS = [
  { label: 'Activa', to: '/scooters/activa' },
  { label: 'Zoom', to: '/scooters/zoom' },
  { label: 'Single Light', to: '/scooters/single-light' },
  { label: 'Double Light', to: '/scooters/double-light' },
];

export const FOOTER_MORE_LINKS = [
  { label: 'Finance', to: '/finance' },
  { label: 'Service', to: '/service' },
  { label: 'Our Community', to: '/community' },
  { label: 'Guides', to: '/guides' },
  { label: 'Accessories', to: '/accessories' },
];

/** Full footer Quick Links — every remaining indexable page (no exchange/updates) */
export const FOOTER_QUICK_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Offers', to: '/offers' },
  { label: 'Test Ride', to: '/test-ride-berhampore' },
  { label: 'Battery Upgrade', to: '/battery-upgrade-berhampore' },
  { label: 'Best in Berhampore', to: '/best-electric-scooters-berhampore' },
  { label: 'Kandi', to: '/electric-scooters-kandi' },
  { label: 'Jiaganj', to: '/electric-scooters-jiaganj' },
  { label: 'Beldanga', to: '/electric-scooters-beldanga' },
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
