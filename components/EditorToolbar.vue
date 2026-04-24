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

    <!-- Signature tool -->
    <ToolButton
      icon="signature"
      label="Sign"
      tool="signature"
      :active="store.activeTool === 'signature'"
      :disabled="!store.hasDocument"
      @click="handleTool('signature')"
    />

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
    <button class="tool-btn" :disabled="!store.canUndo" title="Undo (Ctrl+Z)" @click="store.undo()">
      <IconUndo class="h-5 w-5" />
      <span>Undo</span>
    </button>

    <!-- Redo -->
    <button class="tool-btn" :disabled="!store.canRedo" title="Redo (Ctrl+Y)" @click="store.redo()">
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
import type { ToolMode } from '~/stores/useEditorStore';
import { useEditorStore } from '~/stores/useEditorStore';

const store = useEditorStore();
const emit = defineEmits<{
  (e: 'file-selected', file: File): void;
  (e: 'ocr'): void;
  (e: 'save'): void;
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
</script>
