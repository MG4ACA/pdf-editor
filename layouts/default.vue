<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
      © {{ new Date().getFullYear() }} Free PDF Editor — All processing is done locally in your
      browser. We never receive your files.
    </footer>
  </div>
</template>
