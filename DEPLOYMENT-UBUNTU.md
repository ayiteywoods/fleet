# Deploying NeraFleet on Ubuntu with Nginx

## Why you see 504 Gateway Time-out

Nginx returns **504** when the app it’s proxying to doesn’t respond in time (default is often **60 seconds**). Common causes:

1. **Proxy timeouts too short** – long requests (e.g. Prisma/DB, heavy pages) exceed nginx’s read timeout.
2. **Next.js not running or crashing** – nothing listening on the port nginx proxies to.
3. **App slow to start** – e.g. cold start, DB connection, so the first request times out.

---

## 1. Fix Nginx timeouts (most important for 504)

Edit your site config (e.g. `/etc/nginx/sites-available/nerafleet` or your `server` block):

```nginx
server {
    listen 80;
    server_name your-domain.com;   # or your server IP

    location / {
        proxy_pass http://127.0.0.1:3000;   # Next.js default port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Fix 504: increase timeouts (seconds)
        proxy_connect_timeout 60;
        proxy_send_timeout 120;
        proxy_read_timeout 120;
    }
}
```

Then test and reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 2. Run Next.js so it stays up (PM2)

If the app stops or restarts, nginx will get no response and return 504.

**On low-memory servers (e.g. ~4GB RAM):** use **one instance** and cap Node’s heap so the process is less likely to be OOM-killed. The repo includes `ecosystem.config.cjs` for this.

**Recommended – use the ecosystem file (single instance + memory limit):**

```bash
cd /path/to/nerafleet-app   # e.g. ~/fleet
npm run build
pm2 delete fleet-app 2>/dev/null; pm2 delete next-app 2>/dev/null   # remove old apps if any
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # run the command it prints to start PM2 on boot
```

**Do not** use `-i 2` (multiple instances) on a small box – it doubles memory use and can cause 504s or OOM.

**Manual start (if you prefer not to use the config file):**

```bash
cd /path/to/nerafleet-app
npm run build
NODE_OPTIONS=--max-old-space-size=1536 pm2 start npm --name "fleet-app" -- start
pm2 save
pm2 startup
```

**Useful commands:**

```bash
pm2 status
pm2 logs fleet-app
pm2 restart fleet-app
```

---

## 3. Check that the app is listening

Nginx must proxy to the same port your app uses (e.g. 3000):

```bash
ss -tlnp | grep 3000
# or
curl -I http://127.0.0.1:3000
```

If this fails, the 504 is because the app isn’t running or isn’t on that port.

---

## 4. Environment and database

On the server, ensure:

- `.env` (or equivalent) has `DATABASE_URL` and `JWT_SECRET` set.
- The database is reachable from the server (no firewall blocking PostgreSQL).
- Prisma client is generated: `npx prisma generate` (and migrations if needed: `npx prisma migrate deploy`).

---

## 5. Optional: systemd instead of PM2

If you prefer systemd, create `/etc/systemd/system/nerafleet.service`:

```ini
[Unit]
Description=NeraFleet Next.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/nerafleet-app
Environment=NODE_ENV=production
EnvironmentFile=/path/to/nerafleet-app/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable nerafleet
sudo systemctl start nerafleet
sudo systemctl status nerafleet
```

Use the same `proxy_pass` port in nginx (e.g. 3000 if you didn’t change the default in `package.json`).

---

## Quick checklist

- [ ] Nginx `proxy_read_timeout` (and send/connect) set to 120s (or higher).
- [ ] `proxy_pass` points to `http://127.0.0.1:3000` (or your app port).
- [ ] `nginx -t` passes and nginx was reloaded.
- [ ] Next.js runs under PM2 or systemd and `curl http://127.0.0.1:3000` works.
- [ ] `.env` and database are correct; Prisma generate (and migrate) run on the server.

After these, 504 from nginx should stop unless a single request is genuinely taking longer than the timeout (then increase `proxy_read_timeout` further or optimize that request).

---

## Low memory (e.g. 3–4 GB RAM)

If `free -h` shows little free memory and you see high swap use or `css_killed_work_fn` in logs:

- Run **one** PM2 instance (use `ecosystem.config.cjs`; do **not** use `-i 2`).
- Cap Node heap: the ecosystem file sets `--max-old-space-size=1536` so Node doesn’t use all RAM.
- You can add more swap (e.g. `sudo fallocate -l 4G /swapfile2 && sudo mkswap /swapfile2 && sudo swapon /swapfile2`) to reduce OOM risk, but fixing the app’s memory (single instance + limit) is more important.
- If you have an old PM2 app (e.g. `next-app`) for the same project, remove it: `pm2 delete next-app` so only `fleet-app` is running.
