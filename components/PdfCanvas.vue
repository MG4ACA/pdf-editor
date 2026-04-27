<template>
  <div class="relative flex h-full w-full flex-col items-center overflow-auto bg-gray-100 p-4">
    <!-- Loading overlay -->
    <Transition name="fade">
      <div
        v-if="isInitializing"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm"
      >
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"
        />
        <p class="text-sm font-medium text-gray-600">{{ initMessage }}</p>
      </div>
    </Transition>

    <!-- Canvas wrapper – pdf render + fabric overlay are stacked here -->
    <div ref="canvasWrapperRef" class="panel relative shadow-xl" :style="wrapperStyle">
      <!-- Layer 1: pdf.js render target -->
      <canvas ref="pdfCanvasRef" class="block" />

      <!-- Layer 2: Fabric.js annotation overlay.
           The outer div keeps absolute positioning even after Fabric
           inserts its own wrapper div around the inner canvas. -->
      <div ref="fabricOverlayRef" class="absolute inset-0 overflow-hidden">
        <canvas ref="fabricCanvasRef" />
      </div>
    </div>

    <!-- Page navigation -->
    <div v-if="store.hasDocument" class="mt-4 flex items-center gap-3">
      <button
        class="btn-secondary px-3 py-1.5 text-xs"
        :disabled="store.currentPage <= 1"
        @click="prevPage"
      >
        ← Prev
      </button>
      <span class="text-sm text-gray-600">
        Page
        <strong>{{ store.currentPage }}</strong>
        of
        <strong>{{ store.totalPages }}</strong>
      </span>
      <button
        class="btn-secondary px-3 py-1.5 text-xs"
        :disabled="store.currentPage >= store.totalPages"
        @click="nextPage"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PdfCanvas.vue
 * ─────────────
 * Core rendering component.
 *
 * Responsibilities:
 *  1. Accept a PDF File via prop and load it with pdf.js
 *  2. Render the active page to a <canvas> at 2× scale for crisp output
 *  3. Mount a Fabric.js canvas overlay of identical pixel dimensions
 *  4. Expose addText() and beginSignature() to the parent toolbar
 *  5. Persist annotation changes back to the Pinia store
 *  6. Sync fabric objects when the page changes
 */

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { AnnotationObject } from '~/stores/useEditorStore';
import { useEditorStore } from '~/stores/useEditorStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type PdfJsLib = typeof import('pdfjs-dist');
type PdfDocumentProxy = import('pdfjs-dist').PDFDocumentProxy;
type FabricLib = (typeof import('fabric'))['fabric'];

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps<{ file: File | null }>();
const emit = defineEmits<{ (e: 'ready'): void; (e: 'error', msg: string): void }>();

// ─── Store ────────────────────────────────────────────────────────────────────

const store = useEditorStore();

// ─── Refs ─────────────────────────────────────────────────────────────────────

const pdfCanvasRef = ref<HTMLCanvasElement | null>(null);
const fabricCanvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWrapperRef = ref<HTMLDivElement | null>(null);
const fabricOverlayRef = ref<HTMLDivElement | null>(null);

// Library instances (lazy-loaded client-side only)
let pdfLib: PdfJsLib | null = null;
let pdfDoc: PdfDocumentProxy | null = null;
let fabricModule: FabricLib | null = null;
let fabricCanvas: InstanceType<FabricLib['Canvas']> | null = null;

// When true, syncToStore calls skip snapshotting (used during undo/redo canvas rebuild)
let _isSyncing = false;

// Rendered canvas dimensions at CSS pixels (not device pixels)
const canvasWidth = ref(0);
const canvasHeight = ref(0);
const isInitializing = ref(false);
const initMessage = ref('Loading PDF engine…');

// ─── Computed ─────────────────────────────────────────────────────────────────

