# PROMEDIAN CMS — Web + Cloud Admin

PROMEDIAN CMS adalah starter aplikasi web untuk mengelola konten promosi Program Studi D4 Produksi Media IMDE. Website publik membaca konten berstatus **published** dari Supabase. Admin login untuk menambah, mengedit, menghapus, mengurutkan, memublikasikan, dan mengunggah gambar tanpa mengubah kode.

## Teknologi
- Next.js 15 + React + TypeScript
- Supabase Postgres untuk database
- Supabase Auth untuk login administrator
- Supabase Storage untuk aset gambar
- Row Level Security (RLS) untuk membatasi akses

## A. Persiapan Supabase Cloud

1. Buat project di https://supabase.com.
2. Buka **SQL Editor** pada project.
3. Buka file `supabase/schema.sql` dari folder ini, salin seluruh isinya, lalu jalankan di SQL Editor.
4. Buka **Project Settings → API**. Salin `Project URL` dan `anon/public key`.
5. Buka **Authentication → Providers → Email** dan pastikan Email provider aktif.
6. Buka **Authentication → Users → Add user**. Buat email dan password admin.
7. Salin UUID user tersebut.
8. Kembali ke SQL Editor dan jalankan perintah berikut dengan UUID admin yang benar:

```sql
insert into public.admin_users(user_id)
values ('GANTI-DENGAN-UUID-USER-ADMIN');
```

Penting: Jangan memasukkan `service_role` key ke browser, file `.env.local`, atau repositori. Aplikasi hanya menggunakan anon/public key; pembatasan akses dilakukan oleh RLS.

## B. Menjalankan aplikasi

Persyaratan: Node.js 20 atau lebih baru.

1. Ekstrak folder project.
2. Buka terminal pada folder project.
3. Instal dependensi:

```bash
npm install
```

4. Salin `.env.example` menjadi `.env.local`.
5. Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_PUBLIC_KEY
```

6. Jalankan aplikasi:

```bash
npm run dev
```

7. Buka `http://localhost:3000`.
8. Dashboard admin: `http://localhost:3000/admin/login`.

## C. Panduan admin tanpa coding

1. Buka `/admin/login`.
2. Masuk menggunakan email dan password administrator yang dibuat di Supabase.
3. Pilih bagian konten pada sidebar: Profil Prodi, Kurikulum, Dosen, Karya Mahasiswa, Fasilitas, Industri & Mitra, Campus Life, atau Informasi PMB.
4. Klik **Tambah konten** untuk membuat data baru.
5. Isi judul, kategori, deskripsi, urutan tampil, tautan video, dan URL gambar atau unggah gambar.
6. Centang **Publikasikan konten setelah disimpan** jika konten siap ditampilkan.
7. Klik **Simpan konten**.
8. Untuk memperbarui data, klik ikon pensil. Untuk menghapus, klik ikon tempat sampah. Untuk mengubah status tayang, klik ikon mata.
9. Buka halaman utama untuk melihat konten publik.

## D. Struktur database

### `admin_users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| user_id | uuid | Relasi ke auth.users |
| created_at | timestamptz | Waktu pembuatan |

### `content_items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | ID konten |
| section | text | Kategori modul konten |
| title | text | Judul |
| description | text | Deskripsi |
| category | text | Label/kategori |
| image_url | text | URL gambar di Storage |
| video_url | text | URL video/tautan eksternal |
| published | boolean | Status tayang |
| sort_order | integer | Urutan tampil |
| created_at | timestamptz | Waktu dibuat |
| updated_at | timestamptz | Waktu diperbarui |

Nilai `section` yang tersedia:
- `profile`
- `curriculum`
- `lecturers`
- `student_works`
- `facilities`
- `industry`
- `campus_life`
- `admission`

### Supabase Storage
Bucket: `promedian-media` (public read, admin-only write). Batas unggah pada konfigurasi awal: 10 MB per file, format JPEG, PNG, WEBP, dan GIF.

## E. Keamanan dan catatan produksi

- Aktifkan RLS dan jalankan `schema.sql` sebelum aplikasi dipakai.
- Hanya UUID yang tercatat di `admin_users` dapat mengelola konten dan mengunggah media.
- Jangan pernah membagikan password admin atau service role key.
- Buat akun admin secara terpisah untuk setiap pengelola; jangan berbagi satu akun.
- Gunakan password kuat dan aktifkan kebijakan keamanan akun Supabase.
- Website publik hanya menampilkan data `published = true`.
- Backup database secara berkala.
- Video disarankan disimpan di platform video/streaming (misalnya YouTube/Vimeo/Vidio) dan tautannya dimasukkan ke `video_url`; bucket ini dibatasi untuk gambar.
- Persentase pembelajaran, profil, kontak, tautan PMB, dan informasi institusi pada tampilan contoh harus diverifikasi dan disesuaikan dengan data resmi IMDE sebelum publikasi.
- Starter ini belum mencakup manajemen role bertingkat, audit log, workflow persetujuan, analytics, atau integrasi AI. Fitur tersebut dapat ditambahkan pada tahap lanjutan.

## F. Deploy ke internet

1. Push folder project ke repositori GitHub.
2. Impor repositori di Vercel.
3. Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada Environment Variables Vercel.
4. Deploy.
5. Pada Supabase Authentication → URL Configuration, tambahkan URL domain produksi ke Site URL dan Redirect URLs.
6. Uji website publik, login admin, CRUD konten, upload gambar, serta status publikasi.

## Catatan
File ini adalah starter implementasi yang perlu dikonfigurasi dengan project Supabase milik IMDE. Database cloud dan akun admin belum dibuat otomatis karena membutuhkan kredensial dan persetujuan pemilik project.
