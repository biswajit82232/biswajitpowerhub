-- Refresh seed reviews with real product names and human-like copy.
-- Safe to re-run: updates by reviewer name only.

update public.reviews set
  review = 'Needed good range for Berhampore to Kandi trips. Went with the Activa — easily 80 km on one charge if you don''t throttle hard. Team explained EMI clearly, no surprise fees at delivery.',
  scooter = 'Activa'
where name = 'Subhankar Das';

update public.reviews set
  review = 'My first electric scooter. Single Light fit our budget at ₹42,999 and 50 km is more than enough for school drop and market — maybe 18 km daily. Plug in at night, done.',
  scooter = 'Single Light'
where name = 'Riya Saha';

update public.reviews set
  review = 'Dubble Light replaced my old petrol scooter. Getting 55–60 km regularly, running cost is peanuts. Minus one star only because I wanted a longer charging cable — otherwise showroom was very helpful.',
  scooter = 'Dubble Light'
where name = 'Amit Pramanik';

update public.reviews set
  review = 'Ceeon BMW range is serious — they claim 120 km and I got close on a long run towards Murshidabad and back. Feels planted on highway stretches. Worth the ₹75,000 if you travel far often.',
  scooter = 'Ceeon BMW'
where name = 'Moumita Ghosh';

update public.reviews set
  review = 'Test rode Activa, OLA and Zoom before deciding. Zoom felt best for my daily Lalbagh office run — 70 km range, smooth pickup. Staff never rushed us, answered every silly question.',
  scooter = 'Zoom'
where name = 'Sayan Mondal';

update public.reviews set
  review = 'Took the OLA — looks premium and rides quiet. We worked out fuel vs electric: husband''s bike was ₹70–80/day, this is maybe ₹15–20 charging at home. Very happy with the purchase.',
  scooter = 'OLA'
where name = 'Priya Banerjee';

update public.reviews set
  review = 'Bought Dubble Light for shop errands around town. Light, easy in narrow lanes, 60 km is plenty for the whole day. Honest pricing at Biswajit Power Hub — already sent two neighbours here.',
  scooter = 'Dubble Light'
where name = 'Arindam Roy';
