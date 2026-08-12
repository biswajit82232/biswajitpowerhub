-- ============================================================================
-- Migration 27: Rate-limit public writes, admin-only push subs, review-photo
-- path prefix, analytics RPC grants, never-downgrade lead classification.
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Rate-limit helper + triggers (forms, reviews, lead_events)
-- ---------------------------------------------------------------------------
create index if not exists callbacks_visitor_created_idx
  on public.callbacks (visitor_id, created_at desc);
create index if not exists callbacks_created_at_idx
  on public.callbacks (created_at desc);
create index if not exists test_rides_visitor_created_idx
  on public.test_rides (visitor_id, created_at desc);
create index if not exists test_rides_created_at_idx
  on public.test_rides (created_at desc);
create index if not exists service_bookings_visitor_created_idx
  on public.service_bookings (visitor_id, created_at desc);
create index if not exists service_bookings_created_at_idx
  on public.service_bookings (created_at desc);
create index if not exists contact_messages_visitor_created_idx
  on public.contact_messages (visitor_id, created_at desc);
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
create index if not exists reviews_created_at_idx
  on public.reviews (created_at desc);
create index if not exists lead_events_visitor_created_idx
  on public.lead_events (visitor_id, created_at desc);
create index if not exists lead_events_created_at_idx
  on public.lead_events (created_at desc);

create or replace function public.assert_public_write_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vid text;
  recent_visitor int;
  recent_global int;
  visitor_window interval;
  global_cap int;
  global_window interval := interval '5 minutes';
begin
  vid := nullif(trim(coalesce(to_jsonb(NEW) ->> 'visitor_id', '')), '');

  if TG_TABLE_NAME = 'lead_events' then
    visitor_window := interval '10 seconds';
    global_cap := 200;
  elsif TG_TABLE_NAME = 'reviews' then
    visitor_window := interval '30 seconds';
    global_cap := 20;
  else
    visitor_window := interval '2 seconds';
    global_cap := 40;
  end if;

  if vid is not null and TG_TABLE_NAME <> 'reviews' then
    execute format(
      'select count(*) from public.%I where visitor_id = $1 and created_at > now() - $2',
      TG_TABLE_NAME
    )
    into recent_visitor
    using vid, visitor_window;

    if TG_TABLE_NAME = 'lead_events' then
      if coalesce(recent_visitor, 0) >= 15 then
        raise exception 'rate limited';
      end if;
    elsif coalesce(recent_visitor, 0) > 0 then
      raise exception 'rate limited';
    end if;
  end if;

  execute format(
    'select count(*) from public.%I where created_at > now() - $1',
    TG_TABLE_NAME
  )
  into recent_global
  using global_window;

  if coalesce(recent_global, 0) >= global_cap then
    raise exception 'rate limited';
  end if;

  return NEW;
end;
$$;

drop trigger if exists callbacks_write_rate on public.callbacks;
create trigger callbacks_write_rate
  before insert on public.callbacks
  for each row execute function public.assert_public_write_rate();

drop trigger if exists test_rides_write_rate on public.test_rides;
create trigger test_rides_write_rate
  before insert on public.test_rides
  for each row execute function public.assert_public_write_rate();

drop trigger if exists service_bookings_write_rate on public.service_bookings;
create trigger service_bookings_write_rate
  before insert on public.service_bookings
  for each row execute function public.assert_public_write_rate();

drop trigger if exists contact_messages_write_rate on public.contact_messages;
create trigger contact_messages_write_rate
  before insert on public.contact_messages
  for each row execute function public.assert_public_write_rate();

drop trigger if exists reviews_write_rate on public.reviews;
create trigger reviews_write_rate
  before insert on public.reviews
  for each row execute function public.assert_public_write_rate();

drop trigger if exists lead_events_write_rate on public.lead_events;
create trigger lead_events_write_rate
  before insert on public.lead_events
  for each row execute function public.assert_public_write_rate();