const wrapperStyle = computed(() => ({
  width: canvasWidth.value ? `${canvasWidth.value}px` : 'auto',
  height: canvasHeight.value ? `${canvasHeight.value}px` : 'auto',
}));

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (props.file) {
    await initEditor(props.file);
  }
});

onUnmounted(() => {
  fabricCanvas?.dispose();
  pdfDoc?.destroy();
});

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch(
  () => props.file,
  async (newFile) => {
    if (newFile) await initEditor(newFile);
  },
);

watch(
  () => store.currentPage,
  async (newPage, oldPage) => {
    if (pdfDoc) {
      // Flush any pending canvas changes for the page we are leaving
      if (fabricCanvas && oldPage) syncToStore(oldPage);
      await renderPage(newPage);
    }
  },
);

watch(
  () => store.activeTool,
  (tool) => {
    applyToolMode(tool);
  },
);

// Update the selected object's colour when the colour picker changes
watch(
  () => store.activeColor,
  (color) => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active) {
      store._snapshot();
      if (active.type === 'i-text' || active.type === 'text') {
        active.set('fill', color);
      } else {
        active.set('stroke', color);
      }
      fabricCanvas.renderAll();
      syncToStore(store.currentPage);
    }
    if (fabricCanvas.isDrawingMode && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = color;
    }
  },
);

// Update the selected text object's font size when the font size selector changes
watch(
  () => store.activeFontSize,
  (size) => {
    if (!fabricCanvas) return;
    const active = fabricCanvas.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'text')) {
      store._snapshot();
      active.set('fontSize', size);
      fabricCanvas.renderAll();
      syncToStore(store.currentPage);
    }
  },
);

// ─── Initialisation ───────────────────────────────────────────────────────────

async function initEditor(file: File) {
  try {
    isInitializing.value = true;
    initMessage.value = 'Loading PDF engine…';

    // Validate file size (25 MB limit)
    const MAX_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      emit('error', 'File exceeds the 25 MB limit. Please choose a smaller PDF.');
      return;
    }

    // Lazy-load pdf.js (client-side only – avoids SSR issues)
    if (!pdfLib) {
      const pdfjsLib = await import('pdfjs-dist');
      // Point worker to locally hosted file (avoids CDN dependency)
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';
      pdfLib = pdfjsLib as unknown as PdfJsLib;
    }

    // Lazy-load Fabric.js (v5 UMD: exports are nested under mod.fabric in Vite/CJS context)
    if (!fabricModule) {
      const mod = await import('fabric');
      // Handle both ESM default and CJS/UMD wrapped shapes
      const anyMod = mod as unknown as Record<string, unknown>;
      fabricModule = (anyMod['fabric'] ?? anyMod['default'] ?? anyMod) as FabricLib;
    }

    initMessage.value = 'Parsing PDF…';
    const arrayBuffer = await file.arrayBuffer();

    // Keep a separate copy for pdf-lib saving; pdf.js.getDocument() transfers
    // (detaches) the ArrayBuffer it receives, making the original unusable.
    const bufferForStore = arrayBuffer.slice(0);

    // Store raw buffer in Pinia (never transmitted to server)
    store.loadDocument({
      fileName: file.name,
      fileSizeBytes: file.size,
      totalPages: 0, // updated below
      rawBuffer: bufferForStore,
    });

    pdfDoc = await pdfLib!.getDocument({ data: arrayBuffer }).promise;

    // Update total pages
    store.document!.totalPages = pdfDoc.numPages;

    initMessage.value = 'Rendering page…';
    await renderPage(1);

    emit('ready');

    // Log edit event to backend (fire-and-forget, no sensitive data)
    logEditEvent('pdf_open').catch(() => {
      /* silently ignore network errors */
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load PDF.';
    emit('error', msg);
  } finally {
    isInitializing.value = false;
  }
}

// ─── Page rendering (pdf.js → canvas image) ──────────────────────────────────

async function renderPage(pageNum: number) {
  if (!pdfDoc || !pdfCanvasRef.value || !fabricModule) return;

  const page = await pdfDoc.getPage(pageNum);
  const SCALE = store.renderScale; // default 2.0 for high-DPI

  const viewport = page.getViewport({ scale: SCALE });

  // Size the pdf canvas
  const pdfCanvas = pdfCanvasRef.value;
  pdfCanvas.width = viewport.width;
  pdfCanvas.height = viewport.height;
  pdfCanvas.style.width = `${viewport.width / SCALE}px`;
  pdfCanvas.style.height = `${viewport.height / SCALE}px`;

  // CSS dimensions used for layout
  canvasWidth.value = viewport.width / SCALE;
  canvasHeight.value = viewport.height / SCALE;

  const ctx = pdfCanvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport }).promise;

  // Initialise or resize the Fabric canvas
  await nextTick();
  await initFabricCanvas(viewport.width / SCALE, viewport.height / SCALE, pageNum);
}

