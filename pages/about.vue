<script setup lang="ts">
useAppSeo({
  title: 'About LumiCore Free PDF Editor – How It Works & Privacy Policy',
  description:
    'Learn how LumiCore Free PDF Editor works. All PDF editing is client-side using pdf.js, pdf-lib, and Tesseract.js — your files never leave your browser.',
  path: '/about',
});
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-16">
    <h1 class="mb-6 text-3xl font-extrabold text-gray-900">About Free PDF Editor</h1>
    <div class="prose prose-slate">
      <p>
        Free PDF Editor is a fully client-side PDF editing tool. Your documents are processed
        entirely in your browser — nothing is uploaded to any server.
      </p>
      <h2>How It Works</h2>
      <p>
        The editor uses
        <strong>pdf.js</strong>
        for rendering and
        <strong>pdf-lib</strong>
        for saving, combined with an HTML5 canvas layer for annotations. OCR is powered by
        <strong>Tesseract.js</strong>
        , running entirely via WebAssembly in your browser.
      </p>
      <h2>Privacy</h2>
      <p>Your files never leave your device. No sign-up is required. Everything runs locally.</p>
    </div>
    <NuxtLink to="/editor" class="btn-primary mt-8 inline-block">Open Editor →</NuxtLink>
  </div>
</template>
