-- ============================================================================
-- BISWAJIT POWER HUB — seed data
-- Run AFTER schema.sql. Mirrors src/data/scooters.js & src/data/reviews.js.
-- ============================================================================

insert into public.scooters
  (id, name, brand, tagline, price, hue, battery_type, battery_capacity, range_km,
   real_range_factor, top_speed, charging_time, warranty, motor, weight, load_capacity,
   colors, stock_status, featured, description, features, benefits)
values
  ('spark-lite','Spark Lite','PowerHub','The everyday city companion',64999,'blue',
   'Lithium-ion (LFP)','1.8 kWh',70,0.82,25,'4–5 hrs','3 years / 30,000 km','250W BLDC Hub Motor','68 kg','150 kg',
   '["Pearl White","Sky Blue","Matte Grey"]','in_stock',true,
   'The Spark Lite is built for effortless daily commutes. Lightweight, nimble and whisper-quiet, it slips through city traffic while sipping power.',
   '["Keyless smart unlock","Regenerative braking","LED headlamp & DRL","Digital LCD console","USB charging port","Anti-theft alarm"]',
   '["No licence required for eligible riders","No registration paperwork","Charge at home from any 5A socket","Running cost under Rs.0.20 / km"]'),

  ('urban-pro','Urban Pro','PowerHub','Premium range, premium ride',84999,'teal',
   'Lithium-ion (NMC)','2.5 kWh',110,0.84,25,'4–6 hrs','3 years / 40,000 km','250W BLDC Hub Motor','79 kg','160 kg',
   '["Midnight Teal","Pearl White","Crimson"]','in_stock',true,
   'The Urban Pro delivers class-leading range with a refined, planted ride quality.',
   '["Removable battery pack","TFT colour display","Cruise control","Tubeless tyres","Front & rear disc brakes","Mobile app connectivity"]',
   '["Longest range in its class","Swap & charge battery indoors","No licence or registration*","Lower lifetime cost than petrol"]'),

  ('breeze-x','Breeze X','PowerHub','Style that turns heads',72999,'sky',
   'Lithium-ion (LFP)','2.0 kWh',85,0.83,25,'4–5 hrs','3 years / 35,000 km','250W BLDC Hub Motor','72 kg','155 kg',
   '["Ocean Blue","Sunset Orange","Graphite"]','low_stock',true,
   'The Breeze X blends a sculpted, contemporary design with practical range.',
   '["Under-seat storage (28L)","LED indicators","Reverse assist mode","Digital anti-theft lock","Side-stand motor cut-off","Fast charger compatible"]',
   '["Spacious storage for daily errands","Eye-catching colour options","No licence or registration*","Home charging convenience"]'),

  ('metro-eco','Metro Eco','PowerHub','Smart savings, smart city',56999,'green',
   'Lithium-ion (LFP)','1.5 kWh',60,0.80,25,'3–4 hrs','2 years / 25,000 km','250W BLDC Hub Motor','62 kg','140 kg',
   '["Mint Green","Pearl White","Steel Grey"]','in_stock',false,
   'The Metro Eco is our most accessible model — a dependable, efficient ride for short city hops.',
   '["Lightweight frame","LED headlamp","Digital console","Low-maintenance design","Quick home charging","Comfortable wide seat"]',
   '["Best entry-level price","Fastest charging in range","No licence or registration*","Ideal first electric scooter"]'),

  ('thunder-gt','Thunder GT','PowerHub','Bold design, big range',94999,'indigo',
   'Lithium-ion (NMC)','2.8 kWh',120,0.85,25,'5–6 hrs','3 years / 45,000 km','250W BLDC Hub Motor','84 kg','170 kg',
   '["Storm Indigo","Jet Black","Pearl White"]','in_stock',true,
   'The Thunder GT is our flagship low-speed cruiser — premium materials, the longest range, and a commanding stance.',
   '["Dual removable batteries","Full LED lighting","TFT navigation display","Hill-hold assist","Premium leatherette seat","OTA software updates"]',
   '["Flagship comfort & range","Twin-battery flexibility","No licence or registration*","Future-ready connected features"]'),

  ('glide-mini','Glide Mini','PowerHub','Compact. Clever. Capable.',49999,'cyan',
   'Lithium-ion (LFP)','1.2 kWh',50,0.80,25,'3 hrs','2 years / 20,000 km','250W BLDC Hub Motor','55 kg','130 kg',
   '["Coral","Sky Blue","Ivory"]','out_of_stock',false,
   'The Glide Mini is a featherweight, fuss-free scooter perfect for tight lanes and quick errands.',
   '["Ultra-compact footprint","Foldable mirrors","LED tail lamp","Easy-grip handlebar","Portable charger","Low step-through frame"]',
   '["Most affordable model","Effortless to handle","No licence or registration*","Charges in just 3 hours"]')
on conflict (id) do nothing;

insert into public.reviews (name, rating, review, scooter, status, featured) values
  ('Subhankar Das',5,'Bought the Urban Pro for my daily commute to Berhampore market. Smooth ride, brilliant range, and zero paperwork. The team explained everything patiently.','Urban Pro','approved',true),
  ('Riya Saha',5,'My first electric scooter — the Breeze X. Love the storage and the colour. Charging at home is so convenient and cheap. Highly recommend this showroom.','Breeze X','approved',true),
  ('Amit Pramanik',4,'Great value with the Spark Lite. Running cost is almost nothing compared to my old petrol scooter. Service support has been prompt.','Spark Lite','approved',false),
  ('Moumita Ghosh',5,'The Thunder GT is a beast for a no-licence scooter. The twin battery means I never worry about range. Worth every rupee.','Thunder GT','approved',true),
  ('Sayan Mondal',5,'Test rode three models and the staff were never pushy. Ended up with the Metro Eco for my daughter. Excellent first-time buyer experience.','Metro Eco','approved',false);
