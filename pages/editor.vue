<template>
  <!-- Uses the editor layout (full-height, no footer) -->
  <ClientOnly>
    <div class="flex h-full w-full overflow-hidden">
      <!-- Left: Toolbar -->
      <EditorToolbar
        @file-selected="onFileSelected"
        @ocr="runOcr"
        @save="savePdf"
        @undo="undoAction"
        @redo="redoAction"
        @signature-image="onSignatureImage"
      />

      <!-- Centre: Canvas area -->
      <main class="relative flex flex-1 flex-col overflow-hidden">
        <!-- Top action bar -->
        <div class="flex h-10 items-center justify-between border-b border-gray-200 bg-white px-4">
          <span class="truncate text-sm text-gray-600">
            {{ store.document?.fileName ?? 'No file open' }}
          </span>

          <div class="flex items-center gap-2">
            <!-- Font size (only shown when text tool is active) -->
            <template v-if="store.activeTool === 'text'">
              <label class="text-xs text-gray-500">Size</label>
              <input
                type="number"
                min="6"
                max="96"
                :value="store.activeFontSize"
                class="w-14 rounded border border-gray-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                @change="store.setActiveFontSize(Number(($event.target as HTMLInputElement).value))"
              />
              <span class="text-xs text-gray-400">Click on canvas to place text</span>
            </template>

            <!-- Draw / Signature brush size -->
            <template v-if="store.activeTool === 'draw' || store.activeTool === 'signature'">
              <label class="text-xs text-gray-500">Brush</label>
              <input
                type="range"
                min="1"
                max="40"
                :value="store.activeBrushSize"
                class="w-24 accent-brand-600"
                @input="store.setActiveBrushSize(Number(($event.target as HTMLInputElement).value))"
              />
              <span class="w-6 text-center text-xs text-gray-600">{{ store.activeBrushSize }}</span>
            </template>

            <!-- Erase hint -->
            <template v-if="store.activeTool === 'erase'">
              <span class="text-xs text-gray-400">Click an object to delete it</span>
            </template>

            <!-- Zoom controls -->
            <template v-if="store.hasDocument">
              <div class="mx-2 h-5 w-px bg-gray-200" />
              <button
                class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:opacity-40"
                :disabled="store.zoomLevel <= 0.25"
                title="Zoom out (Ctrl+Scroll)"
                @click="store.zoomOut()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                class="w-14 rounded border border-gray-200 px-1.5 py-0.5 text-center text-xs hover:bg-gray-50"
                title="Reset zoom"
                @click="store.resetZoom()"
              >
                {{ Math.round(store.zoomLevel * 100) }}%
              </button>
              <button
                class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:opacity-40"
                :disabled="store.zoomLevel >= 4"
                title="Zoom in (Ctrl+Scroll)"
                @click="store.zoomIn()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </template>
          </div>
        </div>

        <!-- Loading bar -->
        <Transition name="slide-down">
          <div
            v-if="store.isLoading"
            class="flex items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2 text-sm text-brand-700"
          >
            <span
              class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600"
            />
            {{ store.loadingMessage }}
          </div>
        </Transition>

        <!-- Error toast -->
        <Transition name="slide-down">
          <div
            v-if="errorMessage"
            class="flex items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
          >
            <span>⚠ {{ errorMessage }}</span>
            <button class="ml-auto text-red-500 hover:text-red-700" @click="errorMessage = ''">
              ✕
            </button>
          </div>
        </Transition>

        <!-- Drop zone / canvas -->
        <div
          class="relative flex flex-1 overflow-auto"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
        >
          <!-- Drag overlay -->
          <Transition name="fade">
            <div
              v-if="isDragging"
              class="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-brand-600/10 backdrop-blur-sm"
            >
              <div
                class="rounded-2xl border-2 border-dashed border-brand-400 bg-white/80 px-12 py-8 text-center shadow-xl"
              >
                <p class="text-xl font-semibold text-brand-700">Drop PDF here</p>
                <p class="mt-1 text-sm text-gray-500">Max 25 MB</p>
              </div>
            </div>
          </Transition>

          <!-- Empty state -->
          <div
            v-if="!store.hasDocument && !store.isLoading"
            class="flex flex-1 flex-col items-center justify-center gap-4 text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 opacity-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p class="text-sm">Open a PDF file or drag it here to start editing</p>
            <label class="btn-primary cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                class="sr-only"
                @change="onFileInputChange"
              />
              Choose PDF File
            </label>
          </div>

          <!-- PDF Canvas component -->
          <ClientOnly>
            <PdfCanvas
              v-if="store.hasDocument || currentFile"
              ref="pdfCanvasRef"
              :file="currentFile"
              class="flex-1"
              @ready="onCanvasReady"
              @error="(msg) => (errorMessage = msg)"
            />
          </ClientOnly>
        </div>
      </main>

      <!-- Right: OCR result panel -->
      <Transition name="slide-left">
        <aside
          v-if="showOcrPanel"
          class="flex w-64 flex-col border-l border-gray-200 bg-white shadow-sm"
        >
          <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 class="text-sm font-semibold text-gray-900">OCR Result</h2>
            <button class="text-gray-400 hover:text-gray-600" @click="showOcrPanel = false">
              ✕
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <p v-if="ocrProgress > 0 && ocrProgress < 100" class="mb-2 text-xs text-gray-500">
              Recognising… {{ ocrProgress }}%
            </p>
            <pre class="whitespace-pre-wrap text-xs text-gray-700">{{
              store.ocrResult || 'No text extracted yet.'
            }}</pre>
          </div>
          <div class="border-t border-gray-200 p-3">
            <button
              class="btn-secondary w-full text-xs"
              :disabled="!store.ocrResult"
              @click="copyOcr"
            >
              Copy Text
            </button>
          </div>
        </aside>
      </Transition>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { usePdfSave } from '~/composables/usePdfSave';
