/**
 * Seed customer reviews — fallback/demo data and seed source for Supabase.
 * Avatars via DiceBear (consistent per reviewer name).
 */
const avatar = (seed) =>
  `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(seed)}&size=128`;

export const REVIEWS = [
  {
    id: 'r1',
    name: 'Subhankar Das',
    rating: 5,
    review:
      'Needed good range for Berhampore to Kandi trips. Went with the Activa — easily 80 km on one charge if you don’t throttle hard. Team explained EMI clearly, no surprise fees at delivery.',
    scooter: 'Activa',
    photo: avatar('subhankar-das'),
    status: 'approved',
    featured: true,
    created_at: '2025-12-02T10:00:00Z',
  },
  {
    id: 'r2',
    name: 'Riya Saha',
    rating: 5,
    review:
      'My first electric scooter. Single Light fit our budget at ₹42,999 and 50 km is more than enough for school drop and market — maybe 18 km daily. Plug in at night, done.',
    scooter: 'Single Light',
    photo: avatar('riya-saha'),
    status: 'approved',
    featured: true,
    created_at: '2025-11-21T10:00:00Z',
  },
  {
    id: 'r3',
    name: 'Amit Pramanik',
    rating: 4,
    review:
      'Dubble Light replaced my old petrol scooter. Getting 55–60 km regularly, running cost is peanuts. Minus one star only because I wanted a longer charging cable — otherwise showroom was very helpful.',
    scooter: 'Dubble Light',
    photo: avatar('amit-pramanik'),
    status: 'approved',
    featured: false,
    created_at: '2025-11-10T10:00:00Z',
  },
  {
    id: 'r4',
    name: 'Moumita Ghosh',
    rating: 5,
    review:
      'Ceeon BMW range is serious — they claim 120 km and I got close on a long run towards Murshidabad and back. Feels planted on highway stretches. Worth the ₹75,000 if you travel far often.',
    scooter: 'Ceeon BMW',
    photo: avatar('moumita-ghosh'),
    status: 'approved',
    featured: true,
    created_at: '2025-10-28T10:00:00Z',
  },
  {
    id: 'r5',
    name: 'Sayan Mondal',
    rating: 5,
    review:
      'Test rode Activa, OLA and Zoom before deciding. Zoom felt best for my daily Lalbagh office run — 70 km range, smooth pickup. Staff never rushed us, answered every silly question.',
    scooter: 'Zoom',
    photo: avatar('sayan-mondal'),
    status: 'approved',
    featured: false,
    created_at: '2025-10-12T10:00:00Z',
  },
  {
    id: 'r6',
    name: 'Priya Banerjee',
    rating: 5,
    review:
      'Took the OLA — looks premium and rides quiet. We worked out fuel vs electric: husband’s bike was ₹70–80/day, this is maybe ₹15–20 charging at home. Very happy with the purchase.',
    scooter: 'OLA',
    photo: avatar('priya-banerjee'),
    status: 'approved',
    featured: true,
    created_at: '2025-09-18T10:00:00Z',
  },
  {
    id: 'r7',
    name: 'Arindam Roy',
    rating: 5,
    review:
      'Bought Dubble Light for shop errands around town. Light, easy in narrow lanes, 60 km is plenty for the whole day. Honest pricing at Biswajit Power Hub — already sent two neighbours here.',
    scooter: 'Dubble Light',
    photo: avatar('arindam-roy'),
    status: 'approved',
    featured: false,
    created_at: '2025-09-05T10:00:00Z',
  },
];