// ─── Fabric.js canvas ────────────────────────────────────────────────────────

async function initFabricCanvas(cssWidth: number, cssHeight: number, page: number) {
  if (!fabricCanvasRef.value || !fabricModule) return;

  if (fabricCanvas) {
    // Remove stale listeners before clearing so they don't fire syncToStore
    // with the old closed-over page number.
    fabricCanvas.off('object:added');
    fabricCanvas.off('object:modified');
    fabricCanvas.off('object:removed');
    fabricCanvas.setDimensions({ width: cssWidth, height: cssHeight });
    fabricCanvas.clear();
  } else {
    // First-time initialisation
    fabricCanvas = new fabricModule.Canvas(fabricCanvasRef.value, {
      width: cssWidth,
      height: cssHeight,
      selection: true,
      preserveObjectStacking: true,
    });

    // Fabric inserts a wrapper div around the canvas element.
    // Force that wrapper to fill our overlay div so events land correctly.
    const fabricContainer = fabricCanvasRef.value?.parentElement;
    if (fabricContainer && fabricOverlayRef.value) {
      fabricContainer.style.position = 'absolute';
      fabricContainer.style.top = '0';
      fabricContainer.style.left = '0';
      fabricContainer.style.width = '100%';
      fabricContainer.style.height = '100%';
    }
  }

  // Re-hydrate saved annotations (no listeners attached yet – safe to add objects)
  const saved = store.annotations.filter((a) => a.page === page);
  for (const annotation of saved) {
    await new Promise<void>((resolve) => {
      fabricModule!.util.enlivenObjects(
        [annotation.fabricJson],
        (objects: fabric.Object[]) => {
          objects.forEach((obj) => fabricCanvas!.add(obj));
          resolve();
        },
        'fabric',
      );
    });
  }

  fabricCanvas.renderAll();

  // Attach listeners AFTER rehydration; use store.currentPage dynamically so
  // navigating pages always syncs to the correct page number.
  fabricCanvas.on('object:modified', () => {
    if (_isSyncing) return;
    store._snapshot();
    syncToStore(store.currentPage);
  });
  fabricCanvas.on('object:added', () => {
    if (_isSyncing) return;
    store._snapshot();
    syncToStore(store.currentPage);
  });
  fabricCanvas.on('object:removed', () => {
    if (_isSyncing) return;
    store._snapshot();
    syncToStore(store.currentPage);
  });

  applyToolMode(store.activeTool);
}

function syncToStore(page: number) {
  if (!fabricCanvas) return;
  _isSyncing = true;
  const objects = fabricCanvas.getObjects();
  const annotations: AnnotationObject[] = objects.map((obj) => ({
    id: ((obj as Record<string, unknown>).annotationId as string) ?? crypto.randomUUID(),
    page,
    type:
      ((obj as Record<string, unknown>).annotationType as AnnotationObject['type']) ?? 'drawing',
    fabricJson: obj.toJSON(['annotationId', 'annotationType']) as Record<string, unknown>,
    createdAt: Date.now(),
  }));
  store.syncAnnotationsForPage(page, annotations);
  _isSyncing = false;
}

