import { defineStore } from 'pinia';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToolMode = 'select' | 'text' | 'signature' | 'draw' | 'highlight' | 'ocr' | 'erase';

export interface AnnotationObject {
  id: string;
  page: number;
  fabricJson: Record<string, unknown>;
  type: 'text' | 'signature' | 'drawing' | 'highlight';
  createdAt: number;
}

export interface PdfDocumentState {
  fileName: string;
  fileSizeBytes: number;
  totalPages: number;
  currentPage: number;
  /** Raw ArrayBuffer of the original PDF – kept in memory, never sent to server */
  rawBuffer: ArrayBuffer | null;
}

// ---------------------------------------------------------------------------
// History entry for undo/redo
// ---------------------------------------------------------------------------

interface HistoryEntry {
  annotations: AnnotationObject[];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useEditorStore = defineStore('editor', {
  state: () => ({
    // Document
    document: null as PdfDocumentState | null,

    // Annotations indexed by page number
    annotations: [] as AnnotationObject[],

    // Active tool
    activeTool: 'select' as ToolMode,

    // Active colour for text / drawing
    activeColor: '#1d4ed8',

    // Active font size for text tool
    activeFontSize: 16,

    // Brush size for draw / signature tools (1–40 px)
    activeBrushSize: 3,

    // Canvas render scale (2x for high-DPI)
    renderScale: 2.0,

    // UI zoom level (CSS transform – does not affect render resolution)
    zoomLevel: 1.0,

    // Undo / redo history stacks
    _past: [] as HistoryEntry[],
    _future: [] as HistoryEntry[],

    // Incremented on every undo/redo so PdfCanvas can watch only those changes
    _undoRedoVersion: 0,

    // UI state
    isLoading: false,
    loadingMessage: '',
    ocrResult: '' as string,
    isSidebarOpen: true,
  }),

  getters: {
    hasDocument: (state) => state.document !== null,

    currentPageAnnotations: (state) =>
      state.annotations.filter((a) => a.page === state.document?.currentPage),

    canUndo: (state) => state._past.length > 0,
    canRedo: (state) => state._future.length > 0,

    totalPages: (state) => state.document?.totalPages ?? 0,
    currentPage: (state) => state.document?.currentPage ?? 1,
  },

  actions: {
    // -----------------------------------------------------------------------
    // Document lifecycle
    // -----------------------------------------------------------------------

    loadDocument(payload: Omit<PdfDocumentState, 'currentPage'>) {
      this.document = { ...payload, currentPage: 1 };
      this.annotations = [];
      this._past = [];
      this._future = [];
      this.activeTool = 'select';
    },

    closeDocument() {
      this.document = null;
      this.annotations = [];
      this._past = [];
      this._future = [];
    },

    setCurrentPage(page: number) {
      if (!this.document) return;
      const clamped = Math.max(1, Math.min(page, this.document.totalPages));
      this.document.currentPage = clamped;
    },

    // -----------------------------------------------------------------------
    // Tool & style management
    // -----------------------------------------------------------------------

    setActiveTool(tool: ToolMode) {
      this.activeTool = tool;
    },

    setActiveColor(color: string) {
      this.activeColor = color;
    },

    setActiveFontSize(size: number) {
      this.activeFontSize = size;
    },

    setActiveBrushSize(size: number) {
      this.activeBrushSize = Math.max(1, Math.min(40, size));
    },

    // -----------------------------------------------------------------------
    // Zoom
    // -----------------------------------------------------------------------

    setZoomLevel(level: number) {
      this.zoomLevel = Math.max(0.25, Math.min(4.0, Math.round(level * 100) / 100));
    },

    zoomIn() {
      const steps = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0];
      const next = steps.find((s) => s > this.zoomLevel + 0.001);
      this.zoomLevel = next ?? 4.0;
    },

    zoomOut() {
      const steps = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0];
      const prev = [...steps].reverse().find((s) => s < this.zoomLevel - 0.001);
      this.zoomLevel = prev ?? 0.25;
    },

    resetZoom() {
      this.zoomLevel = 1.0;
    },

    // -----------------------------------------------------------------------
    // Annotation CRUD (each mutating action saves a history snapshot)
    // -----------------------------------------------------------------------

    _snapshot() {
      this._past.push({ annotations: JSON.parse(JSON.stringify(this.annotations)) });
      // Clear redo stack on new action
      this._future = [];
      // Keep history bounded to 50 entries
      if (this._past.length > 50) this._past.shift();
    },

    addAnnotation(annotation: Omit<AnnotationObject, 'id' | 'createdAt'>) {
      this._snapshot();
      this.annotations.push({
        ...annotation,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      });
    },

    updateAnnotation(id: string, fabricJson: Record<string, unknown>) {
      this._snapshot();
      const idx = this.annotations.findIndex((a) => a.id === id);
      if (idx !== -1) {
        this.annotations[idx].fabricJson = fabricJson;
      }
    },

    removeAnnotation(id: string) {
      this._snapshot();
      this.annotations = this.annotations.filter((a) => a.id !== id);
    },

    /**
     * Bulk-replace all annotations for a given page.
     * Called when Fabric.js fires a canvas modification event.
     * NOTE: snapshot is taken by the caller before invoking this.
     */
    syncAnnotationsForPage(page: number, objects: AnnotationObject[]) {
      this.annotations = [
        ...this.annotations.filter((a) => a.page !== page),
        ...objects.map((o) => ({ ...o, page })),
      ];
    },

    // -----------------------------------------------------------------------
    // Undo / Redo
    // -----------------------------------------------------------------------

    undo() {
      if (this._past.length === 0) return;
      this._future.push({ annotations: JSON.parse(JSON.stringify(this.annotations)) });
      const prev = this._past.pop()!;
      this.annotations = prev.annotations;
      this._undoRedoVersion++;
    },

    redo() {
      if (this._future.length === 0) return;
      this._past.push({ annotations: JSON.parse(JSON.stringify(this.annotations)) });
      const next = this._future.pop()!;
      this.annotations = next.annotations;
      this._undoRedoVersion++;
    },

    // -----------------------------------------------------------------------
    // UI helpers
    // -----------------------------------------------------------------------

    setLoading(loading: boolean, message = '') {
      this.isLoading = loading;
      this.loadingMessage = message;
    },

    setOcrResult(text: string) {
      this.ocrResult = text;
    },

    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
  },
});
