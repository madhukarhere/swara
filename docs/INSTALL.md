# INSTALL — Swara

Install and run Swara locally on **Ubuntu 24.04**, **Windows 11**, or **macOS**. No Docker.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | **22 LTS** | Next.js 15 needs ≥ 18.18; this project targets 22 |
| npm | 10+ | ships with Node 22 |
| MongoDB Community | 5.0+ | running locally on `27017` |
| MongoDB Database Tools | any | provides `mongodump`/`mongorestore` for backups |

Verify:

```bash
node -v      # v22.x
npm -v
mongod --version
mongosh --eval "db.runCommand({ ping: 1 })"
```

---

## 1. Install Node.js 22

**Ubuntu 24.04 / macOS (nvm):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart your shell, then:
nvm install 22
nvm use 22
```

**Windows 11:** install from <https://nodejs.org> (LTS 22) or use `nvm-windows`.

> The repo includes an `.nvmrc` pinned to `22`, so `nvm use` picks the right version.

---

## 2. Install MongoDB Community

- **Ubuntu 24.04:** follow the official MongoDB 7.0 apt guide, then `sudo systemctl enable --now mongod`.
- **macOS (Homebrew):** `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
- **Windows 11:** install the MongoDB Community MSI and run it as a Windows Service.

Also install the **MongoDB Database Tools** (for `mongodump`) — bundled on Windows/macOS installers, `sudo apt install mongodb-database-tools` on Ubuntu.

---

## 3. Get the code & install dependencies

```bash
cd swara
npm run setup        # root + backend + frontend deps, plus Noto fonts for PDF
```

`setup` runs `install:all` and `fetch-fonts`. (Font download needs internet **once**; the app
runs fully offline afterward. If it fails, lyrics PDFs still generate — Latin only.)

---

## 4. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit **`backend/.env`** — at minimum change the secrets and admin password:

```ini
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/swara
JWT_SECRET=<long-random-string>
CAPTCHA_SECRET=<another-random-string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your-strong-password>
CORS_ORIGIN=http://localhost:3000
```

`frontend/.env.local` only needs the API target (defaults are fine for local):

```ini
API_PROXY_TARGET=http://localhost:4000
API_INTERNAL_URL=http://localhost:4000
```

---

## 5. Seed the database

```bash
npm run seed
```

Creates the admin user and devotional sample content (categories, songs with Telugu/Sanskrit/
English/Roman lyrics, comments, quotes, a banner, calendar festivals, homepage settings, and a
sample video/article/event). Re-running it **wipes and reseeds**.

---

## 6. Run

**Development (hot reload):**
```bash
npm run dev          # API on :4000, web on :3000
```

**Production-style:**
```bash
npm run build
npm start
```

Open **http://localhost:3000**. Admin: **http://localhost:3000/admin** (`admin` / your password).

---

## 7. Verify

```bash
curl http://localhost:4000/api/health           # {"status":"ok",...}
curl "http://localhost:4000/api/songs?limit=1"  # one song
npm test                                         # backend test suite (uses swara_test DB)
```

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `npm` errors about Node version | You're on old Node — `nvm use 22` (the shell default may differ). |
| Homepage says "Swara is starting up…" | API not reachable — ensure `npm run dev:api` is up on :4000 and Mongo is running. |
| `MongooseServerSelectionError` | MongoDB isn't running / wrong `MONGODB_URI`. |
| Admin login fails right after seed | Use the `ADMIN_*` values from `backend/.env` that were active **when you seeded**. |
| Lyrics PDF has boxes for Telugu | Expected (see README “Known limitations”); run `npm run fetch-fonts` to bundle Noto. |
| Ports busy | Change `PORT` (backend) and `-p` in `frontend` dev script / `API_PROXY_TARGET`. |
