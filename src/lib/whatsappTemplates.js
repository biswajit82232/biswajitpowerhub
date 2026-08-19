import { formatINR } from './utils.js';
import { emiFrom } from './finance.js';
import { getStartingPrice } from './scooterVariants.js';
import { STOCK_LABELS } from '../data/scooters.js';

export const WA_TPL_LANG_KEY = 'bph_wa_tpl_lang';

function firstName(name) {
  const n = String(name || '').trim();
  if (!n || /^anon/i.test(n)) return '';
  return n.split(/\s+/)[0];
}

export function findCatalogScooter(scooters, name) {
  if (!name || !scooters?.length) return null;
  const raw = String(name).split('—')[0].split('-')[0].trim().toLowerCase();
  return (
    scooters.find((s) => s.name.toLowerCase() === raw) ||
    scooters.find((s) => raw.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(raw)) ||
    null
  );
}

function priceLine(scooter, settings) {
  if (!scooter) return null;
  const price = getStartingPrice(scooter);
  const emi = emiFrom({ price, settings });
  const stock = STOCK_LABELS[scooter.stock]?.label || 'in stock';
  return { price, emi, stock, name: scooter.name };
}

const TPL = {
  en: {
    greet: (n) => (n ? `Hi ${n},` : 'Hi,'),
    sign: '— Biswajit Power Hub, Chunakhali Bus Stand, Berhampore. Call 096355 05436',
    price: ({ greet, model, price, emi, stock }) =>
      `${greet} ${model} on-road is ${formatINR(price)}. EMI from ${formatINR(emi)}/mo*. ${stock}. Visit us for a free test ride.\n${TPL.en.sign}`,
    emi: ({ greet, model, price, emi }) =>
      `${greet} EMI for ${model} (${formatINR(price)} on-road) starts at about ${formatINR(emi)}/mo*. Final terms at the showroom.\n${TPL.en.sign}`,
    stock: ({ greet, model, stock }) =>
      `${greet} ${model} is ${stock} at our Chunakhali showroom. Come for a free test ride today — we are open all days 9 AM–8:30 PM.\n${TPL.en.sign}`,
    ride: ({ greet, model, date, time }) =>
      `${greet} confirming your ${model || 'scooter'} test ride${date ? ` on ${date}` : ''}${time ? ` at ${time}` : ''}. Please reach Chunakhali Bus Stand, Nimtala. Reply if you need to change the slot.\n${TPL.en.sign}`,
    service: ({ greet, kind, date, time }) =>
      `${greet} confirming your ${kind || 'service'} booking${date ? ` on ${date}` : ''}${time ? ` at ${time}` : ''} at Biswajit Power Hub. Please bring your scooter.\n${TPL.en.sign}`,
    follow: ({ greet }) =>
      `${greet} this is Biswajit Power Hub regarding your enquiry. We have no-licence electric scooters from the showroom — when can we call you, or would you like to visit Chunakhali for a test ride?\n${TPL.en.sign}`,
  },
  bn: {
    greet: (n) => (n ? `নমস্কার ${n},` : 'নমস্কার,'),
    sign: '— বিশ্বজিৎ পাওয়ার হাব, চুনাখালি বাস স্ট্যান্ড, বহরমপুর। কল 096355 05436',
    price: ({ greet, model, price, emi, stock }) =>
      `${greet} ${model} অন-রোড দাম ${formatINR(price)}। EMI ${formatINR(emi)}/মাস* থেকে। ${stock}। ফ্রি টেস্ট রাইডের জন্য চুনাখালি আসুন।\n${TPL.bn.sign}`,
    emi: ({ greet, model, price, emi }) =>
      `${greet} ${model} (${formatINR(price)} অন-রোড) EMI প্রায় ${formatINR(emi)}/মাস*। চূড়ান্ত শর্ত শোরুমে।\n${TPL.bn.sign}`,
    stock: ({ greet, model, stock }) =>
      `${greet} ${model} আমাদের চুনাখালি শোরুমে ${stock}। আজই ফ্রি টেস্ট রাইডে আসুন — প্রতিদিন সকাল ৯টা–রাত ৮:৩০।\n${TPL.bn.sign}`,
    ride: ({ greet, model, date, time }) =>
      `${greet} আপনার ${model || 'স্কুটার'} টেস্ট রাইড নিশ্চিত${date ? ` ${date}` : ''}${time ? `, ${time}` : ''}। চুনাখালি বাস স্ট্যান্ড, নিমতলায় আসুন। সময় বদলাতে চাইলে রিপ্লাই করুন।\n${TPL.bn.sign}`,
    service: ({ greet, kind, date, time }) =>
      `${greet} আপনার ${kind || 'সার্ভিস'} বুকিং নিশ্চিত${date ? ` ${date}` : ''}${time ? `, ${time}` : ''}। স্কুটার নিয়ে আসুন।\n${TPL.bn.sign}`,
    follow: ({ greet }) =>
      `${greet} বিশ্বজিৎ পাওয়ার হাব থেকে আপনার এনকোয়ারি নিয়ে কথা বলছি। নো-লাইসেন্স ইলেকট্রিক স্কুটার আছে — কখন কল করব, নাকি টেস্ট রাইডে আসবেন?\n${TPL.bn.sign}`,
  },
};

export function listQuoteTemplates({ kind = 'lead', scooterName, date, time: _time, serviceKind } = {}) {
  const items = [
    { id: 'follow', label: 'Follow up', needsModel: false },
    { id: 'price', label: 'Price quote', needsModel: true },
    { id: 'emi', label: 'EMI quote', needsModel: true },
    { id: 'stock', label: 'In stock today', needsModel: true },
  ];
  if (kind === 'test_ride' || date) {
    items.unshift({ id: 'ride', label: 'Confirm test ride', needsModel: false });
  }
  if (kind === 'service' || serviceKind) {
    items.unshift({ id: 'service', label: 'Confirm service', needsModel: false });
  }
  if (kind === 'callback') {
    items[items.findIndex((i) => i.id === 'follow')].label = 'Callback follow-up';
  }
  return items.map((item) => ({
    ...item,
    hint: scooterName && item.needsModel ? scooterName : undefined,
  }));
}

export function buildQuoteMessage({
  id,
  lang = 'en',
  name,
  scooter,
  scooterName,
  settings,
  date,
  time,
  serviceKind,
}) {
  const pack = TPL[lang] || TPL.en;
  const greet = pack.greet(firstName(name));
  const priced = priceLine(scooter, settings);
  const model = priced?.name || scooterName || 'our electric scooters';
  const ctx = {
    greet,
    model,
    price: priced?.price || 0,
    emi: priced?.emi || 0,
    stock: priced?.stock || 'available',
    date,
    time,
    kind: serviceKind || 'service',
  };
  const fn = pack[id] || pack.follow;
  return fn(ctx);
}
