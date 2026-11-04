-- PROMEDIAN CMS schema for Supabase
-- Jalankan seluruh SQL ini di Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in (
    'profile','curriculum','lecturers','student_works',
    'facilities','industry','campus_life','admission'
  )),
  title text not null,
  description text,
  category text,
  image_url text,
  video_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_section_published_order_idx
on public.content_items(section, published, sort_order);

alter table public.admin_users enable row level security;
alter table public.content_items enable row level security;

-- Admin dapat memeriksa role miliknya sendiri.
drop policy if exists "Admins can read own admin row" on public.admin_users;
create policy "Admins can read own admin row"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

-- Konten terpublikasi dapat dibaca publik.
drop policy if exists "Public can read published content" on public.content_items;
create policy "Public can read published content"
on public.content_items for select
to anon, authenticated
using (published = true);

-- Admin yang terdaftar dapat membaca semua konten.
drop policy if exists "Admins can read all content" on public.content_items;
create policy "Admins can read all content"
on public.content_items for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can insert content" on public.content_items;
create policy "Admins can insert content"
on public.content_items for insert
to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can update content" on public.content_items;
create policy "Admins can update content"
on public.content_items for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete content" on public.content_items;
create policy "Admins can delete content"
on public.content_items for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Bucket media publik untuk gambar dan aset promosi.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('promedian-media', 'promedian-media', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- Siapa pun dapat melihat aset publik.
drop policy if exists "Public can view promedian media" on storage.objects;
create policy "Public can view promedian media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'promedian-media');

-- Hanya admin yang dapat mengunggah, mengubah, dan menghapus media.
drop policy if exists "Admins can upload promedian media" on storage.objects;
create policy "Admins can upload promedian media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'promedian-media'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "Admins can update promedian media" on storage.objects;
create policy "Admins can update promedian media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'promedian-media'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  bucket_id = 'promedian-media'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "Admins can delete promedian media" on storage.objects;
create policy "Admins can delete promedian media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'promedian-media'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- Contoh data awal (opsional).
insert into public.content_items(section,title,description,category,published,sort_order)
values
('profile','D4 Produksi Media','Program Sarjana Terapan yang memadukan kreativitas, keterampilan teknis, dan pemahaman industri untuk menghasilkan karya media yang relevan dengan perkembangan zaman.','Profil Prodi',true,1),
('curriculum','Digital Videography','Teknik kamera, komposisi, visual storytelling, dan pencahayaan.','Bidang Pembelajaran',true,1),
('curriculum','Editing & Post-production','Penyuntingan video, audio, color grading, dan finishing karya.','Bidang Pembelajaran',true,2),
('curriculum','Directing & Produksi','Pengembangan konsep, penyutradaraan, dan manajemen produksi.','Bidang Pembelajaran',true,3)
on conflict do nothing;

-- Setelah membuat user melalui Supabase Authentication > Users,
-- ganti UUID di bawah dengan UUID user admin tersebut, lalu jalankan:
-- insert into public.admin_users(user_id) values ('UUID-USER-ADMIN');
