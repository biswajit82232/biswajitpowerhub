-- Explore Range category tags (admin-controlled; replaces price-threshold heuristic)
alter table public.scooters
  add column if not exists is_budget boolean default false,
  add column if not exists is_premium boolean default false;

-- Backfill from listing price (Standard / starting price)
update public.scooters
set is_budget = true
where coalesce(is_budget, false) = false
  and price < 45000;

update public.scooters
set is_premium = true
where coalesce(is_premium, false) = false
  and price >= 45000;
