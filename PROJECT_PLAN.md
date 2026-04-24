# Free PDF Editor — Project Plan

## Overview
A browser-based PDF editor built with **Nuxt 3 (SSR)**, **Tailwind CSS**, **Pinia**, **Fabric.js**, and a lightweight **Express.js** API backend. All editing is client-side; the backend only logs anonymised events to MySQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Nuxt 3 (SSR) |
| Styling | Tailwind CSS + @tailwindcss/typography |
| State management | Pinia |
| PDF rendering | pdf.js (2× scale) |
| PDF saving | pdf-lib |
| Annotation canvas | Fabric.js v5 |
| OCR | Tesseract.js v5 (self-hosted assets) |
| API server | Express.js (port 3002) |
| Database | MySQL 8 (event logging only) |

---

## Project Structure

```
pdf-editor/
├── assets/css/main.css          # Tailwind layers + component classes
├── components/
│   ├── AppHeader.vue
│   ├── EditorToolbar.vue        # Tool sidebar (text, draw, sign, erase, OCR)
│   ├── FeatureCard.vue
│   ├── PdfCanvas.vue            # Core: pdf.js + Fabric.js canvas
│   ├── ToolButton.vue
│   ├── IconUpload.vue
│   ├── IconUndo.vue
│   ├── IconRedo.vue
│   └── IconSave.vue
├── composables/
│   ├── usePdfSave.ts            # pdf-lib export + browser download
│   └── useTesseract.ts          # Self-hosted OCR (Tesseract.js v5)
├── layouts/
│   ├── default.vue              # Header + footer
│   └── editor.vue               # Full-height, no footer
├── pages/
│   ├── index.vue                # SEO landing page
│   └── editor.vue               # Main editor UI
├── public/
│   ├── workers/
│   │   ├── pdf.worker.min.js    # pdf.js web worker
│   │   ├── worker.min.js        # Tesseract.js web worker
│   │   ├── tesseract-core.wasm.js
│   │   └── tesseract-core-simd.wasm.js
│   └── lang-data/
│       └── eng.traineddata.gz   # English OCR model
├── scripts/
│   ├── download-tesseract-assets.js
│   └── mysql-setup.sql
├── server/
│   ├── index.js                 # Express app (helmet, CORS, rate-limit)
│   ├── db/connection.js         # MySQL2 pool + auto-create table
│   └── routes/events.js         # POST /api/events
├── stores/
│   └── useEditorStore.ts        # Pinia store (document, annotations, history)
├── app.vue
├── nuxt.config.ts
├── tailwind.config.js
├── .env.example
└── PROJECT_PLAN.md
```

---

## Features

### Core Editing (Client-side)
- [x] PDF upload (drag-and-drop + file picker, 25 MB limit)
- [x] PDF rendering via pdf.js at 2× resolution
- [x] Multi-page navigation (previous / next)
- [x] Text annotation tool (Fabric.js IText)
- [x] Freehand drawing tool (Fabric.js pencil brush)
- [x] Signature tool (freehand on canvas)
- [x] Erase selected annotation
- [x] Colour picker for annotations
- [x] Font size selector
- [x] Undo / Redo (50-step snapshot history)
- [x] Save / export — flatten annotations onto PDF via pdf-lib and download
- [x] Keyboard shortcuts: `Ctrl+Z` undo, `Ctrl+Y` redo, `Ctrl+S` save

### OCR
- [x] Tesseract.js v5 self-hosted (no external API calls)
- [x] OCR assets served from `/public` (worker, core WASM, eng model)
- [x] Progress indicator during recognition
- [x] Result displayed in editor sidebar

### Backend API (Express.js)
- [x] `POST /api/events` — log edit actions (anonymised IP)
- [x] `GET /api/health` — health check endpoint
- [x] Helmet security headers
- [x] CORS allowlist via `ALLOWED_ORIGINS` env var
- [x] Rate limiting (100 requests / 15 min per IP)
- [x] Request body size limit (10 KB)
- [x] Morgan HTTP request logging

### Database (MySQL)
- [x] `edit_events` table auto-created on server startup
- [x] Columns: `id`, `action`, `masked_ip`, `created_at`
- [x] Indexes on `action` and `created_at`
- [x] Dedicated `pdf_editor_user` with least-privilege grants

### Security
- [x] No file uploads to server — fully client-side processing
- [x] IP masking (last octet/group replaced with `xxx`)
- [x] Action validation against allowlist (`ALLOWED_ACTIONS`)
- [x] Named placeholders (SQL injection prevention)
- [x] `express-rate-limit` (DoS mitigation)
- [x] Helmet CSP + security headers
- [x] `.env` secrets never committed (`.gitignore`)

### SEO & UX
- [x] Landing page with hero, features grid, and prose copy
- [x] `useSeoMeta` configured (title, description, OG tags)
- [x] Responsive layout (Tailwind)
- [x] Loading states + error toasts
- [x] Sidebar toggle for small screens

---

## Setup Checklist

### Prerequisites
- [ ] Node.js 18+
- [ ] MySQL 8+
- [ ] npm 9+

### One-time Setup
- [x] `npm install` — install all dependencies
- [x] Copy `.env.example` → `.env` and fill in DB credentials
- [x] Run MySQL setup: `Get-Content scripts/mysql-setup.sql | mysql -u root -p`
- [x] Grant CREATE privilege: `GRANT SELECT, INSERT, CREATE ON pdf_editor.* TO 'pdf_editor_user'@'localhost';`
- [x] Download Tesseract assets: `node scripts/download-tesseract-assets.js`
- [x] Copy pdf.js worker: `Copy-Item node_modules/pdfjs-dist/build/pdf.worker.min.js public/workers/pdf.worker.min.js`

### Running the App
- [ ] Start Express API: `node server/index.js` (port 3002)
- [ ] Start Nuxt dev: `npm run dev` (port 3000)
- [ ] Open browser: `http://localhost:3000`

### Production Build
- [ ] `npm run build` — build Nuxt app
- [ ] `npm run preview` — preview production build
- [ ] Set `NODE_ENV=production` and configure `ALLOWED_ORIGINS` in `.env`
- [ ] Use a process manager (PM2) for both Express and Nuxt
- [ ] Configure reverse proxy (Nginx/Caddy) to unify ports

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `pdf_editor` |
| `DB_USER` | DB username | `pdf_editor_user` |
| `DB_PASSWORD` | DB password | — |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `PORT` | Express port | `3002` |

---

## Pending / Future Improvements

- [ ] Page thumbnail sidebar for quick navigation
- [ ] Image stamp / insert image tool
- [ ] Highlight / underline text tool
- [ ] PDF password protection support
- [ ] Dark mode
- [ ] Mobile touch support for Fabric.js canvas
- [ ] Unit tests (Vitest) for composables and store
- [ ] E2E tests (Playwright)
- [ ] Docker Compose setup for MySQL + API
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Analytics dashboard for logged events
