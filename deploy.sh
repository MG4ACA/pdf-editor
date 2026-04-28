#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# deploy.sh  –  Update pdf-editor on the VPS
#
# Usage (first deploy):  bash deploy.sh --fresh
# Usage (updates):       bash deploy.sh
# ─────────────────────────────────────────────────────────────────

set -e

APP_DIR="/var/www/pdf-editor"
PM2_NUXT="pdf-editor-nuxt"
PM2_API="pdf-editor-api"
FRESH=${1:-""}

echo "🚀 Starting deployment of pdf-editor..."

cd "$APP_DIR"

# ── Pull latest code ──────────────────────────────────────────────
echo "📥 Pulling latest code..."
git fetch --all
git pull origin main

# ── Install dependencies ──────────────────────────────────────────
echo "📦 Installing dependencies..."
npm install --include=dev

# ── Build Nuxt ────────────────────────────────────────────────────
echo "🔨 Building Nuxt..."
npm run build

# ── Start or reload PM2 processes ────────────────────────────────
if [ "$FRESH" = "--fresh" ]; then
  echo "🆕 Starting PM2 processes for the first time..."
  pm2 start ecosystem.config.cjs --env production
else
  echo "🔄 Reloading PM2 processes..."
  pm2 reload "$PM2_NUXT" --update-env
  pm2 reload "$PM2_API" --update-env
fi

pm2 save

echo ""
echo "✅ Deployment complete!"
echo "   Nuxt (SSR):  http://localhost:3010"
echo "   Express API: http://localhost:3011"
echo "   Live site:   https://pdfeditor.lumicore-labs.com"
