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
  ('Subhankar Das',5,'Needed good range for Berhampore to Kandi trips. Went with the Activa — easily 80 km on one charge if you don''t throttle hard. Team explained EMI clearly, no surprise fees at delivery.','Activa','approved',true),
  ('Riya Saha',5,'My first electric scooter. Single Light fit our budget at ₹42,999 and 50 km is more than enough for school drop and market — maybe 18 km daily. Plug in at night, done.','Single Light','approved',true),
  ('Amit Pramanik',4,'Dubble Light replaced my old petrol scooter. Getting 55–60 km regularly, running cost is peanuts. Minus one star only because I wanted a longer charging cable — otherwise showroom was very helpful.','Dubble Light','approved',false),
  ('Moumita Ghosh',5,'Ceeon BMW range is serious — they claim 120 km and I got close on a long run towards Murshidabad and back. Feels planted on highway stretches. Worth the ₹75,000 if you travel far often.','Ceeon BMW','approved',true),
  ('Sayan Mondal',5,'Test rode Activa, OLA and Zoom before deciding. Zoom felt best for my daily Lalbagh office run — 70 km range, smooth pickup. Staff never rushed us, answered every silly question.','Zoom','approved',false),
  ('Priya Banerjee',5,'Took the OLA — looks premium and rides quiet. We worked out fuel vs electric: husband''s bike was ₹70–80/day, this is maybe ₹15–20 charging at home. Very happy with the purchase.','OLA','approved',true),
  ('Arindam Roy',5,'Bought Dubble Light for shop errands around town. Light, easy in narrow lanes, 60 km is plenty for the whole day. Honest pricing at Biswajit Power Hub — already sent two neighbours here.','Dubble Light','approved',false);
