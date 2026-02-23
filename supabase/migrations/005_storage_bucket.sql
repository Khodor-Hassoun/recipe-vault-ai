-- Create a public bucket for recipe images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  524288,                                            -- 512 KB hard limit per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Anyone can read images (bucket is public, but explicit policy avoids 406 errors)
create policy "public read recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

-- Authenticated users can upload into their own folder
create policy "owner upload recipe images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete their own images
create policy "owner delete recipe images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