/** Reload the fabric canvas objects from the current store annotations (used by undo/redo) */
async function reloadCanvasAnnotations(page: number) {
  if (!fabricCanvas || !fabricModule) return;
  // Remove listeners before clearing so they cannot fire during rebuild
  fabricCanvas.off('object:added');
  fabricCanvas.off('object:modified');
  fabricCanvas.off('object:removed');
  fabricCanvas.clear();
  const saved = store.annotations.filter((a) => a.page === page);
  for (const annotation of saved) {
    await new Promise<void>((resolve) => {
      fabricModule!.util.enlivenObjects(
        [annotation.fabricJson],
        (objects: fabric.Object[]) => {
          objects.forEach((obj) => fabricCanvas!.add(obj));
          resolve();
        },
        'fabric',
      );
    });
  }
  fabricCanvas.renderAll();
  // Re-attach listeners using store.currentPage dynamically
  fabricCanvas.on('object:modified', () => {
    if (_isSyncing) return;
    store._snapshot();
    syncToStore(store.currentPage);
  });
  fabricCanvas.on('object:added', () => {
    if (_isSyncing) return;
    store._snapshot();
    syncToStore(store.currentPage);
  });
  fabricCanvas.on('object:removed', () => {
    if (_isSyncing) return;
    store._snapshot();
    syncToStore(store.currentPage);
  });
}

// ─── Tool mode application ───────────────────────────────────────────────────

// Keep track of canvas event listeners so we can remove them on tool change
function removeToolListeners() {
  fabricCanvas?.off('mouse:down');
}

function applyToolMode(tool: string) {
  if (!fabricCanvas) return;

  // Remove any previous tool-specific listeners
  removeToolListeners();

  // Reset drawing mode
  fabricCanvas.isDrawingMode = false;
  fabricCanvas.selection = true;

  switch (tool) {
    case 'text': {
      // Clicking on the canvas places a text box at the click position
      fabricCanvas.defaultCursor = 'text';
      fabricCanvas.selection = false;
      fabricCanvas.on('mouse:down', (opt) => {
        if (!fabricModule || !fabricCanvas) return;
        // Click on an existing text object → re-enter edit mode
        if (opt.target && (opt.target.type === 'i-text' || opt.target.type === 'text')) {
          fabricCanvas.setActiveObject(opt.target);
          (opt.target as InstanceType<FabricLib['IText']>).enterEditing();
          return;
        }
        // Don't place new text on top of other (non-text) objects
        if (opt.target) return;
        const pointer = fabricCanvas.getPointer(opt.e);
        const iText = new fabricModule.IText('Text here', {
          left: pointer.x,
          top: pointer.y,
          fontSize: store.activeFontSize,
          fill: store.activeColor,
          fontFamily: 'Inter, sans-serif',
          editable: true,
        });
        (iText as Record<string, unknown>).annotationId = crypto.randomUUID();
        (iText as Record<string, unknown>).annotationType = 'text';
        fabricCanvas.add(iText);
        fabricCanvas.setActiveObject(iText);
        fabricCanvas.renderAll();
        iText.enterEditing();
        // Stay on text tool so the font-size picker remains visible
      });
      break;
    }
    case 'draw':
    case 'signature': {
      fabricCanvas.defaultCursor = 'crosshair';
      fabricCanvas.isDrawingMode = true;
      const brush = fabricCanvas.freeDrawingBrush;
      brush.color = tool === 'signature' ? '#111827' : store.activeColor;
      brush.width = tool === 'signature' ? 3 : 2;
      break;
    }
    case 'erase': {
      // Clicking an object deletes it directly
      fabricCanvas.defaultCursor = 'not-allowed';
      fabricCanvas.selection = false;
      fabricCanvas.on('mouse:down', (opt) => {
        if (!fabricCanvas) return;
        const target = opt.target;
        if (target) {
          fabricCanvas.remove(target);
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
        }
      });
      break;
    }
    default: {
      fabricCanvas.defaultCursor = 'default';
      break;
    }
  }
}

