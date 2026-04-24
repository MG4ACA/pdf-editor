/**
 * composables/usePdfSave.ts
 * ──────────────────────────
 * Uses pdf-lib to:
 *  1. Flatten annotations (export canvas as image, embed into PDF page)
 *  2. Write custom document metadata
 *  3. Trigger browser download of the modified PDF
 */

import { useEditorStore } from '~/stores/useEditorStore';

type FabricModule = typeof import('fabric');

export function usePdfSave() {
  const store = useEditorStore();

  /**
   * Save the current PDF with annotations burned in.
   * @param canvasExportFn  Function that returns a PNG data URL from Fabric
   */
  async function saveAnnotatedPdf(canvasExportFn: () => string): Promise<void> {
    if (!store.document?.rawBuffer) {
      throw new Error('No PDF loaded.');
    }

    store.setLoading(true, 'Saving PDF…');

    try {
      const { PDFDocument, rgb } = await import('pdf-lib');

      // Load the original PDF bytes
      const pdfDoc = await PDFDocument.load(store.document.rawBuffer);

      // Embed metadata
      pdfDoc.setTitle(store.document.fileName.replace(/\.pdf$/i, '') + ' (edited)');
      pdfDoc.setProducer('Free PDF Editor – https://yoursite.com');
      pdfDoc.setModificationDate(new Date());

      // Get the annotation canvas PNG and embed it on page 1
      const pageIndex = store.currentPage - 1;
      const pages = pdfDoc.getPages();
      const targetPage = pages[pageIndex];

      if (targetPage) {
        const annotationDataUrl = canvasExportFn();
        if (annotationDataUrl && annotationDataUrl !== 'data:,') {
          // Strip data URL prefix to get raw base64
          const base64 = annotationDataUrl.split(',')[1];
          const pngBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

          const pngImage = await pdfDoc.embedPng(pngBytes);
          const { width, height } = targetPage.getSize();

          // Draw annotation image over the full page (transparent where no annotations)
          targetPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width,
            height,
            opacity: 1,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      triggerDownload(pdfBytes, store.document.fileName.replace(/\.pdf$/i, '') + '_edited.pdf');

      // Log save event (fire-and-forget)
      const config = useRuntimeConfig();
      fetch(`${config.public.apiBase}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pdf_saved' }),
      }).catch(() => {});
    } finally {
      store.setLoading(false);
    }
  }

  function triggerDownload(bytes: Uint8Array, fileName: string) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { saveAnnotatedPdf };
}
