-- Align review scooter names with current catalog (Single Light, Double Light, Activa, Zoom)

update public.reviews set
  review = 'Went with the Activa Lithium Pro for long trips towards Murshidabad — got close to 95 km on a careful run. Feels planted and worth the upgrade if you travel far often.',
  scooter = 'Activa'
where name = 'Moumita Ghosh';

update public.reviews set
  review = 'Test rode Activa and Zoom before deciding. Zoom felt best for my daily Lalbagh office run — 70 km range on Standard, smooth pickup. Staff never rushed us, answered every silly question.',
  scooter = 'Zoom'
where name = 'Sayan Mondal';

update public.reviews set
  review = 'Took the Zoom Lithium Pro — looks premium and rides quiet. We worked out fuel vs electric: husband''s bike was ₹70–80/day, this is maybe ₹15–20 charging at home. Very happy with the purchase.',
  scooter = 'Zoom'
where name = 'Priya Banerjee';
