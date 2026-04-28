<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-700 to-brand-900 py-20 text-white">
      <div class="mx-auto max-w-3xl px-6 text-center">
        <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Free PDF Editor — Edit PDFs Online, Instantly
        </h1>
        <p class="mb-8 text-lg text-brand-100">
          Add text, draw signatures, annotate, and save your PDFs — 100% free, no sign-up, and
          <strong>completely private</strong>
          . Your files never leave your device.
        </p>
        <NuxtLink
          to="/editor"
          class="inline-block rounded-xl bg-white px-8 py-3 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
        >
          Open PDF Editor →
        </NuxtLink>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16">
      <div class="mx-auto max-w-5xl px-6">
        <h2 class="mb-10 text-center text-2xl font-bold text-gray-900">Everything You Need</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard v-for="feature in features" :key="feature.title" v-bind="feature" />
        </div>
      </div>
    </section>

    <!-- SEO copy -->
    <section class="bg-gray-50 py-16">
      <div class="prose prose-slate mx-auto max-w-2xl px-6">
        <h2>Why Use Our Free PDF Editor?</h2>
        <p>
          Unlike other online PDF editors that upload your documents to remote servers, our tool
          processes everything inside your browser using WebAssembly and the
          <strong>pdf.js</strong>
          rendering engine. Your confidential contracts, invoices, and personal documents are
          <strong>never transmitted</strong>
          — they stay on your device throughout the entire editing session.
        </p>
        <p>
          There is no account to create, no email to verify, and no software to install. Open the
          editor, drop in your PDF, and start editing in seconds. When you're done, hit Save and the
          finished file downloads straight to your device — with no watermarks added, ever.
        </p>
        <h3>Key Features</h3>
        <ul>
          <li>Add text annotations with custom font size and colour</li>
          <li>Draw freehand signatures directly on the PDF with mouse or touchscreen</li>
          <li>Freehand drawing and highlight layer for visual markup</li>
          <li>Undo / redo history (up to 50 steps) so you can experiment freely</li>
          <li>
            OCR — extract text from scanned PDFs powered by self-hosted Tesseract.js (no external
            API calls)
          </li>
          <li>Multi-page PDF support with instant page navigation</li>
          <li>Download the edited PDF instantly — no watermarks, no limits</li>
        </ul>
        <h3>Trusted Tools</h3>
        <p>
          Explore our specialised tools:
          <NuxtLink to="/tools/edit-pdf">Edit PDF Online</NuxtLink>,
          <NuxtLink to="/tools/sign-pdf-online">Sign PDF Online</NuxtLink>,
          <NuxtLink to="/tools/free-pdf-editor">Free PDF Editor</NuxtLink>, and
          <NuxtLink to="/tools/ocr-pdf">OCR PDF</NuxtLink>
          — all free, all private, all in-browser.
        </p>
        <p>
          Works in all modern browsers including Chrome, Firefox, Safari, and Edge. No plugins or
          extensions required. Privacy by design, not as a feature add-on.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Centralised SEO: OG, Twitter, canonical
useAppSeo({
  title: 'Free PDF Editor – Edit, Annotate & Sign PDFs Online | No Upload',
  description:
    'Edit PDFs for free in your browser. Add text, draw signatures, annotate pages, and extract text with OCR — 100% client-side, private, and secure. No registration required.',
  path: '/',
})

// ── Structured Data: SoftwareApplication ────────────────────────────────────
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LumiCore Free PDF Editor',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web Browser',
  url: 'https://pdfeditor.lumicore-labs.com/editor',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'A free, browser-based PDF editor. Add text, draw signatures, annotate pages, and run OCR on scanned PDFs — all client-side with no file uploads.',
  featureList: [
    'Text annotation with custom font size and colour',
    'Freehand drawing and signature tool',
    'Undo/redo history (50 steps)',
    'OCR text extraction via Tesseract.js',
    'Multi-page PDF navigation',
    'No upload, no registration, no watermarks',
  ],
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(softwareAppSchema),
    },
  ],
});

const features = [
  {
    title: 'Add Text',
    description:
      'Insert editable text boxes anywhere on any PDF page with custom fonts and colours.',
    icon: 'text',
  },
  {
    title: 'Draw Signatures',
    description:
      'Sign documents by drawing your signature directly on the PDF with your mouse or touchscreen.',
    icon: 'signature',
  },
  {
    title: 'Freehand Drawing',
    description: 'Annotate PDFs with freehand drawings, highlights, and shapes.',
    icon: 'draw',
  },
  {
    title: 'Undo / Redo',
    description: 'Full undo/redo history so you can experiment freely without fear of mistakes.',
    icon: 'undo',
  },
  {
    title: 'OCR Text Extraction',
    description: 'Extract text from scanned PDFs using the built-in Tesseract.js OCR engine.',
    icon: 'ocr',
  },
  {
    title: '100% Private',
    description: 'Your PDF never leaves your device. All processing happens in the browser.',
    icon: 'lock',
  },
];
</script>
