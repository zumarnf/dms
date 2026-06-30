# DMS — Document Management System

**DMS** adalah aplikasi web untuk **mengelola dokumen digital secara terpusat**: unggah,
organisasi folder, riwayat versi, pencarian cepat, kontrol akses berbasis peran, berbagi
antar pengguna, hingga jejak audit — dibungkus antarmuka yang modern, cepat, dan mudah dipakai.

Ditujukan untuk tim / organisasi kecil–menengah yang ingin berhenti menyimpan dokumen tercecer
di folder lokal & email, dan beralih ke satu tempat yang **rapi, aman, dan dapat ditelusuri**.

---

## ✨ Fitur

- **Autentikasi & RBAC** — login email/password, 4 peran: `admin`, `manager`, `contributor`, `viewer`.
- **Manajemen dokumen** — unggah file, metadata, unduh terotorisasi.
- **Versioning** — setiap unggah ulang membuat versi baru; lihat riwayat & set versi aktif.
- **Pencarian full-text** — cari nama + isi dokumen (PostgreSQL `tsvector`), hasil sesuai izin akses.
- **Folder hierarki** — susun dokumen dalam folder bertingkat dengan breadcrumb; unggah / pindahkan dokumen antar folder.
- **Berbagi & izin** — bagikan dokumen ke pengguna (via email) atau peran dengan level `Lihat / Edit / Kelola`; cabut kapan saja.
- **Notifikasi** — pemberitahuan in-app saat dokumen dibagikan kepada Anda.
- **Sampah (soft-delete)** — dokumen terhapus dapat dipulihkan.
- **Komentar** — diskusi ringan per dokumen.
- **Audit trail** — jejak setiap aksi penting (unggah, unduh, hapus, berbagi, dll).
- **Dashboard & admin** — ringkasan statistik; admin mengelola peran/status pengguna.
- **UX modern** — mode terang/gelap, empty/loading/error state informatif, aksesibel (WCAG AA).

---

## 🧰 Tech Stack

| Lapis        | Teknologi                                                                                |
| ------------ | ---------------------------------------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, RSC + Server Actions)                                        |
| Bahasa       | **TypeScript 6**, **React 19**                                                           |
| Database     | **PostgreSQL** + **Drizzle ORM** (driver `postgres-js`)                                  |
| Auth         | **Better Auth** (session aman, hashing, rate-limit)                                      |
| Validasi     | **Zod 4** (dipakai ulang di frontend & backend)                                          |
| Styling      | **Tailwind CSS v4** (design token "Forest Ink")                                          |
| Testing      | **Vitest** + Testing Library (+ **PGlite** untuk integration test), **Playwright** (E2E) |
| Kualitas     | **ESLint** + **Prettier**                                                                |
| Storage file | Local filesystem (abstraksi `StorageDriver`, mudah diganti ke S3)                        |

---

## 🏗️ Arsitektur — Hybrid FSD + Atomic Design

Batas modul mengikuti **Feature-Sliced Design** (impor searah ke bawah); komponen presentasional
reusable mengikuti **Atomic Design** di dalam `shared/ui`.

```
src/
├─ app/         Routing Next.js (App Router), error boundaries, proxy (auth)
├─ processes/   Alur lintas-halaman (session guard, authorize resource)
├─ widgets/     Blok UI mandiri (sidebar, topbar)
├─ features/    Fitur per aksi user (api/model/ui) — upload, search, share, versioning, ...
├─ entities/    Model domain: schema DB + repository (user, document, version, folder, ...)
├─ shared/      ui (atoms/molecules/organisms), lib, config, types
└─ db/          Drizzle schema agregat + migrations
```

**Prinsip:** authz dicek di Server Action **dan** di data layer (anti-IDOR); query parameterized
(Drizzle); validasi Zod di setiap boundary; satu sumber kebenaran tipe (Drizzle infer + Zod).

---

## 🚀 Memulai (Development)

### Prasyarat

