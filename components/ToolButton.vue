<template>
  <button
    class="tool-btn"
    :class="{ 'tool-btn-active': active }"
    :disabled="disabled"
    :title="label"
    @click="$emit('click')"
  >
    <!-- Inline SVGs for each icon type to avoid an icon library dependency -->
    <svg
      v-if="icon === 'text'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
    <svg
      v-else-if="icon === 'pencil'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
    <svg
      v-else-if="icon === 'signature'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 17c3-3 5-5 8-5s5 2 8 5" />
      <path d="M3 17l2-5 3 3 4-8 3 3 2-5" />
    </svg>
    <svg
      v-else-if="icon === 'eraser'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 20H7L3 16l9.293-9.293a1 1 0 0 1 1.414 0L20 13.1a1 1 0 0 1 0 1.414L12 22" />
      <path d="m6.5 17.5 5-5" />
    </svg>
    <svg
      v-else-if="icon === 'ocr'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
    <!-- Cursor / select icon -->
    <svg
      v-else-if="icon === 'select'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M5 3l14 9-7 1-4 7-3-17z" />
    </svg>
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  tool: string;
  active?: boolean;
  disabled?: boolean;
}>();
defineEmits(['click']);
</script>
