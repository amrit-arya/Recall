-- ============================================================
-- RECALL — Supabase Private Storage Configuration & RLS Policies
-- ============================================================

-- 1. Create Private 'memories' Bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'memories',
    'memories',
    false, -- Private bucket: access requires signed URLs / RLS authentication
    10485760, -- 10 MB file size limit
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];


-- ============================================================
-- 2. Storage RLS Policies (storage.objects)
-- Path layout: {user_id}/{filename}
-- ============================================================

-- Allow authenticated users to view/download objects in their own folder
create policy "Users can view own memory attachments"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'memories'
    and (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to upload objects into their own folder
create policy "Users can upload own memory attachments"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'memories'
    and (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update objects in their own folder
create policy "Users can update own memory attachments"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'memories'
    and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
    bucket_id = 'memories'
    and (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete objects in their own folder
create policy "Users can delete own memory attachments"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'memories'
    and (select auth.uid())::text = (storage.foldername(name))[1]
);
