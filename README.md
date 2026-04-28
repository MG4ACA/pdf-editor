# Free PDF Editor

A professional, SEO-optimised, client-side-first PDF editor built with **Nuxt 3**, **Fabric.js**, **pdf.js**, **pdf-lib**, and **Tesseract.js**.

---

## Features

### Editing tools

| Tool          | Description                                                                      |
| ------------- | -------------------------------------------------------------------------------- |
| **Select**    | Click to select, drag to move, handles to resize/rotate any annotation           |
| **Text**      | Click anywhere on the canvas to place editable text; choose font size and colour |
| **Draw**      | Freehand pencil brush with adjustable size (1–40 px) and colour                  |
| **Signature** | Dedicated signature brush (thin, dark ink) or upload a signature image           |
| **Erase**     | Click any annotation to delete it                                                |

### Canvas & view

- Zoom in / out with the top-bar controls or **Ctrl+Scroll** (25 % → 400 %)
- Colour picker applies instantly to new annotations and updates the selected object live
- Brush-size slider visible in the top bar whenever draw / signature tool is active
- Font-size input visible in the top bar whenever text tool is active

### Document

- Drag-and-drop or file-picker upload (PDF, max 25 MB)
- pdf.js rendering at **2× resolution** for crisp HiDPI display
- Multi-page navigation; all pages are preserved on save
- **Save / export** — annotations from every page are flattened onto the PDF via pdf-lib and downloaded

### History

- **50-step undo / redo** (`Ctrl+Z` / `Ctrl+Y`)
- **Ctrl+S** to save at any time

### OCR

- Tesseract.js v5 runs entirely in the browser — no data leaves the device
- Workers and English language model served from `/public` (zero CDN dependency)
- Results shown in a collapsible sidebar panel with a one-click Copy button

---

### 1. Clone & install

```bash
git clone <repo>
cd pdf-editor
cp .env.example .env          # fill in DB credentials
npm install
```

### 2. Provision MySQL

```bash
mysql -u root -p < scripts/mysql-setup.sql
```

### 3. Download self-hosted Tesseract & pdf.js worker assets

```bash
# Downloads workers + English language data into /public
node scripts/download-tesseract-assets.js

# Copy the pdf.js worker (done automatically by the build, or manually):
# node_modules/pdfjs-dist/build/pdf.worker.min.js → public/workers/pdf.worker.min.js
```

### 4. Development

```bash
# Terminal 1 – Nuxt frontend (port 3000)
npm run dev

# Terminal 2 – Express API (port 3001)
npm run server:dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Production build

```bash
npm run build
node .output/server/index.mjs &   # Nuxt SSR server
npm run server:start &             # Express API
```

---

## Project Structure

```
pdf-editor/
├── app.vue
├── nuxt.config.ts
├── tailwind.config.js
│
├── assets/
│   └── css/main.css
│
├── components/
│   ├── AppHeader.vue
│   ├── EditorToolbar.vue
│   ├── FeatureCard.vue
│   ├── PdfCanvas.vue          ← Core rendering component
│   ├── ToolButton.vue
│   └── Icon*.vue
│
├── composables/
│   ├── usePdfSave.ts          ← pdf-lib save + download
│   └── useTesseract.ts        ← Self-hosted OCR
│
├── layouts/
│   ├── default.vue
│   └── editor.vue
│
├── pages/
│   ├── index.vue              ← SEO landing page
│   └── editor.vue             ← Full editor UI
│
├── stores/
│   └── useEditorStore.ts      ← Pinia store (undo/redo, annotations, tools)
│
├── server/                    ← Express API (separate Node process)
│   ├── index.js
│   ├── db/connection.js
│   └── routes/events.js
│
├── scripts/
│   ├── mysql-setup.sql
│   └── download-tesseract-assets.js
│
└── public/
    └── workers/               ← pdf.worker.min.js + Tesseract workers (after setup)
        lang-data/             ← Tesseract language data (after setup)
```

---

## Architecture Notes

| Concern          | Decision                                                                            |
| ---------------- | ----------------------------------------------------------------------------------- |
| PDF rendering    | pdf.js renders each page to a `<canvas>` at **2× scale** for crisp high-DPI output  |
| Annotation layer | Fabric.js canvas is positioned **absolutely** over the pdf.js canvas, pixel-perfect |
| State            | Pinia `useEditorStore` owns all document state, annotations, and undo history       |
| Undo/Redo        | Snapshot-based (up to 50 entries); stored as serialised Fabric JSON                 |
| File privacy     | `ArrayBuffer` is kept in Pinia state in RAM; **never** sent to the server           |
| Backend          | Express logs only the action type + masked IP — no file content, no filenames       |
| OCR              | Tesseract workers + language data served from `/public` — zero CDN dependency       |
| File limit       | 25 MB enforced client-side before `getDocument()` is called                         |

---

## Security

- Helmet + CORS (allow-list) on the Express server
- Rate limiting: 100 requests / 15 min per IP
- IP masking before any DB insert (last octet removed)
- `express.json({ limit: '10kb' })` — prevents large body uploads
- Only a fixed allowlist of action strings is accepted by the events endpoint
- No user data, PDF content, or filenames are ever stored server-side
