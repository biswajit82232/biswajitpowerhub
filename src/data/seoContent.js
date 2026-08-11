/** Shared SEO FAQ + landing metadata for Biswajit Power Hub.
 * Exact prices/ranges come from live inventory via `@/lib/catalogCopy` — do not hardcode them here.
 */

import { DEFAULT_HOURS_SUMMARY_SHORT } from '@/features/site/siteHours';

export const SITE_FAQS = [
  {
    question: 'Do I need a licence to ride your electric scooters?',
    answer:
      'No! Our low-speed electric scooters (under 25 km/h) require no driving licence and no RTO registration in West Bengal as per the Central Motor Vehicles Act. You can ride them legally without any paperwork.',
  },
  {
    question: 'What is the price of electric scooters in Berhampore?',
    answer:
      'At Biswajit Power Hub, electric scooter prices depend on model and battery pack. Ask for today’s starting price and EMI at our Chunakhali showroom in Berhampore — we stock Activa, Zoom, Double Light, Single Light and more.',
  },
  {
    question: 'What is the range per full charge?',
    answer:
      'Range varies by model and battery option. Check each scooter page for current figures, or ask at the showroom. We also offer custom battery upgrades in Berhampore for customers who need extended range.',
  },
  {
    question: 'Do you offer test rides in Berhampore?',
    answer:
      `Yes! Free test rides are available at our Chunakhali showroom in Berhampore, Murshidabad. No appointment is needed — visit us ${DEFAULT_HOURS_SUMMARY_SHORT.toLowerCase()}.`,
  },
  {
    question: 'Do you provide EMI or financing?',
    answer:
      'Yes, EMI and financing options are available on all models. Contact us on WhatsApp at 096355 05436 or visit our showroom for details.',
  },
  {
    question: 'Where is your showroom located?',
    answer:
      'We are located at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad — 742149, West Bengal. We are right at the bus stand, easy to find from anywhere in Murshidabad district.',
  },
  {
    question: 'Do you sell batteries and spare parts separately?',
    answer:
      'Yes, we stock genuine spare parts including batteries, tyres, body panels, mirrors, and controllers. We also specialize in custom battery upgrades for extra range.',
  },
];

/** Titles/H1 only — price strings are filled from inventory in buildModelSeo(). */
export const MODEL_SEO_META = {
  activa: {
    title: 'Activa Electric Scooter Berhampore — Price & Test Ride',
    h1: 'Activa Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  zoom: {
    title: 'Zoom Electric Scooter Berhampore — Price & Test Ride',
    h1: 'Zoom Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  'single-light': {
    title: 'Single Light Electric Scooter Berhampore — Price',
    h1: 'Single Light Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
  'double-light': {
    title: 'Double Light Electric Scooter Berhampore — Price',
    h1: 'Double Light Electric Scooter in Berhampore — Price, Features & Test Ride',
  },
};

/** @deprecated Use buildComparisonRows(scooters) from @/lib/catalogCopy */
export const COMPARISON_ROWS = [];
