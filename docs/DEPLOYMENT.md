# DEPLOYMENT — Vijayavipanchi

Run Vijayavipanchi in production on a single Linux host (Ubuntu 24.04) without Docker. The same
two-process model applies on Windows 11 (use NSSM or Task Scheduler instead of systemd).

## Topology

```
            ┌──────────────┐        ┌──────────────┐        ┌────────────┐
 Internet → │  Nginx :443  │  ───→  │ Next.js :3000│  ───→  │ Express :4000 │ ───→ MongoDB :27017
            │ (TLS, proxy) │        │  (web/SSR)   │  proxy │   (API)       │
            └──────────────┘        └──────────────┘        └────────────┘
                                                          local files in /data
```

Next.js proxies `/api` and `/media` to Express, so the browser is same-origin.

---

## 1. Build

```bash
npm run setup
cp backend/.env.example backend/.env      # then edit (see hardening below)
cp frontend/.env.example frontend/.env.local
npm run build                              # backend → dist/, frontend → .next/
npm run seed                               # first time only
```

---

## 2. Harden `backend/.env`

```ini
NODE_ENV=production
JWT_SECRET=<32+ random chars>
CAPTCHA_SECRET=<random>
ADMIN_PASSWORD=<strong, unique>
COOKIE_SECURE=true                 # serve over HTTPS
CORS_ORIGIN=https://your-domain.tld
MAX_UPLOAD_MB=50
DATA_DIR=/var/lib/swara/data       # persistent, backed-up location
LOG_DIR=/var/log/swara
```

Set `frontend/.env.local`:
```ini
API_PROXY_TARGET=http://127.0.0.1:4000
API_INTERNAL_URL=http://127.0.0.1:4000
```

---

## 3. Run with systemd

`/etc/systemd/system/swara-api.service`:
```ini
[Unit]
Description=Vijayavipanchi API
After=network.target mongod.service

[Service]
WorkingDirectory=/opt/swara/backend
ExecStart=/usr/bin/node dist/index.js
Environment=NODE_ENV=production
EnvironmentFile=/opt/swara/backend/.env
Restart=always
User=swara

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/swara-web.service`:
```ini
[Unit]
Description=Vijayavipanchi Web
After=network.target swara-api.service

[Service]
WorkingDirectory=/opt/swara/frontend
ExecStart=/usr/bin/npx next start -p 3000
Environment=NODE_ENV=production
EnvironmentFile=/opt/swara/frontend/.env.local
Restart=always
User=swara

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now swara-api swara-web
```

> Prefer **pm2**? `pm2 start dist/index.js --name swara-api` and
> `pm2 start "npx next start -p 3000" --name swara-web`, then `pm2 save && pm2 startup`.

---

## 4. Nginx reverse proxy + TLS

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.tld;
  ssl_certificate     /etc/letsencrypt/live/your-domain.tld/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.tld/privkey.pem;

  client_max_body_size 60m;          # allow audio/file uploads

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
server { listen 80; server_name your-domain.tld; return 301 https://$host$request_uri; }
```

Use Certbot for the certificate. Audio streaming uses HTTP range requests, which Nginx + Next handle out of the box.

---

## 5. Security checklist

- [ ] `NODE_ENV=production`, `COOKIE_SECURE=true`, HTTPS only
- [ ] Strong, unique `JWT_SECRET`, `CAPTCHA_SECRET`, `ADMIN_PASSWORD`
- [ ] MongoDB bound to `127.0.0.1` (or auth enabled) — not exposed publicly
- [ ] `data/` and `logs/` on a backed-up volume, owned by the `swara` user
- [ ] Firewall: only 80/443 public; 3000/4000/27017 local
- [ ] Rate limiting is on by default (login, comments, global)
- [ ] Schedule backups (see BACKUP_GUIDE.md)

---

## 6. Logs

Winston writes to `LOG_DIR`: `app.log`, `error.log`, `audit.log`, `access.log` (rotated at 5 MB).
For OS-level rotation add `/etc/logrotate.d/swara` if desired. View admin actions in `audit.log`.

---

## 7. Updating

```bash
git pull
npm run setup
npm run build
sudo systemctl restart swara-api swara-web
```

Model/index changes apply automatically on boot (Mongoose autoIndex). Back up before upgrading.