import { useTesseract } from '~/composables/useTesseract';
import { useEditorStore } from '~/stores/useEditorStore';

definePageMeta({ layout: 'editor', ssr: false });

useSeoMeta({
  title: 'PDF Editor — Edit Your PDF',
  robots: 'noindex', // editor page does not need to be indexed
});

const store = useEditorStore();
const { recognise, progress: ocrProgress } = useTesseract();
const { saveAnnotatedPdf } = usePdfSave();

// Template ref to the PdfCanvas component instance
const pdfCanvasRef = ref<InstanceType<typeof import('~/components/PdfCanvas.vue').default> | null>(
  null,
);

const currentFile = ref<File | null>(null);
const errorMessage = ref('');
const isDragging = ref(false);
const showOcrPanel = ref(false);

// ─── File selection ────────────────────────────────────────────────────────────

function onFileSelected(file: File) {
  errorMessage.value = '';
  currentFile.value = file;
}

function onFileInputChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) onFileSelected(file);
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file?.type === 'application/pdf') {
    onFileSelected(file);
  } else {
    errorMessage.value = 'Please drop a valid PDF file.';
  }
}

function onCanvasReady() {
  errorMessage.value = '';
}

// ─── OCR ──────────────────────────────────────────────────────────────────────

async function runOcr() {
  if (!pdfCanvasRef.value) return;
  showOcrPanel.value = true;
  // Use the PDF page canvas (not the annotation overlay) for accurate OCR
  const dataUrl = pdfCanvasRef.value.exportPdfPageAsImage();
  if (!dataUrl) {
    errorMessage.value = 'Nothing to OCR — render a page first.';
    return;
  }
  await recognise(dataUrl);
}

async function onSignatureImage(dataUrl: string) {
  await pdfCanvasRef.value?.addSignatureImage(dataUrl);
}

function copyOcr() {
  if (store.ocrResult) {
    navigator.clipboard.writeText(store.ocrResult).catch(() => {});
  }
}

// ─── Save ──────────────────────────────────────────────────────────────────────

async function savePdf() {
  try {
    const annotationsMap = await pdfCanvasRef.value?.exportAllPageAnnotations();
    if (!annotationsMap) return;
    await saveAnnotatedPdf(annotationsMap);
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to save PDF.';
  }
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

async function undoAction() {
  store.undo();
  await pdfCanvasRef.value?.reloadFromStore();
}

async function redoAction() {
  store.redo();
  await pdfCanvasRef.value?.reloadFromStore();
}

function onKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undoAction();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault();
    redoAction();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    savePdf();
  }
}

function onWheel(e: WheelEvent) {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  if (e.deltaY < 0) {
    store.zoomIn();
  } else {
    store.zoomOut();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('wheel', onWheel, { passive: false });
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('wheel', onWheel);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
