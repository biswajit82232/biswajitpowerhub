/**
 * Satellite town / service-area pages for Murshidabad local SEO.
 * Paths are absolute (no trailing slash). Showroom stays Berhampore.
 */

function buildLocation({
  slug,
  name,
  titleName,
  h1,
  intro,
  localNote,
  distanceHint,
  nearby,
  faqs,
  highlights,
  description,
  title,
}) {
  const label = titleName || name;
  return {
    slug,
    path: `/electric-scooters-${slug}`,
    name,
    district: 'Murshidabad',
    title: title || `Electric Scooters in ${label} | Biswajit Power Hub Berhampore`,
    description:
      description ||
      `Buy electric scooters near ${label}, Murshidabad. No licence models at current showroom prices. Free test ride at Biswajit Power Hub, Chunakhali, Berhampore. Call 096355 05436.`,
    h1: h1 || `Electric Scooters for ${label} — Showroom in Berhampore`,
    intro:
      intro ||
      `Riders from ${name} choose Biswajit Power Hub in Berhampore for low-speed electric scooters with no licence, honest pricing, and free test rides at Chunakhali Bus Stand.`,
    localNote:
      localNote ||
      `${name} customers visit our physical showroom at Chunakhali Bus Stand for supervised test rides, EMI guidance, and battery upgrade advice — then leave with clear ownership paperwork expectations.`,
    distanceHint: distanceHint || `Serving ${name} riders who prefer a verified Berhampore showroom`,
    nearby: nearby || ['berhampore', 'cossimbazar', 'lalbagh'],
    faqs: faqs || [
      {
        question: `Do you serve customers from ${name}?`,
        answer: `Yes — visit our showroom at Chunakhali Bus Stand, Berhampore for purchase, paperwork guidance, and handover. Call 096355 05436 to confirm stock before you travel from ${name}.`,
      },
      {
        question: `Which scooter suits ${name} daily rides?`,
        answer:
          'Activa and Zoom are popular for longer Murshidabad routes. Single Light and Double Light suit shorter town runs. Book a free test ride to compare.',
      },
    ],
    highlights: highlights || [
      'No licence / no RTO on eligible low-speed models',
      'Current showroom prices with EMI options',
      'Custom battery upgrades for longer Murshidabad routes',
      '3 free servicing + 1 year motor & controller warranty',
    ],
  };
}