// ─── Public API (called by toolbar via template ref) ─────────────────────────

/** Add a text annotation to the Fabric canvas */
function addText(text = 'Text here') {
  if (!fabricCanvas || !fabricModule) return;

  const iText = new fabricModule.IText(text, {
    left: 60,
    top: 60,
    fontSize: store.activeFontSize,
    fill: store.activeColor,
    fontFamily: 'Inter, sans-serif',
    editable: true,
  });

  // Attach metadata for store sync
  (iText as Record<string, unknown>).annotationId = crypto.randomUUID();
  (iText as Record<string, unknown>).annotationType = 'text';

  fabricCanvas.add(iText);
  fabricCanvas.setActiveObject(iText);
  fabricCanvas.renderAll();

  // Enter editing mode immediately
  iText.enterEditing();
  store.setActiveTool('select');
}

/** Begin a free-hand signature drawing session */
function beginSignature() {
  store.setActiveTool('signature');
}

/** Erase / delete the currently selected Fabric object */
function eraseSelected() {
  if (!fabricCanvas) return;
  const active = fabricCanvas.getActiveObject();
  if (active) {
    fabricCanvas.remove(active);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  }
}

/** Download the annotated canvas as a flat PNG (quick export) */
function exportAsImage(): string {
  return fabricCanvas?.toDataURL({ format: 'png', multiplier: 2 }) ?? '';
}

/** Add an uploaded signature image onto the canvas */
async function addSignatureImage(dataUrl: string): Promise<void> {
  if (!fabricCanvas || !fabricModule) return;
  const img = await new Promise<fabric.Image>((resolve) => {
    fabricModule!.Image.fromURL(dataUrl, (image: fabric.Image) => resolve(image));
  });
  // Scale to fit within 40% of the smaller canvas dimension
  const maxDim = Math.min(fabricCanvas.width ?? 300, fabricCanvas.height ?? 200) * 0.4;
  const scaleX = maxDim / (img.width ?? maxDim);
  const scaleY = maxDim / (img.height ?? maxDim);
  const scale = Math.min(scaleX, scaleY);
  img.scale(scale);
  img.set({
    left: ((fabricCanvas.width ?? 300) - (img.width ?? 0) * scale) / 2,
    top: ((fabricCanvas.height ?? 200) - (img.height ?? 0) * scale) / 2,
  });
  (img as Record<string, unknown>).annotationId = crypto.randomUUID();
  (img as Record<string, unknown>).annotationType = 'signature';
  fabricCanvas.add(img);
  fabricCanvas.setActiveObject(img);
  fabricCanvas.renderAll();
}

/** Export the raw pdf.js page canvas as a PNG data-URL (used for OCR) */
function exportPdfPageAsImage(): string {
  return pdfCanvasRef.value?.toDataURL('image/png') ?? '';
}

/** Reload canvas from store annotations (called by parent after undo/redo) */
async function reloadFromStore(): Promise<void> {
  await reloadCanvasAnnotations(store.currentPage);
}

// Expose to parent
defineExpose({
  addText,
  beginSignature,
  eraseSelected,
  exportAsImage,
  reloadFromStore,
  exportPdfPageAsImage,
  addSignatureImage,
});

// ─── Backend event logging ───────────────────────────────────────────────────

async function logEditEvent(action: string) {
  const config = useRuntimeConfig();
  await fetch(`${config.public.apiBase}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
}

// ─── Navigation helpers ───────────────────────────────────────────────────────

function prevPage() {
  store.setCurrentPage(store.currentPage - 1);
}
function nextPage() {
  store.setCurrentPage(store.currentPage + 1);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
