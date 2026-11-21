# RDS project gallery — Supabase setup

This website now includes a public clickable Projects gallery and a protected admin upload page. The existing 13 local project photos remain visible. New uploads are stored in Supabase and become visible to all website visitors.

## 1. Create a Supabase project
1. Create a project at https://supabase.com/.
2. In Project Settings → API, copy the **Project URL** and the **anon/public key**.
3. Open `js/supabase-config.js` and replace the two placeholder strings:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_ANON_PUBLIC_KEY`
4. Do not put a `service_role` or secret key in website code. The anon/public key is designed for browser use with the RLS policies below.

## 2. Create the table, bucket and security policies
Open Supabase → SQL Editor → New query. Paste and run all of this SQL:

```sql
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  file_path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.project_photos enable row level security;

-- Anyone can see gallery records; only a user with app_metadata.role = admin can change them.
create policy "Public can view project photos"
on public.project_photos for select
using (true);

create policy "Admins can add project photo records"
on public.project_photos for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete project photo records"
on public.project_photos for delete to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-photos', 'project-photos', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "Public can view project photo files"
on storage.objects for select
using (bucket_id = 'project-photos');

create policy "Admins can upload project photo files"
on storage.objects for insert to authenticated
with check (bucket_id = 'project-photos' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete project photo files"
on storage.objects for delete to authenticated
using (bucket_id = 'project-photos' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

## 3. Create the admin login
1. In Supabase → Authentication → Users, choose **Add user** and create the admin email/password. Use an email controlled by the business.
2. Open that user and edit **App Metadata** (not User Metadata) to this JSON:

```json
{"role":"admin"}
```

3. Save. Keep public sign-ups disabled in Authentication settings. Only users you create and mark with the `admin` app-metadata role can upload/delete photos.
4. Open `https://YOUR-WEBSITE-DOMAIN/admin.html` to sign in.

## 4. Publish the website
Deploy the entire extracted website folder to your static host (for example Netlify). Keep the `assets`, `css`, `js` folders and all HTML files together. Use HTTPS. The gallery uses the Supabase project URL and anon/public key from `js/supabase-config.js`.

## How it works
- `projects.html`: shows the bundled project photos plus photos saved in Supabase, and a separate video section for uploaded project videos.
- Clicking any photo opens a large preview; click outside, press Escape, or use × to close.
- `admin.html`: admin sign-in, multi-photo upload (JPG/PNG/WebP, max 10 MB each), video upload (MP4/WebM, max 50 MB each), and delete controls for both media types.
- New photos are listed publicly after upload. The Projects page also listens for database changes while open.

## Important security notes
- Never add the Supabase `service_role` key to this website.
- Do not make the storage bucket private; public gallery viewing requires public read access.
- Admin access is checked using the signed-in user's `app_metadata.role` claim and enforced again by database/storage RLS policies.
- If you change the admin role, sign out and sign back in to refresh the session token.

## 5. Enable project video uploads (added)
The same admin login is used for both photos and videos. Run this additional SQL in Supabase → SQL Editor → New query. It creates a separate video table and public video bucket while keeping uploads/deletes restricted to admin accounts.

```sql
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
```

If Supabase reports that a policy with one of these names already exists, do not create a duplicate; check the existing policy and its condition first.

## 6. Video upload and display
- Admin page: choose MP4 or WebM videos from a phone or computer and upload multiple files.
- Video size limit in this website: 50 MB per video. Supabase bucket limit is also set to 50 MB.
- Admin can preview and delete published videos. Deletion removes the Storage file and its database record.
- Public Projects page shows a separate Project Videos section with built-in playback controls. The section stays hidden when no videos have been uploaded.
- Large videos use more storage and bandwidth. For smoother phone playback, export/compress videos before uploading.

The existing photo upload feature, login and photo gallery are retained. The website frontend uses only the Supabase anon/publishable key; never put a service-role key in browser code.
