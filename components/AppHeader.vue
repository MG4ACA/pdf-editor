<template>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80">
        <img src="/1.png" alt="Lumicore Labs" class="h-8 w-8 object-contain" />
        <span class="text-lg font-bold tracking-tight text-brand-700">Free PDF Editor</span>
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
