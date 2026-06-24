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
      'Bought the Urban Pro for my daily commute to Berhampore market. Smooth ride, brilliant range, and zero paperwork. The team at BISWAJIT POWER HUB explained everything patiently.',
    scooter: 'Urban Pro',
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
      'My first electric scooter — the Breeze X. Love the storage and the colour. Charging at home is so convenient and cheap. Highly recommend this showroom.',
    scooter: 'Breeze X',
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
      'Great value with the Spark Lite. Running cost is almost nothing compared to my old petrol scooter. Service support has been prompt.',
    scooter: 'Spark Lite',
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
      'The Thunder GT is a beast for a no-licence scooter. The twin battery means I never worry about range. Worth every rupee.',
    scooter: 'Thunder GT',
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
      'Test rode three models and the staff were never pushy. Ended up with the Metro Eco for my daughter. Excellent first-time buyer experience.',
    scooter: 'Metro Eco',
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
      'Switched from petrol to the Spark Lite — my monthly fuel bill dropped to almost nothing. The showroom team helped with home charging setup too.',
    scooter: 'Spark Lite',
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
      'Honest pricing, no hidden charges. The Urban Pro handles Berhampore roads beautifully. Already recommended to two neighbours.',
    scooter: 'Urban Pro',
    photo: avatar('arindam-roy'),
    status: 'approved',
    featured: false,
    created_at: '2025-09-05T10:00:00Z',
  },
];
