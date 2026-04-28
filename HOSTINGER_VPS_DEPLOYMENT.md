# 🗂️ PDF Editor — Deployment Guide

## App: `pdfeditor.lumicore-labs.com`

**Stack:** Nuxt 3 (SSR) + Express.js + MySQL + Fabric.js + Tesseract.js  
**Ports:** Nuxt SSR → `3010` · Express API → `3011`  
**PM2 names:** `pdf-editor-nuxt` · `pdf-editor-api`  
**Deploy path:** `/var/www/pdf-editor`

> ⚠️ **Key difference from Vue SPA apps:** Nuxt runs as a live Node.js process (not static files).
> Nginx proxies ALL traffic to it — do NOT use `root` / `try_files` for the frontend.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Hostinger VPS KVM1                  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Nginx  (port 80 / 443)                        │  │
│  │  pdfeditor.lumicore-labs.com                   │  │
│  └──────────┬──────────────────┬──────────────────┘  │
│             │  /api/*          │  /*                 │
│  ┌──────────▼──────────┐  ┌───▼───────────────────┐ │
│  │  Express API        │  │  Nuxt 3 SSR server    │ │
│  │  port 3011          │  │  port 3010            │ │
│  │  (event logging)    │  │  (full app + PDF UI)  │ │
│  └──────────┬──────────┘  └───────────────────────┘ │
│             │                                        │
│  ┌──────────▼──────────┐                            │
│  │  MySQL 8             │                           │
│  │  database: pdf_editor│                           │
│  └──────────────────────┘                           │
└──────────────────────────────────────────────────────┘
```

---

## 🗄️ Step 1: MySQL Database

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE pdf_editor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pdf_editor_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT SELECT, INSERT, CREATE ON pdf_editor.* TO 'pdf_editor_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> The Express server auto-creates the `edit_events` table on first start — no schema import needed.

---

## 📥 Step 2: Clone Repository

```bash
sudo mkdir -p /var/www/pdf-editor
sudo chown -R $USER:$USER /var/www/pdf-editor
cd /var/www/pdf-editor
git clone https://github.com/MG4ACA/pdf-editor.git .
```

---

## 📦 Step 3: Install & Build

```bash
# Install all deps (including devDependencies needed for Nuxt build)
npm install

# Build Nuxt for production — outputs to .output/
npm run build
```

> The Tesseract workers and language data (`public/workers/`, `public/lang-data/`) are committed
> to the repo — no extra download step needed on the server.

---

## ⚙️ Step 4: Set DB Password in PM2 Config

```bash
nano /var/www/pdf-editor/ecosystem.config.cjs
```

Find and replace `CHANGE_ME` with your real DB password:

```js
DB_PASSWORD: 'YourStrongPassword123!',
```

---

## 🚀 Step 5: Start with PM2

```bash
cd /var/www/pdf-editor

# First-time start
pm2 start ecosystem.config.cjs --env production

# Save so processes survive reboots
pm2 save

# Register PM2 startup (run the command it prints)
pm2 startup
```

Verify both processes are online:

```bash
pm2 status
# Should show: pdf-editor-nuxt (online) + pdf-editor-api (online)

# Quick health checks
curl http://localhost:3010             # should return HTML
curl http://localhost:3011/api/health  # should return {"status":"ok"}
```

---

## 🌐 Step 6: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/pdf-editor
```

Paste:

```nginx
upstream pdf_nuxt {
    server localhost:3010;
    keepalive 32;
}

upstream pdf_api {
    server localhost:3011;
    keepalive 32;
}

server {
    listen 80;
    server_name pdfeditor.lumicore-labs.com www.pdfeditor.lumicore-labs.com;

    # Allow large static assets (Tesseract WASM ~4.5 MB each)
    client_max_body_size 30m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API → Express
    location /api/ {
        proxy_pass http://pdf_api/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Static assets — long cache
    location ~* \.(js|css|woff2?|ttf|eot|ico|png|jpg|svg|gz|wasm\.js)$ {
        proxy_pass http://pdf_nuxt;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Everything else → Nuxt SSR
    location / {
        proxy_pass http://pdf_nuxt;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/pdf-editor-access.log;
    error_log  /var/log/nginx/pdf-editor-error.log;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pdf-editor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Step 7: SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d pdfeditor.lumicore-labs.com -d www.pdfeditor.lumicore-labs.com
sudo certbot renew --dry-run
```

---

## ✅ Step 8: Verify

```bash
pm2 status
curl -I https://pdfeditor.lumicore-labs.com
curl https://pdfeditor.lumicore-labs.com/api/health
```

Open in browser: **https://pdfeditor.lumicore-labs.com**

---

## 🔄 Deploying Updates

```bash
cd /var/www/pdf-editor
bash deploy.sh
```

`deploy.sh` does: `git pull` → `npm install` → `npm run build` → `pm2 reload` both processes.

---

## 🛠️ Useful Commands

```bash
# Logs
pm2 logs pdf-editor-nuxt
pm2 logs pdf-editor-api
sudo tail -f /var/log/nginx/pdf-editor-error.log

# Restart a process
pm2 restart pdf-editor-nuxt
pm2 restart pdf-editor-api

# Check both ports are listening
sudo ss -tlnp | grep -E '3010|3011'

# 502 fix — processes not running
pm2 start ecosystem.config.cjs --env production

# Database backup
mysqldump -u pdf_editor_user -p pdf_editor > ~/backups/pdf_editor_$(date +%Y%m%d).sql
```

---

## 🐛 Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| 502 Bad Gateway | PM2 processes down | `pm2 status` → `pm2 start ecosystem.config.cjs --env production` |
| Blank page / JS errors | Wrong `NUXT_PUBLIC_API_BASE` | Check `ecosystem.config.cjs`, `pm2 reload pdf-editor-nuxt` |
| API returns 500 | DB password wrong | Check `DB_PASSWORD` in `ecosystem.config.cjs`, `pm2 logs pdf-editor-api` |
| WASM files 404 | Nginx static location missing `wasm.js` | Verify the `location ~* \.(…wasm\.js)$` block is present |
| OCR fails silently | `eng.traineddata.gz` not in repo | Run `ls public/lang-data/` on server — file must exist |
| Port conflict | Another app on 3010/3011 | `sudo ss -tlnp \| grep -E '3010\|3011'` — adjust ports in ecosystem config |
