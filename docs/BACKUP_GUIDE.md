# BACKUP GUIDE — Vijayavipanchi

Vijayavipanchi keeps **everything on the local disk**: data in MongoDB and media files under `data/`.
A complete backup therefore needs both the database dump and the media tree.

## What to back up

| Item | Location |
|------|----------|
| Database | MongoDB `swara` database |
| Media (audio, covers, banners, article images, PDFs, docs) | `data/songs`, `data/images`, `data/banners`, `data/article_images`, `data/lyrics_pdfs`, `data/documents`, `data/videos`, `data/profile_images` |
| Config | `backend/.env` (store securely & separately — it has secrets) |

> `data/backups/` itself is **not** re-backed-up by the script.

---

## One-command backup

```bash
npm run backup
```

This runs `scripts/backup.mjs`, which:
1. `mongodump`s the database into `data/backups/<timestamp>/db/`
2. copies the media folders into `data/backups/<timestamp>/media/`

Output example:
```
Vijayavipanchi backup → /…/data/backups/2026-06-17T08-36-26-712Z
  ✓ database dumped
  ✓ media copied (19 files)
Restore DB with:  mongorestore --uri "<uri>" --drop /…/db
```

Override defaults with env vars:
```bash
MONGODB_URI="mongodb://127.0.0.1:27017/swara" DATA_DIR="/var/lib/swara/data" npm run backup
```

Requires the **MongoDB Database Tools** (`mongodump`) on PATH. If missing, media is still copied and
a clear error is printed for the DB step.

---

## Restore

**Database:**
```bash
mongorestore --uri "mongodb://127.0.0.1:27017/swara" --drop \
  data/backups/<timestamp>/db/swara
```
`--drop` replaces existing collections. Omit it to merge.

**Media:** copy the folders back into your live `data/` directory:
```bash
cp -r data/backups/<timestamp>/media/* data/
```
(Windows: `xcopy /E /I` or `robocopy`.)

Restart the app afterward.

---

## Manual equivalents

```bash
# DB only
mongodump --uri "mongodb://127.0.0.1:27017/swara" --out ./mybackup/db

# Media only (rsync mirror, per the spec)
rsync -av --exclude backups ./data/ ./mybackup/media/
```

---

## Scheduling

**Linux (cron)** — nightly at 02:00, keep the repo's env:
```cron
0 2 * * * cd /opt/swara && /usr/bin/npm run backup >> /var/log/swara/backup.log 2>&1
```

**Linux (systemd timer)** — create `swara-backup.service` (Type=oneshot running `npm run backup`)
plus a `swara-backup.timer` with `OnCalendar=*-*-* 02:00:00`.

**Windows 11 (Task Scheduler)** — daily action: `npm run backup` in the repo directory.

---

## Retention & off-site

`data/backups/` grows over time — prune old folders on a schedule, e.g.:
```bash
find data/backups -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +
```
For disaster recovery, also copy backup folders to a separate disk/host (e.g. a second `rsync`
target). The app needs no internet for backups — they are entirely local.