- **Node.js ≥ 20**
- Sebuah **PostgreSQL** (pilih salah satu di bawah — tidak wajib Docker)

### 1) Install dependency

```bash
npm install
```

### 2) Siapkan environment

Buat file **`.env.local`** di root (di-gitignore) — atau salin dari `.env.example`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
BETTER_AUTH_SECRET=<string acak min 32 char>   # contoh: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
STORAGE_DIR=./storage
```

### 3) Sediakan database — pilih satu

**Opsi A — Neon (cloud, gratis, tanpa install) — direkomendasikan**

1. Daftar di [neon.tech](https://neon.tech) → buat project.
2. **Connect** → matikan **Connection pooling** (pakai koneksi _direct_) → copy connection string.
3. Tempel ke `DATABASE_URL`.

**Opsi B — Docker (lokal)**
Repo menyertakan `docker-compose.yml` (PostgreSQL + MinIO):

```bash
docker compose up -d postgres
# DATABASE_URL=postgresql://dms:dms@localhost:5432/dms
```

### 4) Terapkan migrasi & jalankan

```bash
npm run db:migrate     # buat semua tabel
npm run dev            # buka http://localhost:3000
```

Buka **http://localhost:3000** → daftar akun di `/login`.

### Membuat admin pertama

Akun baru berperan `contributor`. Untuk membuka menu **Pengguna** & **Aktivitas**, jadikan admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Jalankan lewat **Drizzle Studio** (lihat bawah), **Neon SQL Editor**, atau `psql`.

---

## 🗄️ Membuka Database (GUI)

```bash
npm run db:studio
```

Membuka **Drizzle Studio** di `https://local.drizzle.studio` untuk melihat & mengedit tabel
(`users`, `documents`, `document_versions`, `folders`, `permissions`, `audit_logs`, dll).
Membutuhkan `DATABASE_URL` di `.env.local`.

---

## 📜 Perintah

| Perintah                          | Fungsi                                            |
| --------------------------------- | ------------------------------------------------- |
| `npm run dev`                     | Jalankan dev server                               |
| `npm run build`                   | Build produksi                                    |
| `npm run typecheck`               | Type-check (`tsc --noEmit`)                       |
| `npm run lint` / `npm run format` | Lint / format kode                                |
| `npm run test`                    | Unit + integration test (Vitest + PGlite)         |
| `npm run test:e2e`                | E2E (Playwright — perlu `npx playwright install`) |
| `npm run db:migrate`              | Terapkan migrasi                                  |
| `npm run db:generate`             | Buat file migrasi dari perubahan schema           |
| `npm run db:studio`               | Buka GUI database                                 |

---

## 🧪 Testing & Keamanan

- **Test** berjalan tanpa database eksternal: integration test memakai **PGlite** (PostgreSQL in-process).
- Cakupan inti: scoping akses (anti-IDOR), upload + pencarian, versioning, berbagi + notifikasi, folder.
- **Keamanan:** session cookie aman, hashing password (Better Auth), validasi Zod di server,
  query parameterized, otorisasi server-side berlapis, security header (CSP/HSTS/X-Frame),
  pesan error generik (tanpa bocor detail internal).

---

## 📌 Status & Roadmap

**Sudah ada (MVP):** auth/RBAC, dokumen (upload/versioning/unduh), pencarian full-text, folder
hierarki, berbagi + notifikasi, sampah/restore, komentar, audit, dashboard, admin pengguna,
error handling global, security header.

**Rencana lanjutan:** ekstraksi teks PDF/Office untuk pencarian (saat ini txt/csv), CSP berbasis
nonce, integrasi storage S3/R2, E2E penuh, dan workflow approval.

---

## 📂 Dokumentasi Perencanaan

PRD · SRS · SDD · UI/UX Flow · Task Breakdown tersedia di `plans/dms-website/` (lokal, di-gitignore).

## 🌿 Branch

- **`main`** — branch stabil.
- **`develop`** — branch kerja aktif.
