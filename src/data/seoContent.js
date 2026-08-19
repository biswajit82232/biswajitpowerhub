/** Shared SEO FAQ + landing metadata for Biswajit Power Hub.
 * Exact prices/ranges come from live inventory via `@/lib/catalogCopy` — do not hardcode them here.
 */

import { DEFAULT_HOURS_SUMMARY_SHORT } from '@/features/site/siteHours';

export const SITE_FAQS = [
  {
    question: 'Do I need a licence to ride your electric scooters?',
    bnQuestion: 'আপনার ইলেকট্রিক স্কুটার চালাতে লাইসেন্স লাগে?',
    answer:
      'No! Our low-speed electric scooters (under 25 km/h) require no driving licence and no RTO registration in West Bengal as per the Central Motor Vehicles Act. You can ride them legally without any paperwork.',
    bnAnswer:
      'না! আমাদের লো-স্পিড ইলেকট্রিক স্কুটার (২৫ কিমি/ঘণ্টা পর্যন্ত) চালাতে ড্রাইভিং লাইসেন্স বা RTO রেজিস্ট্রেশন লাগে না — পশ্চিমবঙ্গে সেন্ট্রাল মোটর ভেহিকেলস অ্যাক্ট অনুযায়ী। কোনো কাগজপত্র ছাড়াই চালাতে পারেন।',
  },
  {
    question: 'What is the price of electric scooters in Berhampore?',
    bnQuestion: 'বহরমপুরে ইলেকট্রিক স্কুটারের দাম কত?',
    answer:
      'At Biswajit Power Hub, electric scooter prices depend on model and battery pack. Ask for today’s starting price and EMI at our Chunakhali showroom in Berhampore — we stock Activa, Zoom, Double Light, Single Light and more.',
    bnAnswer:
      'বিশ্বজিৎ পাওয়ার হাবে দাম মডেল ও ব্যাটারি প্যাক অনুযায়ী। চুনাখালি শোরুমে আজকের স্টার্টিং দাম ও EMI জানুন — Activa, Zoom, Double Light, Single Light সহ আরও মডেল আছে।',
  },
  {
    question: 'What is the range per full charge?',
    bnQuestion: 'এক চার্জে কত রেঞ্জ?',
    answer:
      'Range varies by model and battery option. Check each scooter page for current figures, or ask at the showroom. We also offer custom battery upgrades in Berhampore for customers who need extended range.',
    bnAnswer:
      'রেঞ্জ মডেল ও ব্যাটারি অপশন অনুযায়ী বদলায়। প্রতিটি স্কুটার পেজে দেখুন, বা শোরুমে জিজ্ঞাসা করুন। বেশি রেঞ্জ চাইলে বহরমপুরে কাস্টম ব্যাটারি আপগ্রেডও করি।',
  },
  {
    question: 'Do you offer test rides in Berhampore?',
    bnQuestion: 'বহরমপুরে টেস্ট রাইড হয়?',
    answer:
      `Yes! Free test rides are available at our Chunakhali showroom in Berhampore, Murshidabad. No appointment is needed — visit us ${DEFAULT_HOURS_SUMMARY_SHORT.toLowerCase()}.`,
    bnAnswer:
      `হ্যাঁ! চুনাখালি শোরুমে ফ্রি টেস্ট রাইড আছে। অ্যাপয়েন্টমেন্ট লাগে না — ${DEFAULT_HOURS_SUMMARY_SHORT.toLowerCase()} আসুন।`,
  },
  {
    question: 'Do you provide EMI or financing?',
    bnQuestion: 'EMI বা ফিনান্স আছে?',
    answer:
      'Yes, EMI and financing options are available on all models. Contact us on WhatsApp at 096355 05436 or visit our showroom for details.',
    bnAnswer:
      'হ্যাঁ, সব মডেলে EMI ও ফিনান্স আছে। হোয়াটসঅ্যাপে 096355 05436-এ যোগাযোগ করুন বা শোরুমে আসুন।',
  },
  {
    question: 'Where is your showroom located?',
    bnQuestion: 'শোরুম কোথায়?',
    answer:
      'We are located at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad — 742149, West Bengal. We are right at the bus stand, easy to find from anywhere in Murshidabad district.',
    bnAnswer:
      'চুনাখালি বাস স্ট্যান্ড, নিমতলা, বহরমপুর, মুর্শিদাবাদ — 742149। বাস স্ট্যান্ডের পাশেই, মুর্শিদাবাদ জেলা থেকে সহজে পাওয়া যায়।',
  },
  {
    question: 'Do you sell batteries and spare parts separately?',
    bnQuestion: 'ব্যাটারি ও স্পেয়ার পার্টস আলাদা বিক্রি হয়?',
    answer:
      'Yes, we stock genuine spare parts including batteries, tyres, body panels, mirrors, and controllers. We also specialize in custom battery upgrades for extra range.',
    bnAnswer:
      'হ্যাঁ, আসল স্পেয়ার পার্টস আছে — ব্যাটারি, টায়ার, বডি প্যানেল, মিরর, কন্ট্রোলার। অতিরিক্ত রেঞ্জের জন্য কাস্টম ব্যাটারি আপগ্রেডও করি।',
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
