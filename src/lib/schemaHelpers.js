import { DAY_KEYS, DAY_LABELS, SITE, SITE_URL } from '@/config/site';

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

/** PostalAddress from site settings */
export function postalAddressSchema(address) {
  const a = address || SITE.address;
  return {
    '@type': 'PostalAddress',
    streetAddress: a.line,
    addressLocality: a.city,
    addressRegion: a.state,
    postalCode: a.pincode,
    addressCountry: 'IN',
  };
}

/** Compact LocalBusiness reference for Product seller, etc. */
export function localBusinessRef(site = SITE) {
  return {
    '@type': 'LocalBusiness',
    name: SITE.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512.png`,
    image: `${SITE_URL}/logo-512.png`,
    telephone: `+91${site.phones?.[0] || SITE.phones[0]}`,
    address: postalAddressSchema(site.address),
  };
}

/**
 * BreadcrumbList from [{ name, path }] — path is absolute path like /scooters/activa
 */
export function breadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${item.path.replace(/\/$/, '')}`,
    })),
  };
}

export function faqPageSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export const SCOOTER_FAQS = [
  {
    question: 'Do I need a licence to ride these electric scooters?',
    answer:
      'No licence or registration is required for our low-speed electric scooter models as they comply with RTO regulations for vehicles under 25 km/h.',
  },
  {
    question: 'What is the range of these electric scooters?',
    answer:
      'Our scooters offer ranges from about 50 km to 120 km per charge depending on the model and battery option. We also offer custom battery upgrades for extra range.',
  },
  {
    question: 'Where is your showroom located?',
    answer:
      'We are located at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad, West Bengal 742149.',
  },
  {
    question: 'Do you provide warranty and servicing?',
    answer:
      'Yes, all our electric scooters come with motor and controller warranty plus 3 free servicing sessions.',
  },
];

/** SEO copy keyed by scooter id */
export const SCOOTER_SEO = {
  activa: {
    title: 'Activa Electric Scooter — Price & Specs | Biswajit Power Hub, Berhampore',
    description:
      'Buy Activa electric scooter in Berhampore. No licence, no registration. Long-range comfort. 1 year warranty. Visit our showroom today.',
  },
  'single-light': {
    title: 'Single Light Electric Scooter — 80km Range | No Licence | Berhampore',
    description:
      'Affordable Single Light e-scooter at Biswajit Power Hub. 80 km range, home charging, no licence needed. Call 096355 05436.',
  },
  'double-light': {
    title: 'Double Light Electric Scooter — Dual Headlight | Berhampore',
    description:
      'Stylish Double Light electric scooter in Berhampore. Low speed, no registration. Visit Chunakhali Bus Stand showroom.',
  },
  zoom: {
    title: 'Zoom Electric Scooter — Sporty & Efficient | Biswajit Power Hub',
    description:
      'Sporty Zoom e-scooter available in Berhampore. No licence required. Low running cost. Test ride today at Chunakhali.',
  },
};

/** Stable product identifier for schema / inventory (e.g. BPH-ACTIVA) */
export function productSku(scooterId) {
  return `BPH-${String(scooterId || '').toUpperCase().replace(/-/g, '_')}`;
}

/**
 * AggregateRating from approved reviews for a scooter display name.
 * Returns null when there are fewer than 1 matching reviews (omit from schema).
 */
export function productAggregateRating(reviews, scooterName) {
  if (!Array.isArray(reviews) || !scooterName) return null;
  const matched = reviews.filter(
    (r) => r?.scooter && String(r.scooter).toLowerCase() === String(scooterName).toLowerCase(),
  );
  if (!matched.length) return null;
  const sum = matched.reduce((a, r) => a + Number(r.rating || 0), 0);
  return {
    '@type': 'AggregateRating',
    ratingValue: (sum / matched.length).toFixed(1),
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(matched.length),
  };
}
