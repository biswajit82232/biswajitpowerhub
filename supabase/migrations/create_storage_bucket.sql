-- ============================================================================
-- Create scooter-images storage bucket (public read, auth write)
-- Run once in Supabase SQL Editor
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scooter-images',
  'scooter-images',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Public can read all images
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read scooter images'
  ) then
    execute $p$
      create policy "Public read scooter images"
        on storage.objects for select
        using (bucket_id = 'scooter-images')
    $p$;
  end if;
end $$;

-- Authenticated admins can upload
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Auth upload scooter images'
  ) then
    execute $p$
      create policy "Auth upload scooter images"
        on storage.objects for insert
        to authenticated
        with check (bucket_id = 'scooter-images')
    $p$;
  end if;
end $$;

-- Authenticated admins can delete
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Auth delete scooter images'
  ) then
    execute $p$
      create policy "Auth delete scooter images"
        on storage.objects for delete
        to authenticated
        using (bucket_id = 'scooter-images')
    $p$;
  end if;
end $$;
