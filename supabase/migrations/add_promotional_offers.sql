-- Promotional offers — run in Supabase SQL editor
create table if not exists public.promotional_offers (
  id              uuid primary key default gen_random_uuid(),
  title           text not null default '',
  discount_text   text not null default '',
  promo_code      text default '',
  description     text default '',
  active          boolean default true,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.promotional_offers enable row level security;

drop policy if exists "public read active offers" on public.promotional_offers;
create policy "public read active offers" on public.promotional_offers
  for select using (active = true);

drop policy if exists "auth all offers" on public.promotional_offers;
create policy "auth all offers" on public.promotional_offers
  for all to authenticated using (true) with check (true);

-- Admin needs to read inactive offers too
drop policy if exists "auth read all offers" on public.promotional_offers;
create policy "auth read all offers" on public.promotional_offers
  for select to authenticated using (true);
