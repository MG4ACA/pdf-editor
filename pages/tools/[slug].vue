<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-700 to-brand-900 py-20 text-white">
      <div class="mx-auto max-w-3xl px-6 text-center">
        <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {{ tool.h1 }}
        </h1>
        <p class="mb-8 text-lg text-brand-100">{{ tool.subheading }}</p>
        <NuxtLink
          to="/editor"
          class="inline-block rounded-xl bg-white px-8 py-3 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
        >
          Open PDF Editor →
        </NuxtLink>
      </div>
    </section>

    <!-- How-To Steps -->
    <section class="py-16">
      <div class="mx-auto max-w-3xl px-6">
        <h2 class="mb-10 text-center text-2xl font-bold text-gray-900">How It Works</h2>
        <ol class="space-y-6">
          <li
            v-for="(step, index) in tool.howToSteps"
            :key="step.name"
            class="flex items-start gap-4"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
            >
              {{ index + 1 }}
            </span>
            <div>
              <h3 class="mb-1 font-semibold text-gray-900">{{ step.name }}</h3>
              <p class="text-gray-600">{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- SEO Prose -->
    <section class="bg-gray-50 py-16">
      <div class="prose prose-slate mx-auto max-w-2xl px-6">
        <h2>About This Tool</h2>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="proseHtml" />
      </div>
    </section>

    <!-- CTA -->
    <section class="py-12">
      <div class="mx-auto max-w-xl px-6 text-center">
        <p class="mb-6 text-lg font-medium text-gray-700">
          Ready to get started? No sign-up, no downloads, no cost.
        </p>
        <NuxtLink
          to="/editor"
          class="inline-block rounded-xl bg-brand-700 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-800"
        >
          Open PDF Editor for Free →
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Resolve tool config — throw 404 for unknown slugs
const tool = toolsConfig[slug];
if (!tool) {
  throw createError({ statusCode: 404, statusMessage: 'Tool not found' });
}

// Apply per-tool SEO meta, OG, Twitter, and canonical
useAppSeo({
  title: tool.title,
  description: tool.description,
  path: `/tools/${tool.slug}`,
});

// Convert newline-separated paragraphs to HTML <p> tags
const proseHtml = tool.prose
  .split('\n\n')
  .map((p) => `<p>${p.trim()}</p>`)
  .join('\n');

// ── Structured Data: HowTo ───────────────────────────────────────────────────
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: tool.h1,
  description: tool.description,
  step: tool.howToSteps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
};

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(howToSchema),
    },
  ],
});
</script>
