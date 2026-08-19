-- ============================================================================
-- Migration 29: Repair RLS after historical create-policy files were replayed
-- Idempotent — safe to re-run whenever leftover USING (true) policies return.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Vyapar — admin-only (drop leftover "any authenticated" policies)
-- ---------------------------------------------------------------------------
drop policy if exists "auth all vyapar_settings" on public.vyapar_settings;
drop policy if exists "auth read vyapar_settings" on public.vyapar_settings;
drop policy if exists "auth all vyapar_items" on public.vyapar_items;
drop policy if exists "auth read vyapar_items" on public.vyapar_items;

drop policy if exists "admin all vyapar_settings" on public.vyapar_settings;
create policy "admin all vyapar_settings"
  on public.vyapar_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin all vyapar_items" on public.vyapar_items;
create policy "admin all vyapar_items"
  on public.vyapar_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Service bookings — admin manage; anon insert cannot set handled status
-- ---------------------------------------------------------------------------
drop policy if exists "auth all service_bookings" on public.service_bookings;

drop policy if exists "admin all service_bookings" on public.service_bookings;
create policy "admin all service_bookings"
  on public.service_bookings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "anon insert service_bookings" on public.service_bookings;
create policy "anon insert service_bookings"
  on public.service_bookings
  for insert to anon
  with check (coalesce(status, 'requested') = 'requested');

-- ---------------------------------------------------------------------------
-- 3. Push subscriptions — allowlisted admins only
-- ---------------------------------------------------------------------------
drop policy if exists "auth manage own push subs" on public.admin_push_subscriptions;
drop policy if exists "admin manage own push subs" on public.admin_push_subscriptions;
create policy "admin manage own push subs"
  on public.admin_push_subscriptions
  for all to authenticated
  using (public.is_admin() and (select auth.uid()) = user_id)
  with check (public.is_admin() and (select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 4. Rate-limit — require visitor_id on public form / event inserts
-- ---------------------------------------------------------------------------
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

  -- Forms and lead_events must carry a visitor_id so the per-visitor cap applies.
  if TG_TABLE_NAME <> 'reviews' and vid is null then
    raise exception 'rate limited';
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

revoke all on function public.assert_public_write_rate() from public, anon, authenticated;

insert into public.schema_migrations (filename)
values ('repair_rls_after_replay.sql')
on conflict do nothing;
