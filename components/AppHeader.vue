<template>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 text-brand-700 hover:text-brand-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span class="text-lg font-bold tracking-tight">Free PDF Editor</span>
      </NuxtLink>

      <!-- Nav links -->
      <nav class="hidden gap-6 text-sm font-medium text-gray-600 sm:flex">
        <NuxtLink to="/editor" class="hover:text-brand-600">Editor</NuxtLink>
        <NuxtLink to="/about" class="hover:text-brand-600">About</NuxtLink>
      </nav>

      <!-- CTA -->
      <NuxtLink to="/editor" class="btn-primary text-sm">Open Editor</NuxtLink>
    </div>
  </header>
</template>
