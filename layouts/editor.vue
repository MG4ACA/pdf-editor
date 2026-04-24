<!-- Editor layout: full viewport height, no footer, sidebar + canvas -->
<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <AppHeader />
    <div class="flex flex-1 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