/** Ordered to match showroom service coverage list */
export const SERVICE_LOCATIONS = [
  buildLocation({
    slug: 'berhampore',
    name: 'Berhampore',
    title: 'Electric Scooters in Berhampore | Biswajit Power Hub Showroom',
    description:
      'Buy electric scooters in Berhampore at Biswajit Power Hub, Chunakhali Bus Stand — no licence models, live showroom prices, free test ride, EMI. Call 096355 05436.',
    h1: 'Electric Scooters in Berhampore — Chunakhali Showroom',
    intro:
      'Biswajit Power Hub is the Berhampore electric scooter showroom at Chunakhali Bus Stand, Nimtala — Activa, Zoom, Single Light, and Double Light with free test rides, EMI, and walk-in service. For “near me” searches, also see our dedicated near-me hub.',
    localNote:
      'Our Berhampore showroom is open all days 9:00 AM – 8:30 PM. Walk in for a supervised test ride, compare battery packs, and get clear on-road pricing — we are a physical dealership, not an online-only seller.',
    distanceHint: 'Showroom at Chunakhali Bus Stand, Nimtala — central for Berhampore town',
    nearby: ['cossimbazar', 'chaltia-gora-bazar', 'lalbagh', 'daulatabad', 'nabagram'],
    faqs: [
      {
        question: 'Where is the electric scooter showroom near me in Berhampore?',
        answer:
          'Biswajit Power Hub is at Chunakhali Bus Stand, Nimtala, Berhampore, Murshidabad 742149. Search BISWAJIT POWER HUB on Google Maps or call 096355 05436.',
      },
      {
        question: 'Do I need a licence for your scooters in Berhampore?',
        answer:
          'Eligible low-speed models (≤25 km/h) generally need no driving licence and no RTO registration in West Bengal. Our team confirms the class for each model at the counter.',
      },
      {
        question: 'Can I get EMI and a free test ride today?',
        answer:
          'Yes — free supervised test rides during showroom hours, and EMI guidance with transparent slabs. Call or WhatsApp 096355 05436 before you visit if you want a colour reserved.',
      },
    ],
    highlights: [
      'Electric scooter dealer near you in Berhampore',
      'No licence / no RTO on eligible low-speed models',
      'Free supervised test rides daily',
      'EMI, battery upgrades, and 3 free services',
    ],
  }),
  buildLocation({
    slug: 'cossimbazar',
    name: 'Cossimbazar',
    distanceHint: 'Short ride from Cossimbazar to Chunakhali Bus Stand, Berhampore',
    nearby: ['berhampore', 'chaltia-gora-bazar', 'lalbagh', 'daulatabad'],
    intro:
      'Families in Cossimbazar choose Biswajit Power Hub for affordable no-licence electric scooters, clear EMI, and a real showroom at Chunakhali, Berhampore — minutes away for a free test ride.',
    localNote:
      'Cossimbazar riders often use the scooter for market trips and Berhampore town hops. Single Light and Double Light are popular starters; Activa suits families who want more everyday range.',
    faqs: [
      {
        question: 'How far is Biswajit Power Hub from Cossimbazar?',
        answer:
          'A short local ride to Chunakhali Bus Stand, Nimtala, Berhampore. Search BISWAJIT POWER HUB on Maps or call 096355 05436 for the quickest route from your area.',
      },
      {
        question: 'Can Cossimbazar buyers get same-day test rides?',
        answer:
          'Yes — walk in during 9:00 AM – 8:30 PM (all days). Free supervised test rides; no appointment required.',
      },
    ],
    highlights: [
      'Close to Berhampore showroom — easy visit',
      'No licence models at current showroom prices',
      'EMI guidance at the counter',
      'Battery upgrades for extra Murshidabad range',
    ],
  }),
  buildLocation({
    slug: 'lalbagh',
    name: 'Murshidabad (Lalbagh)',
    titleName: 'Murshidabad / Lalbagh',
    title: 'Electric Scooters in Murshidabad / Lalbagh | Biswajit Power Hub',
    description:
      'Electric scooters for Murshidabad town & Lalbagh riders. No licence models, free test ride at Biswajit Power Hub, Chunakhali Berhampore. Call 096355 05436.',
    h1: 'Electric Scooters for Murshidabad (Lalbagh) — Visit Berhampore',
    intro:
      'Commuters around Murshidabad town and Lalbagh choose Biswajit Power Hub for Zoom and Activa daily rides, honest on-road pricing, and after-sales support you can walk into at Chunakhali.',
    localNote:
      'Lalbagh–Berhampore daily riders often prefer Zoom for a premium commute feel, or Activa when they want more range between charges. Bring your route questions — we match battery packs to real Murshidabad kilometres.',
    distanceHint: 'Short hop from Lalbagh / Murshidabad town to Chunakhali Bus Stand',
    nearby: ['berhampore', 'cossimbazar', 'jiaganj', 'azimganj', 'daulatabad'],
    faqs: [
      {
        question: 'Which model suits Lalbagh / Murshidabad town commutes?',
        answer:
          'Zoom is a favourite for a premium daily commute feel. Activa suits riders who want more range. Test both free at our Berhampore showroom.',
      },
      {
        question: 'Can I service my scooter after buying?',
        answer:
          'Yes — every purchase includes 3 free servicing visits. Walk-in support for batteries, controllers, tyres, and panels at Chunakhali.',
      },
    ],
    highlights: [
      'Ideal for Lalbagh–Berhampore daily riders',
      'EMI guidance with transparent slabs',
      'Google-reviewed local dealership',
      'Maps pin: BISWAJIT POWER HUB, Chunakhali',
    ],
  }),
  buildLocation({
    slug: 'jiaganj',
    name: 'Jiaganj',
    title: 'Electric Scooters in Jiaganj | Dealer Near Azimganj',
    description:
      'Electric scooters for Jiaganj riders. No licence EVs from Biswajit Power Hub, Berhampore. Test ride at Chunakhali. Call 096355 05436.',
    h1: 'Electric Scooters for Jiaganj — Visit Berhampore Showroom',
    intro:
      'Looking for an electric scooter dealer serving Jiaganj? Biswajit Power Hub stocks Activa, Zoom, Single Light, and Double Light at Chunakhali, Berhampore — with free test rides and clear EMI.',
    localNote:
      'Jiaganj customers often travel with family to compare colours and battery options in one visit. Call ahead on 096355 05436 so we can keep your preferred model ready for a test ride.',
    distanceHint: 'Convenient for Jiaganj families travelling to Berhampore',
    nearby: ['azimganj', 'lalbagh', 'berhampore', 'bhagawangola', 'lalgola'],
    faqs: [
      {
        question: 'Is there an EV showroom in Jiaganj?',
        answer:
          'Our physical showroom is at Chunakhali Bus Stand, Berhampore. Jiaganj customers regularly visit for test rides, battery upgrades, and servicing.',
      },
      {
        question: 'Can I ride without a licence from Jiaganj?',
        answer:
          'Eligible low-speed models (≤25 km/h) generally need no driving licence and no RTO registration in West Bengal. Our team explains the rules in plain language.',
      },
    ],
    highlights: [
      'Trusted by riders across north Murshidabad',
      'Genuine spare parts & walk-in servicing',
      'Free supervised test rides — no appointment needed',
      'WhatsApp 096355 05436 for stock before you travel',
    ],
  }),
  buildLocation({
    slug: 'azimganj',
    name: 'Azimganj',
    distanceHint: 'Convenient for Azimganj riders travelling via Jiaganj to Berhampore',
    nearby: ['jiaganj', 'lalbagh', 'berhampore', 'lalgola', 'bhagawangola'],
    intro:
      'Azimganj buyers looking for a trusted electric scooter dealer visit Biswajit Power Hub at Chunakhali, Berhampore for no-licence models, EMI options, and free test rides.',
    localNote:
      'Azimganj routes can be longer than short Berhampore town hops — ask about higher-AH packs or Lithium Pro options on eligible models so one charge covers your usual week.',
    faqs: [
      {
        question: 'Do you serve Azimganj customers?',
        answer:
          'Yes. Plan a visit to Chunakhali Bus Stand, Berhampore — many Azimganj and Jiaganj families buy and service here. Call 096355 05436 before you travel.',
      },
      {
        question: 'Are battery upgrades available for Azimganj routes?',
        answer:
          'Yes — higher-AH packs and Lithium Pro options on eligible models help with longer north Murshidabad rides.',
      },
    ],
    highlights: [
      'Serving Azimganj & Jiaganj corridor',
      'Range-focused battery advice',
      'No licence on eligible low-speed models',
      'Showroom support after purchase',
    ],
  }),
  buildLocation({
    slug: 'raninagar',
    name: 'Raninagar',
    distanceHint: 'Serving Raninagar riders who prefer a verified Berhampore showroom',
    nearby: ['domkal', 'berhampore', 'beldanga', 'hariharpara', 'lalbagh'],
    intro:
      'Raninagar families switching from petrol visit Biswajit Power Hub for low-speed electric scooters, home charging savings, and honest pricing at Chunakhali, Berhampore.',
    localNote:
      'Raninagar buyers often want simple ownership — no licence paperwork on eligible models, home charging, and a showroom they can return to for free servicing visits.',
    faqs: [
      {
        question: 'Is it worth travelling from Raninagar to Berhampore?',
        answer:
          'Yes if you want a physical test ride, transparent pricing, and after-sales at one place. Call 096355 05436 to confirm stock so the trip is worthwhile.',
      },
      {
        question: 'What is a good starter scooter for Raninagar?',
        answer:
          'Single Light and Double Light are popular budget starters. Zoom and Activa suit riders who want a more premium daily feel or more range.',
      },
    ],
    highlights: [
      'Petrol-to-EV switch guidance',
      'Home charging cost clarity',
      'EMI options at the counter',
      '3 free servicing included',
    ],
  }),
  buildLocation({
    slug: 'beldanga',
    name: 'Beldanga',
    title: 'Electric Scooters in Beldanga | Biswajit Power Hub',
    description:
      'Electric scooters near Beldanga, Murshidabad. Low-speed no-licence models at Biswajit Power Hub, Berhampore. Live showroom prices. Call 096355 05436.',
    h1: 'Electric Scooters for Beldanga — Low-Speed EVs from Berhampore',
    intro:
      'Beldanga riders switching from petrol visit Biswajit Power Hub for affordable electric scooters, home charging savings, and a real showroom experience at Chunakhali Bus Stand, Berhampore.',
    localNote:
      'The Berhampore–Beldanga corridor is a common daily route. We help Beldanga buyers pick battery packs that match market days and school runs — not just brochure range numbers.',
    distanceHint: 'South Murshidabad access via Berhampore–Beldanga corridor',
    nearby: ['berhampore', 'hariharpara', 'nabagram', 'daulatabad', 'domkal'],
    faqs: [
      {
        question: 'What is the cheapest electric scooter for Beldanga buyers?',
        answer:
          'Single Light is usually the entry option; Double Light, Zoom, and Activa step up from there depending on battery pack. Ask about today’s prices and EMI at the counter.',
      },
      {
        question: 'Do you offer battery upgrades for Beldanga customers?',
        answer:
          'Yes — custom higher-AH packs and Lithium Pro options on eligible models. Bring your scooter or buy new with the right pack from day one.',
      },
    ],
    highlights: [
      'Home charging ~₹0.30–₹0.50 per km vs petrol',
      'No licence paperwork on eligible models',
      'Showroom at Chunakhali Bus Stand, Berhampore',
      'Open all days 9:00 AM – 8:30 PM',
    ],
  }),
  buildLocation({
    slug: 'nabagram',
    name: 'Nabagram',
    distanceHint: 'Easy road access from Nabagram to Chunakhali, Berhampore',
    nearby: ['berhampore', 'beldanga', 'kandi', 'hariharpara', 'daulatabad'],
    intro:
      'Nabagram riders choose Biswajit Power Hub for no-licence electric scooters, free test rides, and walk-in support at Chunakhali Bus Stand, Berhampore.',
    localNote:
      'Nabagram customers often combine a showroom visit with battery and accessory questions in one trip. WhatsApp photos of your current scooter if you are upgrading packs later.',
    faqs: [
      {
        question: 'Do you stock spare parts for Nabagram customers?',
        answer:
          'Yes — batteries, tyres, panels, mirrors, and controllers. Visit Chunakhali or browse accessories online, then confirm fitment at the counter.',
      },
      {
        question: 'Can Nabagram buyers get EMI?',
        answer:
          'We guide EMI options with clear slabs at the showroom. Bring ID documents if you want finance discussed the same day.',
      },
    ],
    highlights: [
      'No licence ownership on eligible models',
      'Walk-in servicing after purchase',
      'Accessories & genuine spares',
      'Free test rides at Chunakhali',
    ],
  }),
  buildLocation({
    slug: 'hariharpara',
    name: 'Hariharpara',
    distanceHint: 'Serving Hariharpara customers travelling to Berhampore for purchase & service',
    nearby: ['beldanga', 'berhampore', 'domkal', 'raninagar', 'nabagram'],
    intro:
      'Looking for electric scooters near Hariharpara? Biswajit Power Hub in Berhampore stocks Activa, Zoom, Single Light, and Double Light with clear pricing and EMI.',
    localNote:
      'Hariharpara families often want a reliable daily scooter for local markets and Berhampore visits. We keep the buying process simple — test ride, price, EMI talk, then handover at Chunakhali.',
    faqs: [
      {
        question: 'How do I plan a visit from Hariharpara?',
        answer:
          'Call or WhatsApp 096355 05436 to confirm colours and battery options, then navigate to Chunakhali Bus Stand, Berhampore (BISWAJIT POWER HUB on Maps).',
      },
      {
        question: 'Do purchases include free servicing?',
        answer:
          'Yes — 3 free servicing visits plus 1 year motor & controller warranty on every purchase.',
      },
    ],
    highlights: [
      'Clear on-road pricing',
      'EMI guidance available',
      '3 free services included',
      'Trusted Murshidabad dealership',
    ],
  }),
  buildLocation({
    slug: 'chaltia-gora-bazar',
    name: 'Chaltia / Gora Bazar',
    titleName: 'Chaltia / Gora Bazar',
    title: 'Electric Scooters in Chaltia & Gora Bazar | Power Hub',
    description:
      'Electric scooters for Chaltia and Gora Bazar riders. No licence models at current showroom prices at Biswajit Power Hub, Chunakhali, Berhampore. Call 096355 05436.',
    distanceHint: 'Very close to Berhampore town — quick visit to Chunakhali Bus Stand',
    nearby: ['berhampore', 'cossimbazar', 'lalbagh', 'daulatabad'],
    intro:
      'Riders from Chaltia and Gora Bazar are just a short hop from Biswajit Power Hub at Chunakhali. Free test rides, no-licence models, and same-day guidance on EMI and batteries.',
    localNote:
      'Living near Gora Bazar or Chaltia means you can visit, compare models, and return for service without a long trip — many customers walk in after work hours before 8:30 PM.',
    faqs: [
      {
        question: 'How far is the showroom from Gora Bazar / Chaltia?',
        answer:
          'Chunakhali Bus Stand is a short local ride from Chaltia and Gora Bazar. Search BISWAJIT POWER HUB on Maps or call 096355 05436 for directions.',
      },
      {
        question: 'Can I walk in for a test ride?',
        answer:
          'Yes — free supervised test rides during showroom hours (9:00 AM – 8:30 PM, all days). No appointment required.',
      },
    ],
    highlights: [
      'Closest neighbourhoods to the showroom',
      'Same-day test ride & quote',
      'No licence on eligible models',
      'Evening visit friendly (open till 8:30 PM)',
    ],
  }),
  buildLocation({
    slug: 'daulatabad',
    name: 'Daulatabad',
    distanceHint: 'Serving Daulatabad riders with showroom access in Berhampore',
    nearby: ['berhampore', 'cossimbazar', 'lalbagh', 'nabagram', 'beldanga'],
    intro:
      'Daulatabad families buy low-speed electric scooters from Biswajit Power Hub for daily Murshidabad use — no licence on eligible models, EMI, and free test rides at Chunakhali.',
    localNote:
      'Daulatabad buyers often ask about running cost versus petrol. Home charging typically lands around ₹0.30–₹0.50 per km depending on pack and usage — we walk through that before you decide.',
    faqs: [
      {
        question: 'Will an electric scooter handle Daulatabad daily use?',
        answer:
          'Yes for typical town and Berhampore hops on low-speed models. Tell us your daily kilometres and we will recommend Standard vs higher-AH packs.',
      },
      {
        question: 'Do you help with first-time EV questions?',
        answer:
          'Absolutely — charging, licence rules for eligible models, EMI, and service schedule are explained in plain language at the showroom.',
      },
    ],
    highlights: [
      'First-time EV buyer friendly',
      'Running cost vs petrol explained',
      'EMI & free test rides',
      'After-sales at Chunakhali',
    ],
  }),
  buildLocation({
    slug: 'domkal',
    name: 'Domkal',
    title: 'Electric Scooters in Domkal | Biswajit Power Hub',
    description:
      'Buy electric scooters serving Domkal, Murshidabad. No licence EVs at current showroom prices at Biswajit Power Hub, Berhampore. Test ride today. Call 096355 05436.',
    h1: 'Electric Scooters for Domkal — Visit Our Berhampore Showroom',
    intro:
      'Domkal families looking for a trusted electric scooter dealer in Murshidabad can visit Biswajit Power Hub at Chunakhali, Berhampore for no-licence models, EMI, and free test rides.',
    localNote:
      'Domkal routes can stretch further than short town rides — ask about battery upgrades when you visit so your pack matches Domkal–Berhampore travel, not just brochure claims.',
    distanceHint: 'Serving Domkal riders who prefer a verified Berhampore showroom',
    nearby: ['raninagar', 'hariharpara', 'berhampore', 'beldanga', 'bhagawangola'],
    faqs: [
      {
        question: 'How do I reach the showroom from Domkal?',
        answer:
          'Navigate to Chunakhali Bus Stand, Nimtala, Berhampore on Google Maps (BISWAJIT POWER HUB). Call ahead on 096355 05436 to confirm colours and battery options.',
      },
      {
        question: 'Are spare parts available?',
        answer:
          'We stock batteries, tyres, body panels, mirrors, and controllers. Browse accessories online or ask at the counter during your visit.',
      },
    ],
    highlights: [
      'Four hero models with Standard and upgrade battery packs',
      'No licence / no registration on eligible units',
      'Custom battery upgrades for longer Domkal routes',
      'WhatsApp support before you travel',
    ],
  }),
  buildLocation({
    slug: 'lalgola',
    name: 'Lalgola',
    distanceHint: 'Serving Lalgola riders travelling to Berhampore for EV purchase & service',
    nearby: ['bhagawangola', 'jiaganj', 'azimganj', 'lalbagh', 'berhampore'],
    intro:
      'Lalgola buyers looking for a trusted Murshidabad EV dealer visit Biswajit Power Hub at Chunakhali, Berhampore for no-licence scooters, battery upgrades, and free test rides.',
    localNote:
      'Because Lalgola is farther from the showroom, we recommend calling before you travel. We confirm stock, colours, and battery options so one visit covers test ride and purchase decisions.',
    faqs: [
      {
        question: 'Do you help Lalgola customers with longer-range batteries?',
        answer:
          'Yes — ask about higher-AH packs and Lithium Pro options on eligible models before you buy, or book an upgrade later at Chunakhali.',
      },
      {
        question: 'Should I call before travelling from Lalgola?',
        answer:
          'Please do — WhatsApp or call 096355 05436 to confirm stock, colours, and battery options so your visit is worthwhile.',
      },
    ],
    highlights: [
      'Call-ahead stock confirmation',
      'Range-focused battery options',
      'No licence on eligible models',
      'Full showroom after-sales',
    ],
  }),
  buildLocation({
    slug: 'kandi',
    name: 'Kandi',
    title: 'Electric Scooters in Kandi | Biswajit Power Hub Berhampore',
    description:
      'Buy electric scooters near Kandi, Murshidabad. No licence models at current showroom prices. Free test ride at Biswajit Power Hub, Chunakhali, Berhampore. Call 096355 05436.',
    h1: 'Electric Scooters for Kandi & Murshidabad — Showroom in Berhampore',
    intro:
      'Riders from Kandi choose Biswajit Power Hub in Berhampore for low-speed electric scooters with no licence, honest pricing, and free test rides at Chunakhali Bus Stand — about a short drive from Kandi town.',
    localNote:
      'Kandi–Berhampore trips favour Activa and Zoom for many riders. Shorter Kandi town runs often suit Single Light or Double Light — test both styles when you visit.',
    distanceHint: 'Easy road access from Kandi to our Chunakhali showroom in Berhampore',
    nearby: ['nabagram', 'berhampore', 'beldanga', 'hariharpara'],
    faqs: [
      {
        question: 'Do you deliver electric scooters to Kandi?',
        answer:
          'Visit our showroom at Chunakhali Bus Stand, Berhampore for purchase, paperwork guidance, and handover. Call 096355 05436 to confirm stock and plan your visit from Kandi.',
      },
      {
        question: 'Which scooter is best for Kandi–Berhampore trips?',
        answer:
          'Activa and Zoom are popular for longer Murshidabad routes. Single Light and Double Light suit shorter Kandi town runs. Book a free test ride to compare.',
      },
    ],
    highlights: [
      'No licence / no RTO on eligible low-speed models',
      'Current showroom prices with EMI options',
      'Custom battery upgrades for Kandi–Berhampore range needs',
      '3 free servicing + 1 year motor & controller warranty',
    ],
  }),
  buildLocation({
    slug: 'bhagawangola',
    name: 'Bhagawangola',
    distanceHint: 'Serving Bhagawangola riders with showroom access in Berhampore',
    nearby: ['lalgola', 'jiaganj', 'azimganj', 'lalbagh', 'berhampore'],
    intro:
      'Bhagawangola families choose Biswajit Power Hub for affordable electric scooters, no-licence ownership on eligible models, and after-sales support at Chunakhali, Berhampore.',
    localNote:
      'Bhagawangola customers often want a dependable family scooter with simple charging at home. We explain ownership rules for eligible low-speed models and schedule free service visits after purchase.',
    faqs: [
      {
        question: 'Do you serve Bhagawangola for sales and service?',
        answer:
          'Yes — purchase and servicing happen at Chunakhali Bus Stand, Berhampore. Call 096355 05436 to plan your visit from Bhagawangola.',
      },
      {
        question: 'What warranty do I get?',
        answer:
          '1 year motor & controller warranty plus 3 free servicing visits with every purchase. Details are confirmed at the counter for your model and battery pack.',
      },
    ],
    highlights: [
      'Family-friendly EV options',
      'No licence on eligible models',
      'Warranty + 3 free services',
      'WhatsApp support before travel',
    ],
  }),
];

export function getLocationBySlug(slug) {
  return SERVICE_LOCATIONS.find((l) => l.slug === slug) || null;
}

export function getLocationByPath(path) {
  return SERVICE_LOCATIONS.find((l) => l.path === path) || null;
}

/** Footer / schema helper — display names in coverage order */
export function getServiceAreaNames() {
  return SERVICE_LOCATIONS.map((l) => l.name);
}

/** Priority towns for hub pages / footer teasers */
export const PRIORITY_LOCATION_SLUGS = [
  'berhampore',
  'cossimbazar',
  'lalbagh',
  'jiaganj',
  'beldanga',
  'kandi',
  'domkal',
];

export function getPriorityLocations() {
  return PRIORITY_LOCATION_SLUGS.map((slug) => getLocationBySlug(slug)).filter(Boolean);
}

export function getNearbyLocations(location, limit = 5) {
  const slugs = location?.nearby || [];
  return slugs
    .map((slug) => getLocationBySlug(slug))
    .filter((l) => l && l.slug !== location.slug)
    .slice(0, limit);
}
