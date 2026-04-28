// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2026-04-24',

  ssr: true,

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/sitemap'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Free PDF Editor – Edit, Annotate & Sign PDFs Online',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Edit PDFs for free directly in your browser. Add text, draw signatures, annotate, and save — no uploads, 100% private and client-side.',
        },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Free PDF Editor – Edit PDFs Online' },
        {
          property: 'og:description',
          content: 'Free, private, client-side PDF editor. No sign-up required.',
        },
        { property: 'og:type', content: 'website' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/1.png' }],
    },
  },

  // Vite config to handle pdfjs worker + fabric
  vite: {
    optimizeDeps: {
      include: ['pdfjs-dist', 'fabric'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            pdfjs: ['pdfjs-dist'],
            fabric: ['fabric'],
          },
        },
      },
    },
  },

  // Runtime config – server-side secrets
  runtimeConfig: {
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || 'pdf_editor',
    // Public (exposed to client)
    public: {
      maxFileSizeMb: 25,
      apiBase: process.env.API_BASE || 'http://localhost:3002',
    },
  },

  // Nuxt server-side middleware handled by separate Express server
  // but we still expose a /api proxy for dev convenience
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3002/api',
        changeOrigin: true,
      },
    },
  },

  // ── Sitemap ────────────────────────────────────────────────────────────────
  // @nuxtjs/sitemap auto-discovers static pages; dynamic /tools/:slug routes
  // are declared explicitly so they are included in sitemap.xml.
  sitemap: {
    siteUrl: 'https://pdfeditor.lumicore-labs.com',
    // Exclude API and devtools paths from the sitemap
    exclude: ['/api/**', '/__nuxt_devtools__/**'],
    // Explicitly list the dynamic tool routes
    urls: [
      { loc: '/tools/edit-pdf', priority: 0.9, changefreq: 'weekly' as const },
      { loc: '/tools/sign-pdf-online', priority: 0.9, changefreq: 'weekly' as const },
      { loc: '/tools/free-pdf-editor', priority: 0.9, changefreq: 'weekly' as const },
      { loc: '/tools/ocr-pdf', priority: 0.9, changefreq: 'weekly' as const },
    ],
  },
});
