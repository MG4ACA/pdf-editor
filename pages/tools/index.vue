<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-700 to-brand-900 py-16 text-white">
      <div class="mx-auto max-w-3xl px-6 text-center">
        <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Free PDF Tools — Online, Private & No Sign-Up
        </h1>
        <p class="text-lg text-brand-100">
          Every tool runs 100% in your browser. Your documents never leave your device.
        </p>
      </div>
    </section>

    <!-- Tool Cards -->
    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <ul class="grid gap-6 sm:grid-cols-2">
          <li v-for="tool in tools" :key="tool.slug">
            <NuxtLink
              :to="`/tools/${tool.slug}`"
              class="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-400 hover:shadow-md"
            >
              <h2 class="mb-2 text-lg font-bold text-gray-900 group-hover:text-brand-700">
                {{ tool.h1 }}
              </h2>
              <p class="mb-4 grow text-sm text-gray-600">{{ tool.subheading }}</p>
              <span class="text-sm font-semibold text-brand-700 group-hover:underline">
                Use this tool →
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- SEO prose -->
    <section class="bg-gray-50 py-12">
      <div class="prose prose-slate mx-auto max-w-2xl px-6">
        <h2>All Tools Are Free, Private, and In-Browser</h2>
        <p>
          Every tool in this collection runs entirely inside your web browser using WebAssembly and
          the
          <strong>pdf.js</strong>
          rendering engine. There is no server receiving your files, no account to create, and no
          subscription required. Open a tool, complete your task, and download the result — your
          document never travels beyond your own device.
        </p>
        <p>
          Whether you need to
          <NuxtLink to="/tools/edit-pdf">edit a PDF online</NuxtLink>
          ,
          <NuxtLink to="/tools/sign-pdf-online">add an electronic signature</NuxtLink>
          , use a
          <NuxtLink to="/tools/free-pdf-editor">free PDF editor with no watermarks</NuxtLink>
          , or
          <NuxtLink to="/tools/ocr-pdf">extract text from a scanned PDF</NuxtLink>
          using OCR — every feature is available at no cost with zero data sent to the cloud.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useAppSeo({
  title: 'Free PDF Tools Online – Edit, Sign, OCR & More | LumiCore PDF',
  description:
    'Free browser-based PDF tools: edit PDFs, add signatures, extract text with OCR, and more. No sign-up, no file uploads, no watermarks — 100% private.',
  path: '/tools',
});

const tools = Object.values(toolsConfig);
</script>
