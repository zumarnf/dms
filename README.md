# DMS — Document Management System

Document Management System sederhana namun modern: unggah, organisasi folder, versioning,
pencarian full-text, RBAC, preview, berbagi, dan audit trail.

> **Status:** scaffolding (struktur folder kosong). Implementasi mengikuti dokumen di
> [`plans/dms-website/`](plans/dms-website/).

## Tech Stack (rencana)

Next.js (App Router, RSC + Server Actions) · React · TypeScript · PostgreSQL · Drizzle ORM ·
Auth.js · Zod · Tailwind CSS v4 + shadcn/ui · Vitest + Playwright.

> Versi pasti tiap dependency dikunci saat install (Dependency Version Gate — `.claude/rules/core.md`):
> kebijakan = **versi terbaru yang kompatibel**.

## Arsitektur — Hybrid FSD + Atomic Design

Layer FSD (impor searah ke bawah): `app → processes → pages → widgets → features → entities → shared`.
Atomic Design di dalam `src/shared/ui` (`atoms → molecules → organisms`).

```
src/
├─ app/         Next.js App Router (routing)
├─ processes/   Alur lintas-halaman
├─ pages/       Komposisi UI per route
├─ widgets/     Blok UI mandiri
├─ features/    Aksi user (api/model/ui)
├─ entities/    Model domain + repository + schema DB
├─ shared/      ui (atoms/molecules/organisms), lib, api, config, types
└─ db/          Drizzle schema + migrations
```

## Dokumentasi Perencanaan

PRD · SRS · SDD · UI/UX Flow · Task Breakdown → [`plans/dms-website/`](plans/dms-website/).

## Branch

- `main` — branch stabil.
- `develop` — branch kerja aktif.
