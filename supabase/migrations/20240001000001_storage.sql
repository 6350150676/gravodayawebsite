-- ============================================================
-- Supabase Storage: property-images bucket
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,                             -- public bucket (images served via CDN URL)
  5242880,                          -- 5 MB per file
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- Public read (anyone can view property images)
create policy "property_images_public_read"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- Only admins can upload / delete
create policy "property_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and is_admin());

create policy "property_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'property-images' and is_admin());
