-- Critical security & analytics fixes
-- 1. Reviews: anon cannot self-approve
-- 2. Leads: remove open anon UPDATE; use upsert_lead RPC only
-- 3. Analytics: get_analytics_events RPC for public popularity badges

-- ---------------------------------------------------------------------------
-- Reviews — pending-only inserts + trigger (defense in depth)
-- ---------------------------------------------------------------------------
drop policy if exists "anon insert reviews" on public.reviews;

create policy "anon insert reviews" on public.reviews
  for insert to anon
  with check (
    status = 'pending'
    and featured = false
    and rating between 1 and 5
  );

create or replace function public.enforce_review_pending()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.featured := false;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_force_pending on public.reviews;
create trigger reviews_force_pending
  before insert on public.reviews
  for each row execute function public.enforce_review_pending();

-- ---------------------------------------------------------------------------
-- Leads — close open anon table writes; use RPC for visitor upsert
-- ---------------------------------------------------------------------------
drop policy if exists "anon upsert leads ins" on public.leads;
drop policy if exists "anon upsert leads upd" on public.leads;

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
begin
  if p_visitor_id is null or length(trim(p_visitor_id)) = 0 then
    raise exception 'visitor_id required';
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
    classification = excluded.classification,
    updated_at = now();
end;
$$;

revoke all on function public.upsert_lead(text, text, text, text, text, int, text) from public;
grant execute on function public.upsert_lead(text, text, text, text, text, int, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Analytics — aggregated event read for public popularity (no direct table SELECT)
-- ---------------------------------------------------------------------------
create or replace function public.get_analytics_events(p_limit int default 8000)
returns table (
  event_type text,
  meta jsonb,
  created_at timestamptz,
  visitor_id text
)
language sql
security definer
set search_path = public
stable
as $$
  select e.event_type, e.meta, e.created_at, e.visitor_id
  from public.lead_events e
  order by e.created_at desc
  limit least(greatest(coalesce(p_limit, 8000), 1), 10000);
$$;

revoke all on function public.get_analytics_events(int) from public;
grant execute on function public.get_analytics_events(int) to anon, authenticated;
