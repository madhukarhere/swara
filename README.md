# Swara — Cultural Music & Lyrics Portal

A locally-deployable portal for devotional/cultural music with **multi-language lyrics**,
an audio player, moderated comments with a local CAPTCHA, and a full admin panel.
No cloud services, no Docker required — MongoDB Community + local file storage.

> Inspired by cultural music portals such as Vijayavipanchi. Seeded with Telugu/Sanskrit
> devotional content (Annamacharya keertanas, stotras, Tyagaraja kritis, bhajans).

---

## Status

**Phase 1 (complete & tested):** foundation + the full **Songs** module end-to-end, plus
**Events** admin management.

| Area | Built |
|------|-------|
| Public site | Homepage (announcement bar, hero, calendar widget, quote of the day, Top 5 / Featured / Recently Added / Most Played, categories, festival banner), song listing (search + category/language filter + sort), song detail (audio player, multi-language lyrics in tabs + side-by-side compare + auto-scroll, print / PDF / QR / copy / share, related songs, comments + CAPTCHA) |
| Admin panel | JWT login, dashboard (counts, plays, storage), Songs CRUD + audio/cover upload, per-song Lyrics CRUD, Categories CRUD, **Events CRUD**, comment moderation |
| Platform | 17 Mongoose models + indexes, JWT/bcrypt auth, CSRF, helmet, rate limiting, zod validation, XSS sanitization, file-upload validation, audit logging, Winston logs, local image CAPTCHA, lyrics-PDF generation, backup scripts, seed data |
| Tests | 19 backend API tests (Vitest + supertest) |

**Roadmap (not yet built):** public Videos/Articles/Quotes + their admin CRUD; the
configurable Homepage Management UI; Banners/Announcements admin scheduling; analytics
charts & audit-log viewer.

---

## Tech stack

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, shadcn-style UI, `next-themes` (light/dark)
- **Backend:** Node.js 22 LTS, Express 4, TypeScript
- **Database:** MongoDB Community Edition (Mongoose 8)
- **Auth:** JWT (httpOnly cookie) + bcrypt, CSRF double-submit
- **Storage:** local filesystem under `data/` (auto-created)

---

## Quick start

> Requires **Node.js 22 LTS** and **MongoDB Community** running locally. See [INSTALL.md](INSTALL.md) for details.

```bash
# from the repo root
npm run setup        # installs root + backend + frontend deps, downloads Noto fonts
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run seed         # seed devotional sample data + the admin user
npm run dev          # starts API (:4000) and web (:3000) together
```

Open **http://localhost:3000** — admin panel at **/admin** (`admin` / `Admin@12345`, change in `backend/.env`).

---

## Project structure

```
swara/
├── backend/            Express + TypeScript API  (:4000)
│   ├── src/
│   │   ├── config/     env + db connection
│   │   ├── lib/        logger, storage, captcha, jwt, pdf, sanitize, ip, slugify
│   │   ├── models/     17 Mongoose models
│   │   ├── middleware/ auth, csrf, validate, rateLimit, audit, error
│   │   ├── routes/     public/ + admin/
│   │   ├── seed/       seed.ts + asset generators
│   │   └── index.ts    server entry
│   ├── assets/fonts/   bundled Noto fonts for PDF
│   └── tests/          Vitest + supertest
├── frontend/           Next.js 15 app  (:3000)
│   └── src/
│       ├── app/        (public)/ pages + admin/ pages
│       ├── components/ ui/, song/, home/, shared
│       └── lib/        api clients, types, utils
├── data/               local media (songs, images, banners, …, backups)
├── logs/               app.log, error.log, audit.log, access.log
├── scripts/            fetch-fonts.mjs, backup.mjs
└── docs (this + INSTALL/DEPLOYMENT/ADMIN_GUIDE/BACKUP_GUIDE)
```

---

## npm scripts (root)

| Script | What it does |
|--------|--------------|
| `npm run setup` | Install all deps + download Noto fonts |
| `npm run dev` | Run API + web together (dev) |
| `npm run dev:api` / `npm run dev:web` | Run one side only |
| `npm run build` | Production build (backend `tsc`, frontend `next build`) |
| `npm start` | Run both in production mode |
| `npm run seed` | Seed sample data + admin |
| `npm test` | Run backend test suite |
| `npm run backup` | Dump DB + copy media into `data/backups/` |
| `npm run fetch-fonts` | (Re)download Noto fonts for PDF rendering |

---

## Key API endpoints

```
GET  /api/health
GET  /api/homepage
GET  /api/songs            ?q=&category=&language=&sort=latest|most_played&page=&limit=
GET  /api/songs/:idOrSlug
GET  /api/songs/:id/stream         (HTTP range / seek)
GET  /api/songs/:id/lyrics
GET  /api/songs/:id/related
GET  /api/songs/:id/comments
POST /api/songs/:id/comments       (CAPTCHA-gated → pending)
GET  /api/songs/:id/download       (lyrics PDF)
GET  /api/categories
GET  /api/captcha

POST /api/admin/login   ·  POST /api/admin/logout  ·  GET /api/admin/me  ·  GET /api/admin/csrf
CRUD /api/admin/songs   ·  /api/admin/lyrics  ·  /api/admin/categories  ·  /api/admin/events
GET  /api/admin/comments       ·  PATCH /api/admin/comments/:id  ·  DELETE …
GET  /api/admin/dashboard/stats
```

All admin write routes require the JWT cookie **and** a CSRF header (`X-CSRF-Token`), and are audit-logged.

---

## Known limitations

- **Lyrics PDF + Indic scripts:** the web UI renders Telugu/Sanskrit/Hindi perfectly. In the
  downloaded **PDF**, Latin/Roman render cleanly but Indic glyphs are limited due to a shaping
  bug in pdfkit's font engine (the PDF never crashes — it falls back safely). A Puppeteer-based
  renderer is the planned fix for fully-shaped Indic PDFs.

See [INSTALL.md](INSTALL.md), [DEPLOYMENT.md](DEPLOYMENT.md), [ADMIN_GUIDE.md](ADMIN_GUIDE.md), [BACKUP_GUIDE.md](BACKUP_GUIDE.md).
