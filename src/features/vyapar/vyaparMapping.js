import { ACCESSORY_CATEGORIES } from '@/data/accessories';
import { slugify } from '@/lib/utils';
import { DEFAULT_REAL_RANGE_FACTOR } from '@/lib/rangeDefaults';

/** Vyapar online-store category → local accessory category (or scooter). */
export const VYAPAR_CATEGORY_MAP = {
  'E-Scooty': { type: 'scooter' },
  Accessories: { type: 'accessory', category: 'Other' },
  Helmet: { type: 'accessory', category: 'Helmet' },
  'Acid Battery': { type: 'accessory', category: 'Battery' },
  'Lithium Battery': { type: 'accessory', category: 'Battery' },
  Parts: { type: 'accessory', category: 'Spare Parts' },
  Workshop: { type: 'accessory', category: 'Spare Parts' },
};

/** Name-based hints when Vyapar category is too broad (e.g. Accessories). */
const NAME_CATEGORY_HINTS = [
  { match: /helmet/i, category: 'Helmet' },
  { match: /tyre|tire/i, category: 'Tyres' },
  { match: /light|lamp|headlight|taillight/i, category: 'Lights' },
  { match: /battery|lithium|graphine|graphene/i, category: 'Battery' },
  { match: /cover|guard|footrest|buzzer|pad|bearing|oil/i, category: 'Spare Parts' },
];

export const VYAPAR_CATALOGUE_CDN = 'https://vyapar-catalog.vypcdn.in/';

/**
 * Guess local product type + accessory category from Vyapar categories (+ name hints).
 */
export function suggestMapping(categoryNames = [], itemName = '') {
  const cats = Array.isArray(categoryNames) ? categoryNames : [];
  for (const name of cats) {
    const hit = VYAPAR_CATEGORY_MAP[name];
    if (hit) {
      if (hit.type === 'scooter') {
        return { mappedType: 'scooter', mappedCategory: null };
      }
      let category = hit.category || 'Other';
      // Refine broad "Accessories" / "Other" using item name
      if (category === 'Other' || name === 'Accessories') {
        for (const hint of NAME_CATEGORY_HINTS) {
          if (hint.match.test(itemName || '')) {
            category = hint.category;
            break;
          }
        }
      }
      return { mappedType: 'accessory', mappedCategory: category };
    }
  }
  for (const hint of NAME_CATEGORY_HINTS) {
    if (hint.match.test(itemName || '')) {
      return { mappedType: 'accessory', mappedCategory: hint.category };
    }
  }
  return { mappedType: 'accessory', mappedCategory: 'Other' };
}

/**
 * Map Vyapar quantity / stock flag → local stock_status.
 * Negative qty is treated as service / unlimited (in stock).
 */
export function mapVyaparStock(quantity, stockFlag = true) {
  if (stockFlag === false) return 'out_of_stock';
  const qty = Number(quantity);
  if (!Number.isFinite(qty)) return stockFlag ? 'in_stock' : 'out_of_stock';
  if (qty < 0) return 'in_stock';
  if (qty === 0) return 'out_of_stock';
  if (qty === 1) return 'low_stock';
  return 'in_stock';
}

export function effectiveName(item) {
  const custom = (item?.displayName || '').trim();
  return custom || item?.name || 'Untitled';
}

export function effectivePrice(item) {
  const discounted = Number(item?.discountedPrice);
  const price = Number(item?.price);
  if (Number.isFinite(discounted) && discounted > 0) return discounted;
  return Number.isFinite(price) ? price : 0;
}

export function vyaparImageUrl(item, index = 0) {
  if (!item?.catalogueId || !item?.id) return null;
  const folder = item.imageFolder || '';
  if (!folder) return null;
  return `${VYAPAR_CATALOGUE_CDN}${item.catalogueId}/${item.id}${folder}/${index}.jpg`;
}

export function normalizeAccessoryCategory(value) {
  if (!value) return 'Other';
  if (ACCESSORY_CATEGORIES.includes(value)) return value;
  return value;
}

/** Build a unique slug that does not collide with existing ids. */
export function uniqueSlug(baseName, existingIds = []) {
  const set = new Set(existingIds);
  let base = slugify(baseName) || `item-${Date.now()}`;
  if (!set.has(base)) return base;
  let i = 2;
  while (set.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

/**
 * Apply a synced price onto a scooter without breaking variant-based display.
 * normalizeScooter() uses the cheapest variant price when variants exist, so
 * updating only top-level `price` would be ignored on the public site.
 */
export function applyPriceToScooter(scooter, price) {
  const next = { ...scooter, price };
  const variants = Array.isArray(scooter.variants) ? scooter.variants : [];
  if (!variants.length) return next;

  const indexed = variants.map((v, i) => ({ v, i, price: Number(v.price) || 0 }));
  indexed.sort((a, b) => a.price - b.price);
  const cheapestIdx = indexed[0].i;
  next.variants = variants.map((v, i) => (
    i === cheapestIdx ? { ...v, price: Number(price) || 0 } : v
  ));
  return next;
}

export function defaultScooterFromVyapar(item, id) {
  const name = effectiveName(item);
  const price = effectivePrice(item);
  return {
    id,
    name,
    brand: 'PowerHub',
    tagline: '',
    price,
    hue: 'blue',
    images: Array.isArray(item.localImages) ? [...item.localImages] : [],
    batteryType: '',
    batteryCapacity: '',
    range: 0,
    realRangeFactor: DEFAULT_REAL_RANGE_FACTOR,
    topSpeed: 25,
    chargingTime: '',
    warranty: '',
    batteryWarranty: '',
    motor: '',
    weight: '',
    loadCapacity: '',
    colors: [],
    noLicence: true,
    noRegistration: true,
    isBudget: price > 0 && price < 35000,
    isPremium: price >= 40000,
    stock: mapVyaparStock(item.quantity, item.stockFlag),
    featured: false,
    description: item.description || '',
    features: [],
    benefits: [],
    variants: [],
  };
}

export function defaultAccessoryFromVyapar(item, id) {
  const name = effectiveName(item);
  const suggested = suggestMapping(item.categoryVyapar, item.name);
  return {
    id,
    name,
    category: normalizeAccessoryCategory(item.mappedCategory || suggested.mappedCategory || 'Other'),
    price: effectivePrice(item),
    hue: 'teal',
    images: Array.isArray(item.localImages) ? [...item.localImages] : [],
    description: item.description || '',
    compatibility: '',
    stock: mapVyaparStock(item.quantity, item.stockFlag),
    featured: false,
  };
}
