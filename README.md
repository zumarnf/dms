# DMS — Document Management System

Document Management System sederhana namun modern: autentikasi + RBAC, unggah dokumen,
versioning, pencarian full-text, berbagi (share) berbasis izin, soft-delete + Trash,
komentar, notifikasi, audit trail, dan dashboard.

## Tech Stack

Next.js 16 (App Router, RSC + Server Actions) · React 19 · TypeScript 6 · PostgreSQL ·
Drizzle ORM · Better Auth · Zod 4 · Tailwind CSS v4 · Vitest + Playwright · ESLint + Prettier.

## Arsitektur — Hybrid FSD + Atomic Design

Layer FSD (impor searah ke bawah): `app → processes → pages → widgets → features → entities → shared`.
Atomic Design di dalam `src/shared/ui` (`atoms → molecules → organisms`).

```
src/
├─ app/         Next.js App Router (routing, error boundaries, proxy)
├─ processes/   Alur lintas-halaman (auth guard, authorize)
├─ widgets/     Blok UI mandiri (sidebar, topbar)
├─ features/    Aksi user (api/model/ui) — upload, search, share, versioning, ...
├─ entities/    Model domain + repository + schema DB
├─ shared/      ui (atoms/molecules/organisms), lib, config, types
└─ db/          Drizzle schema + migrations
```

## Menjalankan (Development)

Butuh **Node.js ≥ 20** dan sebuah **database PostgreSQL**. Tidak perlu Docker — bisa pakai
PostgreSQL cloud gratis (mis. [Neon](https://neon.tech)) atau instalasi lokal.

1. **Install dependency**
   ```bash
   npm install
   ```
2. **Siapkan environment** — salin `.env.example` ke `.env.local` lalu isi:
   ```bash
   cp .env.example .env.local
   ```
   - `DATABASE_URL` — connection string PostgreSQL (mis. dari Neon).
   - `BETTER_AUTH_SECRET` — string acak ≥ 32 karakter (`openssl rand -base64 32`).
   - `BETTER_AUTH_URL` — `http://localhost:3000`.
3. **Terapkan migrasi database**
   ```bash
   npm run db:migrate
   ```
4. **Jalankan**
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000 → daftar akun di `/login`.

> **Membuat admin pertama:** akun baru berperan `contributor` secara default. Untuk mengakses
> menu **Pengguna**/**Aktivitas**, ubah `role` menjadi `admin` lewat Drizzle Studio (lihat bawah)
> atau SQL: `UPDATE users SET role='admin' WHERE email='you@example.com';`

## Membuka Database (Drizzle Studio)

```bash
npm run db:studio
```
Membuka GUI di https://local.drizzle.studio untuk melihat & mengedit tabel (users, documents,
document_versions, permissions, audit_logs, dst.). Membutuhkan `DATABASE_URL` di `.env.local`.

Perintah DB lain: `npm run db:generate` (buat migrasi dari schema), `npm run db:push`
(sinkron schema tanpa file migrasi).

## Perintah

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build produksi |
| `npm run typecheck` | Type-check (`tsc --noEmit`) |
| `npm run lint` / `npm run format` | Lint / format |
| `npm run test` | Unit + integration test (Vitest + PGlite) |
| `npm run test:e2e` | E2E (Playwright; perlu `npx playwright install`) |
| `npm run db:migrate` / `db:studio` | Terapkan migrasi / buka GUI database |

## Dokumentasi Perencanaan

PRD · SRS · SDD · UI/UX Flow · Task Breakdown → `plans/dms-website/`.

## Branch

- `main` — branch stabil.
- `develop` — branch kerja aktif.
