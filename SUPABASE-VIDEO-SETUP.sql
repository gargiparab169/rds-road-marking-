-- RDS website: enable admin-only video uploads and public playback.
-- Run this in Supabase Dashboard > SQL Editor > New query.

create table if not exists public.project_videos (
  id uuid primary key default gen_random_uuid(),
  file_path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.project_videos enable row level security;

create policy "Public can view project video records"
on public.project_videos for select
using (true);

create policy "Admins can add project video records"
on public.project_videos for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete project video records"
on public.project_videos for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', true, 52428800, array['video/mp4','video/webm'])
on conflict (id) do update set public = true, file_size_limit = 52428800,
  allowed_mime_types = array['video/mp4','video/webm'];

create policy "Public can view project video files"
on storage.objects for select
using (bucket_id = 'project-videos');

create policy "Admins can upload project video files"
on storage.objects for insert to authenticated
with check (bucket_id = 'project-videos' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete project video files"
on storage.objects for delete to authenticated
using (bucket_id = 'project-videos' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
