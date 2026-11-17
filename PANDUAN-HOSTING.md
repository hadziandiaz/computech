# Panduan Hosting COMPUTECH

Situs sudah online di Vercel, tetapi masih kosong karena belum tersambung ke Supabase.

| Item | Nilai |
| --- | --- |
| URL publik | https://computech-nine.vercel.app |
| Hosting | Vercel (project `computech`, scope `diazvdiaz624-4530s-projects`) |
| Database | Supabase (belum dibuat) |

Semua file SQL database **ada di dalam project**:

```text
supabase/all_in_one.sql        <- semua migrasi digabung, tempel sekali saja
supabase/migrations/0001_init.sql ... 0010_seed_merchandising.sql
```

---

## 1. Buat project Supabase

1. Buka https://supabase.com/dashboard dan login (gratis, tanpa kartu kredit).
2. **New project** -> isi nama `computech`, pilih region terdekat (mis. `Southeast Asia (Singapore)`).
3. Simpan **database password** yang dibuat.
4. Tunggu sampai project selesai provisioning (~2 menit).

## 2. Jalankan SQL

1. Di dashboard Supabase, buka **SQL Editor** -> **New query**.
2. Buka file `supabase/all_in_one.sql` di editor teks, **salin seluruh isinya**, tempel ke SQL Editor.
3. Klik **Run** (atau `Ctrl+Enter`). Proses 10-30 detik.

File itu sudah berisi urutan yang benar:

| File | Isi |
| --- | --- |
| `0001_init.sql` | 33 tabel, enum, index, constraint, trigger, RPC, RLS, storage bucket |
| `0002_seed_categories_brands.sql` | kategori + brand |
| `0003`-`0006_seed_products_*.sql` | 78 produk demo (komputer, komponen, networking, aksesori) |
| `0007_seed_images_inventory.sql` | gambar + stok gudang |
| `0008_seed_specifications.sql` | spesifikasi teknis per produk |
| `0009_seed_pc_components.sql` | komponen untuk PC Builder |
| `0010_seed_merchandising.sql` | promo, voucher, ulasan, pengaturan toko |

Alternatif lewat CLI (butuh Supabase CLI + Docker):

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Cek hasilnya di **Table Editor**: tabel `products` harus berisi **78 baris**.

## 3. Ambil kredensial

**Project Settings -> API** (atau **Data API**):

| Kunci | Dipakai untuk |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` / secret key | `SUPABASE_SERVICE_ROLE_KEY` (server saja, jangan pernah diberi prefix `NEXT_PUBLIC_`) |

## 4. Pasang environment variable di Vercel

Lewat dashboard: **Project -> Settings -> Environment Variables** (pilih environment Production), tambahkan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_SITE_URL=https://computech-nine.vercel.app
PAYMENT_PROVIDER=manual
SHIPPING_PROVIDER=manual
```

Lewat CLI (dari folder project):

```bash
npx -y vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx -y vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx -y vercel env add SUPABASE_SERVICE_ROLE_KEY production
npx -y vercel env add NEXT_PUBLIC_SITE_URL production
npx -y vercel deploy --prod --yes -p computech
```

Setiap `env add` akan meminta nilainya; tempel lalu tekan Enter.

## 5. Atur URL Auth Supabase

**Authentication -> URL Configuration**:

- **Site URL**: `https://computech-nine.vercel.app`
- **Redirect URLs**: tambahkan
  - `https://computech-nine.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (untuk dev lokal)

Tanpa langkah ini, link reset password dan konfirmasi email akan gagal.

## 6. Buat admin pertama

1. Buka https://computech-nine.vercel.app/register dan daftar satu akun.
2. Di Supabase **SQL Editor**, jalankan:

```sql
select public.bootstrap_admin('email-yang-anda-daftarkan@gmail.com');
```

3. Logout lalu login ulang. Menu **Admin** akan muncul di https://computech-nine.vercel.app/admin.

## 7. Verifikasi

| Halaman | Harapan |
| --- | --- |
| `/` | katalog produk demo tampil |
| `/products` | filter, urutan, pencarian berfungsi |
| `/pc-builder` | pilih komponen + cek kompatibilitas |
| `/cart`, `/checkout` | butuh login, ongkir & voucher berhitung |
| `/admin` | dashboard berisi angka nyata dari database |

---

## Catatan

- **Data demo** ditandai `is_demo = true`. Sebelum dipakai jualan sungguhan, ganti produk/harga atau hentikan data demo.
- **Pembayaran & ongkir** default `manual`. Isi `MIDTRANS_*` / `XENDIT_*` / `RAJAONGKIR_*` hanya jika sudah punya key sandbox/produksi, lalu arahkan webhook ke `/api/webhooks/midtrans` atau `/api/webhooks/xendit`.
- **Rahasia**: `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server. Jangan taruh di variabel `NEXT_PUBLIC_*` dan jangan commit `.env.local` (sudah masuk `.gitignore`).
- **Paket Vercel Hobby** cukup untuk demo/portofolio. Untuk toko komersial, Vercel mensyaratkan paket berbayar.
