-- Service booking requests (free 1st/2nd/3rd servicing + paid work)
create table if not exists public.service_bookings (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null,
  service_kind    text not null check (service_kind in ('free_1', 'free_2', 'free_3', 'paid')),
  details         text,
  scooter         text,
  scooter_id      text,
  preferred_date  date,
  preferred_time  text,
  visitor_id      text,
  status          text default 'requested',
  created_at      timestamptz default now()
);

alter table public.service_bookings enable row level security;

drop policy if exists "anon insert service_bookings" on public.service_bookings;
create policy "anon insert service_bookings"
  on public.service_bookings for insert
  with check (true);

drop policy if exists "auth all service_bookings" on public.service_bookings;
create policy "auth all service_bookings"
  on public.service_bookings for all to authenticated
  using (true) with check (true);

create index if not exists service_bookings_created_at_idx
  on public.service_bookings (created_at desc);
