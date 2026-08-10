-- Vyapar online-store sync — cache + mapping into local scooters/accessories.
-- Local catalog remains source of truth for public site; sync only updates opted-in fields.

create table if not exists public.vyapar_settings (
  id                integer primary key default 1 check (id = 1),
  enabled           boolean not null default false,
  store_alias       text not null default 'biswajitpowerhub',
  catalogue_id      text not null default '3e564898280a1',
  sync_price        boolean not null default true,
  sync_stock        boolean not null default true,
  last_synced_at    timestamptz,
  last_sync_error   text,
  last_sync_count   integer default 0,
  updated_at        timestamptz default now()
);

insert into public.vyapar_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.vyapar_settings enable row level security;

-- Admin-only: do not expose sync config / notes / raw payloads publicly
drop policy if exists "public read vyapar_settings" on public.vyapar_settings;
drop policy if exists "auth read vyapar_settings" on public.vyapar_settings;
create policy "auth read vyapar_settings" on public.vyapar_settings
  for select to authenticated using (true);

drop policy if exists "auth all vyapar_settings" on public.vyapar_settings;
create policy "auth all vyapar_settings" on public.vyapar_settings
  for all to authenticated using (true) with check (true);

create table if not exists public.vyapar_items (
  id                    text primary key,
  catalogue_id          text not null,
  vyapar_item_id        integer,
  name                  text not null,
  display_name          text,
  description           text default '',
  category_vyapar       jsonb default '[]'::jsonb,
  mapped_category       text,
  mapped_type           text check (mapped_type is null or mapped_type in ('scooter', 'accessory')),
  mapped_id             text,
  linked                boolean not null default false,
  sync_price            boolean not null default true,
  sync_stock            boolean not null default true,
  price                 numeric not null default 0,
  discounted_price      numeric,
  quantity              numeric default 0,
  unit                  text default 'Nos',
  stock_flag            boolean default true,
  image_folder          text,
  local_images          jsonb default '[]'::jsonb,
  notes                 text default '',
  raw                   jsonb default '{}'::jsonb,
  last_seen_at          timestamptz default now(),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists vyapar_items_mapped_idx
  on public.vyapar_items (mapped_type, mapped_id)
  where mapped_id is not null;

create index if not exists vyapar_items_catalogue_idx
  on public.vyapar_items (catalogue_id);

alter table public.vyapar_items enable row level security;

drop policy if exists "public read vyapar_items" on public.vyapar_items;
drop policy if exists "auth read vyapar_items" on public.vyapar_items;
create policy "auth read vyapar_items" on public.vyapar_items
  for select to authenticated using (true);

drop policy if exists "auth all vyapar_items" on public.vyapar_items;
create policy "auth all vyapar_items" on public.vyapar_items
  for all to authenticated using (true) with check (true);
