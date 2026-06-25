/**
 * Seed customer reviews — fallback/demo data and seed source for Supabase.
 * Photos are uploaded by customers via the review form (Supabase Storage).
 */
export const REVIEWS = [
  {
    id: 'r1',
    name: 'Subhankar Das',
    rating: 5,
    review:
      'Needed good range for Berhampore to Kandi trips. Went with the Activa — easily 80 km on one charge if you don’t throttle hard. Team explained EMI clearly, no surprise fees at delivery.',
    scooter: 'Activa',
    photo: '',
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
    photo: '',
    status: 'approved',
    featured: true,
    created_at: '2025-11-21T10:00:00Z',
  },
  {
    id: 'r3',
    name: 'Amit Pramanik',
    rating: 4,
    review:
      'Double Light replaced my old petrol scooter. Getting 55–60 km regularly, running cost is peanuts. Minus one star only because I wanted a longer charging cable — otherwise showroom was very helpful.',
    scooter: 'Double Light',
    photo: '',
    status: 'approved',
    featured: false,
    created_at: '2025-11-10T10:00:00Z',
  },
  {
    id: 'r4',
    name: 'Moumita Ghosh',
    rating: 5,
    review:
      'Went with the Activa Lithium Pro for long trips towards Murshidabad — got close to 95 km on a careful run. Feels planted and worth the upgrade if you travel far often.',
    scooter: 'Activa',
    photo: '',
    status: 'approved',
    featured: true,
    created_at: '2025-10-28T10:00:00Z',
  },
  {
    id: 'r5',
    name: 'Sayan Mondal',
    rating: 5,
    review:
      'Test rode Activa and Zoom before deciding. Zoom felt best for my daily Lalbagh office run — 70 km range on Standard, smooth pickup. Staff never rushed us, answered every silly question.',
    scooter: 'Zoom',
    photo: '',
    status: 'approved',
    featured: false,
    created_at: '2025-10-12T10:00:00Z',
  },
  {
    id: 'r6',
    name: 'Priya Banerjee',
    rating: 5,
    review:
      'Took the Zoom Lithium Pro — looks premium and rides quiet. We worked out fuel vs electric: husband’s bike was ₹70–80/day, this is maybe ₹15–20 charging at home. Very happy with the purchase.',
    scooter: 'Zoom',
    photo: '',
    status: 'approved',
    featured: true,
    created_at: '2025-09-18T10:00:00Z',
  },
  {
    id: 'r7',
    name: 'Arindam Roy',
    rating: 5,
    review:
      'Bought Double Light for shop errands around town. Light, easy in narrow lanes, 60 km is plenty for the whole day. Honest pricing at Biswajit Power Hub — already sent two neighbours here.',
    scooter: 'Double Light',
    photo: '',
    status: 'approved',
    featured: false,
    created_at: '2025-09-05T10:00:00Z',
  },
];