revoke all on function public.assert_public_write_rate() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. upsert_lead — never downgrade classification (hot > warm > cold)
-- ---------------------------------------------------------------------------
create or replace function public.upsert_lead(
  p_visitor_id text,
  p_name text,
  p_phone text,
  p_last_source text,
  p_interested_scooter text,
  p_score int,
  p_classification text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  new_leads_recent int;
begin
  if p_visitor_id is null or length(trim(p_visitor_id)) = 0 then
    raise exception 'visitor_id required';
  end if;

  if exists (
    select 1 from public.leads
    where visitor_id = p_visitor_id
      and updated_at > now() - interval '2 seconds'
  ) then
    return;
  end if;

  if not exists (select 1 from public.leads where visitor_id = p_visitor_id) then
    select count(*) into new_leads_recent
    from public.leads
    where created_at > now() - interval '5 minutes';
    if coalesce(new_leads_recent, 0) >= 40 then
      raise exception 'rate limited';
    end if;
  end if;

  insert into public.leads (
    visitor_id, name, phone, last_source, interested_scooter,
    score, classification, updated_at
  )
  values (
    p_visitor_id, p_name, p_phone, p_last_source, p_interested_scooter,
    coalesce(p_score, 0), coalesce(p_classification, 'cold'), now()
  )
  on conflict (visitor_id) do update set
    name = coalesce(excluded.name, leads.name),
    phone = coalesce(excluded.phone, leads.phone),
    last_source = excluded.last_source,
    interested_scooter = coalesce(excluded.interested_scooter, leads.interested_scooter),
    score = greatest(coalesce(leads.score, 0), coalesce(excluded.score, 0)),
    classification = case
      when leads.classification = 'hot' or excluded.classification = 'hot' then 'hot'
      when leads.classification = 'warm' or excluded.classification = 'warm' then 'warm'
      else coalesce(excluded.classification, leads.classification, 'cold')
    end,
    updated_at = now();
end;
$$;

revoke all on function public.upsert_lead(text, text, text, text, text, int, text) from public;
grant execute on function public.upsert_lead(text, text, text, text, text, int, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Push subscriptions — allowlisted admins only
-- ---------------------------------------------------------------------------
drop policy if exists "auth manage own push subs" on public.admin_push_subscriptions;
drop policy if exists "admin manage own push subs" on public.admin_push_subscriptions;
create policy "admin manage own push subs"
  on public.admin_push_subscriptions
  for all to authenticated
  using (public.is_admin() and auth.uid() = user_id)
  with check (public.is_admin() and auth.uid() = user_id);

create or replace function public.list_admin_push_subscriptions()
returns table (id uuid, endpoint text, p256dh text, auth text)
language sql
security definer
set search_path = public
as $$
  select s.id, s.endpoint, s.p256dh, s.auth
  from public.admin_push_subscriptions s
  join auth.users u on u.id = s.user_id
  join public.admin_allowlist a on lower(a.email) = lower(u.email);
$$;

revoke all on function public.list_admin_push_subscriptions() from public, anon, authenticated;
grant execute on function public.list_admin_push_subscriptions() to service_role;

-- ---------------------------------------------------------------------------
-- 4. Review-photos — require reviews/ prefix + image extension
-- ---------------------------------------------------------------------------
drop policy if exists "Anon upload review photos" on storage.objects;
drop policy if exists "Auth upload review photos" on storage.objects;

create policy "Anon upload review photos"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'review-photos'
    and name ~ '^reviews/[^/]+\.(jpe?g|png|webp|gif)$'
  );

create policy "Auth upload review photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'review-photos'
    and name ~ '^reviews/[^/]+\.(jpe?g|png|webp|gif)$'
  );

-- ---------------------------------------------------------------------------
-- 5. RPC grants — analytics not callable by anon; is_admin stays authenticated-only
-- ---------------------------------------------------------------------------
revoke all on function public.get_analytics_events(int) from public, anon;
grant execute on function public.get_analytics_events(int) to authenticated;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

create or replace function public.get_public_popularity_events(p_limit int default 8000)
returns table (event_type text, created_at timestamptz, scooter_key text)
language sql
security definer
set search_path = public
stable
as $$
  select
    e.event_type,
    e.created_at,
    coalesce(e.meta->>'scooterId', e.meta->>'name', e.meta->>'interest') as scooter_key
  from public.lead_events e
  where e.event_type in (
    'scooter_view',
    'emi_calculator_used',
    'simulator_used',
    'test_ride_booked',
    'callback_request'
  )
  order by e.created_at desc
  limit greatest(1, least(coalesce(p_limit, 8000), 8000));
$$;

revoke all on function public.get_public_popularity_events(int) from public;
grant execute on function public.get_public_popularity_events(int) to anon, authenticated;

insert into public.schema_migrations (filename)
values ('harden_public_writes_push_and_rate_limits.sql')
on conflict do nothing;
