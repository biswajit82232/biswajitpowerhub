-- Reset scooter catalog: one listing per model with Standard / Lithium Pro variants.
-- Removes legacy duplicate entries (e.g. "Single Light Standard", "Single Light Lithium Pro").

alter table public.scooters
  add column if not exists variants jsonb default '[]'::jsonb;

delete from public.scooters;

insert into public.scooters
  (id, name, brand, tagline, price, hue, battery_type, battery_capacity, range_km,
   real_range_factor, top_speed, charging_time, warranty, motor, weight, load_capacity,
   colors, stock_status, featured, description, features, benefits, variants)
values
  ('single-light', 'Single Light', 'PowerHub', 'Compact, budget-friendly city runabout', 43000, 'blue',
   'Standard battery', '48V / 24Ah', 50, 0.82, 25, '4–5 hrs', '2 years', '250W BLDC Hub Motor', '58 kg', '130 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Single Light is our most accessible model — perfect for short daily hops, school drops, and market runs. Lightweight and easy to handle in narrow lanes, with a choice of Standard or Lithium Pro battery.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":43000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":50},{"id":"lithium-pro","name":"Lithium Pro","price":55000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":65}]'),

  ('double-light', 'Double Light', 'PowerHub', 'Everyday errands, extra comfort', 45000, 'teal',
   'Standard battery', '48V / 24Ah', 60, 0.82, 25, '4–5 hrs', '2 years', '250W BLDC Hub Motor', '65 kg', '140 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Double Light balances comfort and practicality for daily shop runs and town commutes. Generous range on both battery options, with a planted ride that replaces petrol scooters effortlessly.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":45000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":60},{"id":"lithium-pro","name":"Lithium Pro","price":57000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":75}]'),

  ('activa', 'Activa', 'PowerHub', 'Long-range comfort for longer trips', 58000, 'green',
   'Standard battery', '48V / 24Ah', 80, 0.82, 25, '5–6 hrs', '3 years', '250W BLDC Hub Motor', '72 kg', '150 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Activa is built for riders who need serious range — Berhampore to Kandi and back on a single charge. Spacious, comfortable, and dependable, with Standard or Lithium Pro batteries to match your daily distance.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":58000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":80},{"id":"lithium-pro","name":"Lithium Pro","price":70000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":95}]'),

  ('zoom', 'Zoom', 'PowerHub', 'Premium pickup, smooth daily commute', 63000, 'indigo',
   'Standard battery', '48V / 24Ah', 70, 0.82, 25, '5–6 hrs', '3 years', '250W BLDC Hub Motor', '75 kg', '155 kg',
   '["Pearl White","Matte Black","Sky Blue"]', 'in_stock', true,
   'The Zoom delivers a premium ride feel with strong pickup and smooth handling for office commutes and longer daily runs. Choose Standard for value or Lithium Pro for maximum range and battery life.',
   '["LED headlamp & tail lamp","Digital LCD console","Regenerative braking","Side-stand motor cut-off","Comfortable wide seat","Home charging from any 5A socket"]',
   '["No licence required for eligible riders","No registration paperwork","Two battery options — pick what fits your budget","Low running cost vs petrol"]',
   '[{"id":"standard","name":"Standard","price":63000,"batteryType":"Standard battery","batteryCapacity":"48V / 24Ah","range":70},{"id":"lithium-pro","name":"Lithium Pro","price":75000,"batteryType":"Lithium Pro battery","batteryCapacity":"48V / 40Ah","range":85}]');
