/**
 * PM2 ecosystem config
 *
 * Start production:
 *   pm2 start ecosystem.config.cjs --env production
 *
 * Two processes:
 *   pdf-editor-nuxt  – Nuxt 3 SSR server  (port 3010)
 *   pdf-editor-api   – Express event API   (port 3011)
 *
 * Nginx sits in front and routes:
 *   /api/*  → localhost:3011
 *   *       → localhost:3010
 */

module.exports = {
  apps: [
    // ── Nuxt 3 SSR server ──────────────────────────────────────────────────
    {
      name: 'pdf-editor-nuxt',
      script: '.output/server/index.mjs',
      cwd: '/var/www/pdf-editor',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3010,
        // Overrides runtimeConfig.public.apiBase at runtime (no rebuild needed)
        NUXT_PUBLIC_API_BASE: 'https://pdfeditor.lumicore-labs.com/api',
      },
    },

    // ── Express event-logging API ──────────────────────────────────────────
    {
      name: 'pdf-editor-api',
      script: 'server/index.js',
      cwd: '/var/www/pdf-editor',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3011,
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_NAME: 'pdf_editor',
        DB_USER: 'pdf_editor_user',
        DB_PASSWORD: 'CHANGE_ME', // ← fill in on server
        ALLOWED_ORIGINS: 'https://pdfeditor.lumicore-labs.com',
      },
    },
  ],
};
