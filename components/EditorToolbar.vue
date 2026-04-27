<template>
  <!-- Vertical toolbar pinned to the left of the editor -->
  <aside
    class="flex h-full w-16 flex-col items-center gap-1 border-r border-gray-200 bg-white py-3 shadow-sm"
  >
    <!-- File open -->
    <label
      title="Open PDF"
      class="tool-btn cursor-pointer"
      :class="{ 'pointer-events-none opacity-40': store.isLoading }"
    >
      <input type="file" accept="application/pdf" class="sr-only" @change="onFileChange" />
      <IconUpload class="h-5 w-5" />
      <span>Open</span>
    </label>

    <div class="my-1 w-10 border-t border-gray-100" />

    <!-- Text tool -->
    <ToolButton
      icon="text"
      label="Text"
      tool="text"
      :active="store.activeTool === 'text'"
      :disabled="!store.hasDocument"
      @click="handleTool('text')"
    />

    <!-- Draw tool -->
    <ToolButton
      icon="pencil"
      label="Draw"
      tool="draw"
      :active="store.activeTool === 'draw'"
      :disabled="!store.hasDocument"
      @click="handleTool('draw')"
    />

    <!-- Signature tool with draw/upload popup -->
    <div class="relative">
      <ToolButton
        icon="signature"
        label="Sign"
        tool="signature"
        :active="store.activeTool === 'signature' || showSignaturePanel"
        :disabled="!store.hasDocument"
        @click="showSignaturePanel = !showSignaturePanel"
      />
      <!-- Signature popup -->
      <div
        v-if="showSignaturePanel"
        class="absolute left-full top-0 z-50 ml-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-xl"
      >
        <p class="mb-1.5 text-xs font-semibold text-gray-700">Signature</p>
        <button
          class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
          @click="chooseDraw"
        >
          ✏️ Draw freehand
        </button>
        <label
          class="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
        >
          🖼️ Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            class="sr-only"
            @change="onSignatureImageChange"
          />
        </label>
      </div>
    </div>

    <!-- Erase tool -->
    <ToolButton
      icon="eraser"
      label="Erase"
      tool="erase"
      :active="store.activeTool === 'erase'"
      :disabled="!store.hasDocument"
      @click="handleTool('erase')"
    />

    <!-- OCR -->
    <ToolButton
      icon="ocr"
      label="OCR"
      tool="ocr"
      :active="false"
      :disabled="!store.hasDocument"
      @click="emit('ocr')"
    />

    <div class="my-1 w-10 border-t border-gray-100" />

    <!-- Colour picker -->
    <div class="flex flex-col items-center gap-1" title="Colour">
      <label class="relative cursor-pointer">
        <span
          class="block h-7 w-7 rounded-full border-2 border-gray-300 shadow-sm transition hover:scale-110"
          :style="{ background: store.activeColor }"
        />
        <input
          type="color"
          :value="store.activeColor"
          class="sr-only"
          @input="store.setActiveColor(($event.target as HTMLInputElement).value)"
        />
      </label>
      <span class="text-xs text-gray-500">Color</span>
    </div>

    <div class="flex-1" />

    <!-- Undo -->
    <button class="tool-btn" :disabled="!store.canUndo" title="Undo (Ctrl+Z)" @click="emit('undo')">
      <IconUndo class="h-5 w-5" />
      <span>Undo</span>
    </button>

    <!-- Redo -->
    <button class="tool-btn" :disabled="!store.canRedo" title="Redo (Ctrl+Y)" @click="emit('redo')">
      <IconRedo class="h-5 w-5" />
      <span>Redo</span>
    </button>

    <!-- Save -->
    <button
      class="tool-btn text-green-700 hover:bg-green-50"
      :disabled="!store.hasDocument || store.isLoading"
      title="Save PDF"
      @click="emit('save')"
    >
      <IconSave class="h-5 w-5" />
      <span>Save</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ToolMode } from '~/stores/useEditorStore';
import { useEditorStore } from '~/stores/useEditorStore';

const store = useEditorStore();
const emit = defineEmits<{
  (e: 'file-selected', file: File): void;
  (e: 'ocr'): void;
  (e: 'save'): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'signature-image', dataUrl: string): void;
}>();

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) emit('file-selected', file);
  // Reset input so the same file can be re-opened
  input.value = '';
}

function handleTool(tool: ToolMode) {
  store.setActiveTool(tool);
}

const showSignaturePanel = ref(false);

// Close the signature panel whenever the active tool changes away from signature
watch(
  () => store.activeTool,
  (tool) => {
    if (tool !== 'signature') showSignaturePanel.value = false;
  },
);

function chooseDraw() {
  showSignaturePanel.value = false;
  handleTool('signature');
}

function onSignatureImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    if (dataUrl) emit('signature-image', dataUrl);
  };
  reader.readAsDataURL(file);
  showSignaturePanel.value = false;
  input.value = '';
}
</script>
