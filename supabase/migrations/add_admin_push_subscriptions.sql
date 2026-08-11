-- Admin Web Push subscriptions (Android/Chrome PWA background notifications)

create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (endpoint)
);

create index if not exists admin_push_subscriptions_user_id_idx
  on public.admin_push_subscriptions (user_id);

alter table public.admin_push_subscriptions enable row level security;

drop policy if exists "auth manage own push subs" on public.admin_push_subscriptions;
create policy "auth manage own push subs"
  on public.admin_push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on upserts
create or replace function public.touch_admin_push_subscription()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists admin_push_subscriptions_touch on public.admin_push_subscriptions;
create trigger admin_push_subscriptions_touch
  before update on public.admin_push_subscriptions
  for each row execute function public.touch_admin_push_subscription();
