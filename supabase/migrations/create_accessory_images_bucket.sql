-- Create accessory-images storage bucket (public read, auth write)
-- Run once in Supabase SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'accessory-images',
  'accessory-images',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read accessory images'
  ) then
    execute $p$
      create policy "Public read accessory images"
        on storage.objects for select
        using (bucket_id = 'accessory-images')
    $p$;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Auth upload accessory images'
  ) then
    execute $p$
      create policy "Auth upload accessory images"
        on storage.objects for insert
        to authenticated
        with check (bucket_id = 'accessory-images')
    $p$;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Auth delete accessory images'
  ) then
    execute $p$
      create policy "Auth delete accessory images"
        on storage.objects for delete
        to authenticated
        using (bucket_id = 'accessory-images')
    $p$;
  end if;
end $$;
