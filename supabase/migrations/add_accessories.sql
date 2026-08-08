-- Accessories & parts catalog — run in Supabase SQL editor
create table if not exists public.accessories (
  id              text primary key,
  name            text not null,
  category        text not null default 'Other',
  price           numeric not null default 0,
  hue             text default 'teal',
  images          jsonb default '[]'::jsonb,
  description     text,
  compatibility   text,
  stock_status    text default 'in_stock',
  featured        boolean default false,
  created_at      timestamptz default now()
);

alter table public.accessories enable row level security;

drop policy if exists "public read accessories" on public.accessories;
create policy "public read accessories" on public.accessories
  for select using (true);

drop policy if exists "auth all accessories" on public.accessories;
create policy "auth all accessories" on public.accessories
  for all to authenticated using (true) with check (true);
