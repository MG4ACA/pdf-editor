/**
 * composables/useTesseract.ts
 * ───────────────────────────
 * Configures Tesseract.js to load ALL assets from the /public folder
 * instead of a CDN — required for a self-hosted VPS with no CDN.
 *
 * VPS setup instructions (run once):
 *   node scripts/download-tesseract-assets.js
 *
 * Expected public folder layout:
 *   /public/workers/tesseract-core.wasm.js
 *   /public/workers/tesseract-core-simd.wasm.js
 *   /public/workers/worker.min.js
 *   /public/lang-data/eng.traineddata.gz
 */

import { ref } from 'vue';
import { useEditorStore } from '~/stores/useEditorStore';

// Tesseract is lazily imported so it is never bundled into the SSR bundle
type TesseractModule = typeof import('tesseract.js');
let Tesseract: TesseractModule | null = null;

export function useTesseract() {
  const store = useEditorStore();
  const isRunning = ref(false);
  const progress = ref(0);

  /**
   * Run OCR on the provided image data URL.
   * Returns the recognised text string.
   */
  async function recognise(imageDataUrl: string, lang = 'eng'): Promise<string> {
    if (isRunning.value) return '';

    isRunning.value = true;
    progress.value = 0;
    store.setLoading(true, 'Running OCR…');

    try {
      // Lazy load Tesseract on the client only
      if (!Tesseract) {
        Tesseract = (await import('tesseract.js')) as unknown as TesseractModule;
      }

      /**
       * ─── Self-Hosting Configuration ──────────────────────────────────────
       *
       * workerPath   – JS file that bootstraps the Tesseract web-worker.
       *                Served from /public/workers/ on your VPS.
       *
       * corePath     – Path to the WASM core (with or without SIMD support).
       *                Tesseract will auto-select SIMD if the browser supports it.
       *
       * langPath     – Directory that contains *.traineddata.gz files.
       *                Download via scripts/download-tesseract-assets.js.
       *
       * These paths are relative to your domain root, e.g.:
       *   https://yourdomain.com/workers/worker.min.js
       * ─────────────────────────────────────────────────────────────────────
       */
      const worker = await Tesseract.createWorker(lang, 1, {
        workerPath: '/workers/worker.min.js', // served from /public/workers/
        corePath: '/workers/tesseract-core-simd.wasm.js',
        langPath: '/lang-data',
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            progress.value = Math.round(m.progress * 100);
          }
        },
        // Disable network fetches – every asset must be local
        cacheMethod: 'none',
      });

      const { data } = await worker.recognize(imageDataUrl);
      await worker.terminate();

      store.setOcrResult(data.text);
      return data.text;
    } finally {
      isRunning.value = false;
      progress.value = 0;
      store.setLoading(false);
    }
  }

  return { recognise, isRunning, progress };
}
