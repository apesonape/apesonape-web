-- 003_storage_avatars_bucket.sql
-- Public storage bucket for profile avatars

-- Create bucket (idempotent)
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'avatars') then
    perform storage.create_bucket('avatars', public := true);
  end if;
end$$;

-- Allow public read access to files in the avatars bucket
create policy if not exists "Public read for avatars"
on storage.objects for select
to public
using ( bucket_id = 'avatars' );

-- Allow service role (handled by API key) to insert/update/delete; for anon/authorized users keep stricter policies if desired
-- Example write policy for authenticated users to their own folder (optional):
-- create policy if not exists "Users can manage their own avatar files"
-- on storage.objects for all
-- to authenticated
-- using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid() )
-- with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid() );


