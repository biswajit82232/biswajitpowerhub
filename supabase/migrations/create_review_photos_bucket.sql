-- Review photo uploads (public read, anon + auth write)
-- Customers upload when submitting reviews; admins can manage in dashboard.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  true,
  4194304,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read review photos'
  ) then
    execute $p$
      create policy "Public read review photos"
        on storage.objects for select
        using (bucket_id = 'review-photos')
    $p$;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Anon upload review photos'
  ) then
    execute $p$
      create policy "Anon upload review photos"
        on storage.objects for insert
        to anon
        with check (bucket_id = 'review-photos')
    $p$;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Auth upload review photos'
  ) then
    execute $p$
      create policy "Auth upload review photos"
        on storage.objects for insert
        to authenticated
        with check (bucket_id = 'review-photos')
    $p$;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Auth delete review photos'
  ) then
    execute $p$
      create policy "Auth delete review photos"
        on storage.objects for delete
        to authenticated
        using (bucket_id = 'review-photos')
    $p$;
  end if;
end $$;

-- Remove generated avatar URLs from seed reviews
update public.reviews
set photo_url = null
where photo_url like '%dicebear%';
