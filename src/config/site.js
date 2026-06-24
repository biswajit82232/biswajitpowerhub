/**
 * Central business configuration for BISWAJIT POWER HUB.
 * Single source of truth — update here, reflected everywhere.
 */

export const SITE = {
  name: 'BISWAJIT POWER HUB',
  shortName: 'Power Hub',
  tagline: 'Powering Every Ride',
  type: 'EV Dealership & Showroom',
  description:
    'Premium low-speed electric scooters in Berhampore, West Bengal. Ride electric, save more, power every journey.',

  phones: ['9635505436', '9775441797'],

  // Primary number used for WhatsApp deep links (with country code, no +)
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
    // Generic embed pointed at the locality; replace with exact place embed when available.
    embed:
      'https://www.google.com/maps?q=Nimtala%2C%20Chunakhali%2C%20Berhampore%2C%20West%20Bengal%20742149&output=embed',
  },

  hours: {
    weekdays: '10:00 AM – 8:00 PM',
    sunday: '11:00 AM – 6:00 PM',
  },

  social: {
    instagram: '',
    facebook: '',
    youtube: '',
  },

  url: 'https://biswajitpowerhub.example',
};

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Scooters', to: '/scooters' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
];

/**
 * Default whatsapp message helper.
 */
export function whatsappUrl(message = "Hi BISWAJIT POWER HUB, I'd like to know more about your electric scooters.") {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone = SITE.phones[0]) {
  return `tel:+91${phone}`;
}
