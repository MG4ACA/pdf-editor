/**
 * scripts/download-tesseract-assets.js
 * ──────────────────────────────────────
 * Run once on the VPS to download all Tesseract.js worker/WASM/language
 * data files into the /public directory so they are served locally.
 *
 * Usage:
 *   node scripts/download-tesseract-assets.js [lang1 lang2 ...]
 *   node scripts/download-tesseract-assets.js eng fra deu
 *
 * Default language: eng
 */

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const TESSERACT_VERSION = '5.0.3';
const BASE_URL = `https://cdn.jsdelivr.net/npm/tesseract.js@${TESSERACT_VERSION}/dist`;
const CORE_URL = `https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0`;
const LANG_URL = 'https://tessdata.projectnaptha.com/4.0.0_fast';

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const WORKERS_DIR = path.join(PUBLIC_DIR, 'workers');
const LANG_DIR = path.join(PUBLIC_DIR, 'lang-data');

const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['eng'];

const files = [
  { url: `${BASE_URL}/worker.min.js`, dest: path.join(WORKERS_DIR, 'worker.min.js') },
  {
    url: `${CORE_URL}/tesseract-core.wasm.js`,
    dest: path.join(WORKERS_DIR, 'tesseract-core.wasm.js'),
  },
  {
    url: `${CORE_URL}/tesseract-core-simd.wasm.js`,
    dest: path.join(WORKERS_DIR, 'tesseract-core-simd.wasm.js'),
  },
  ...langs.map((lang) => ({
    url: `${LANG_URL}/${lang}.traineddata.gz`,
    dest: path.join(LANG_DIR, `${lang}.traineddata.gz`),
  })),
];

[WORKERS_DIR, LANG_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          return download(response.headers.location, dest).then(resolve).catch(reject);
        }
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`  ✓ ${path.basename(dest)}`);
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

(async () => {
  console.log(`Downloading ${files.length} Tesseract assets…`);
  for (const { url, dest } of files) {
    try {
      await download(url, dest);
    } catch (err) {
      console.error(`  ✗ Failed: ${url}\n    ${err.message}`);
    }
  }
  console.log('\nDone. Assets are in /public/workers/ and /public/lang-data/');
})();
