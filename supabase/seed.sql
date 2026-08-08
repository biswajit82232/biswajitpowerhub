-- ============================================================================
-- BISWAJIT POWER HUB — seed data
-- Run AFTER schema.sql. Mirrors src/data/scooters.js & src/data/reviews.js.
-- ============================================================================

insert into public.scooters
  (id, name, brand, tagline, price, hue, battery_type, battery_capacity, range_km,
   real_range_factor, top_speed, charging_time, warranty, motor, weight, load_capacity,
   colors, stock_status, featured, description, features, benefits, variants)
values
  ('single-light', 'Single Light', 'PowerHub', 'Compact, budget-friendly city runabout', 43000, 'blue',
   'Standard battery', '48V / 24Ah', 50, 0.82, 25, '4–5 hrs', '2 years', '250W BLDC Hub Motor', '58 kg', '130 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Single Light is our most accessible model — perfect for short daily hops, school drops, and market runs.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":43000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":50},{"id":"lithium-pro","name":"Lithium Pro","price":55000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":65}]'),

  ('double-light', 'Double Light', 'PowerHub', 'Everyday errands, extra comfort', 45000, 'teal',
   'Standard battery', '48V / 24Ah', 60, 0.82, 25, '4–5 hrs', '2 years', '250W BLDC Hub Motor', '65 kg', '140 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Double Light balances comfort and practicality for daily shop runs and town commutes.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":45000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":60},{"id":"lithium-pro","name":"Lithium Pro","price":57000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":75}]'),

  ('activa', 'Activa', 'PowerHub', 'Long-range comfort for longer trips', 58000, 'green',
   'Standard battery', '48V / 24Ah', 80, 0.82, 25, '5–6 hrs', '3 years', '250W BLDC Hub Motor', '72 kg', '150 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Activa is built for riders who need serious range — Berhampore to Kandi and back on a single charge.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":58000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":80},{"id":"lithium-pro","name":"Lithium Pro","price":70000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":95}]'),

  ('zoom', 'Zoom', 'PowerHub', 'Premium pickup, smooth daily commute', 63000, 'indigo',
   'Standard battery', '48V / 24Ah', 70, 0.82, 25, '5–6 hrs', '3 years', '250W BLDC Hub Motor', '75 kg', '155 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Zoom delivers a premium ride feel with strong pickup and smooth handling for office commutes.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":63000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":70},{"id":"lithium-pro","name":"Lithium Pro","price":75000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":120}]')

on conflict (id) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  price = excluded.price,
  hue = excluded.hue,
  battery_type = excluded.battery_type,
  battery_capacity = excluded.battery_capacity,
  range_km = excluded.range_km,
  charging_time = excluded.charging_time,
  warranty = excluded.warranty,
  weight = excluded.weight,
  load_capacity = excluded.load_capacity,
  featured = excluded.featured,
  description = excluded.description,
  features = excluded.features,
  benefits = excluded.benefits,
  variants = excluded.variants;

insert into public.reviews (name, rating, review, scooter, status, featured) values
  ('Subhankar Das',5,'Needed good range for Berhampore to Kandi trips. Went with the Activa — easily 80 km on one charge if you don''t throttle hard. Team explained EMI clearly, no surprise fees at delivery.','Activa','approved',true),
  ('Riya Saha',5,'My first electric scooter. Single Light fit our budget at ₹42,999 and 50 km is more than enough for school drop and market — maybe 18 km daily. Plug in at night, done.','Single Light','approved',true),
  ('Amit Pramanik',4,'Double Light replaced my old petrol scooter. Getting 55–60 km regularly, running cost is peanuts. Minus one star only because I wanted a longer charging cable — otherwise showroom was very helpful.','Double Light','approved',false),
  ('Moumita Ghosh',5,'Went with the Activa Lithium Pro for long trips towards Murshidabad — got close to 95 km on a careful run. Feels planted and worth the upgrade if you travel far often.','Activa','approved',true),
  ('Sayan Mondal',5,'Test rode Activa and Zoom before deciding. Zoom felt best for my daily Lalbagh office run — 70 km range on Standard, smooth pickup. Staff never rushed us, answered every silly question.','Zoom','approved',false),
  ('Priya Banerjee',5,'Took the Zoom Lithium Pro — looks premium and rides quiet. We worked out fuel vs electric: husband''s bike was ₹70–80/day, this is maybe ₹15–20 charging at home. Very happy with the purchase.','Zoom','approved',true),
  ('Arindam Roy',5,'Bought Double Light for shop errands around town. Light, easy in narrow lanes, 60 km is plenty for the whole day. Honest pricing at Biswajit Power Hub — already sent two neighbours here.','Double Light','approved',false)
on conflict do nothing;
