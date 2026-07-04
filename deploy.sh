#!/usr/bin/env bash
# =============================================================================
#  Deploy Script — Build locally, upload to VPS
# =============================================================================
#  Usage:
#    ./deploy.sh <VPS_USER> <VPS_IP>
#
#  Example:
#    ./deploy.sh arivan 123.45.67.89
#
#  What this script does:
#    1. Build client (Vite) and server (TypeScript) locally
#    2. Create tarball of all needed production files
#    3. Upload to VPS via SCP
#    4. Extract on VPS
#    5. Install production deps & run Prisma generate on VPS
#    6. Restart PM2
# =============================================================================

set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────

VPS_USER="${1:-}"
VPS_IP="${2:-}"

if [ -z "$VPS_USER" ] || [ -z "$VPS_IP" ]; then
  echo "❌ Usage: $0 <VPS_USER> <VPS_IP>"
  echo "   Example: $0 arivan 123.45.67.89"
  exit 1
fi

VPS_HOST="${VPS_USER}@${VPS_IP}"
REMOTE_DIR="/var/www/amadewitransport"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="deploy_${TIMESTAMP}.tar.gz"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Amadewi Transport — Production Deploy             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 VPS: ${VPS_HOST}"
echo "📁 Remote dir: ${REMOTE_DIR}"
echo ""

# ─── Step 1: Install root deps if needed ─────────────────────────────────────

echo "━━━ Step 1/7: Installing root dependencies ━━━"
cd "$PROJECT_DIR"
npm install --silent

# ─── Step 2: Build client ────────────────────────────────────────────────────

echo "━━━ Step 2/7: Building client (Vite + React) ━━━"
cd "$PROJECT_DIR/client"
npm install --silent

# Production env for client (empty base URL = same-origin)
VITE_API_BASE_URL="" npm run build

echo "✅ Client built → client/dist/"

# ─── Step 3: Build server ────────────────────────────────────────────────────

echo "━━━ Step 3/7: Building server (TypeScript → CommonJS) ━━━"
cd "$PROJECT_DIR/server"
npm install --silent
npm run build

echo "✅ Server built → server/dist/"

# ─── Step 4: Create tarball ──────────────────────────────────────────────────

echo "━━━ Step 4/7: Creating deployment tarball ━━━"

# Files to include in the deployment
cd "$PROJECT_DIR"

# We need:
#  - server/dist/           (compiled JS)
#  - server/package.json
#  - server/package-lock.json
#  - server/prisma/         (schema + migrations)
#  - server/ecosystem.config.cjs (PM2 config)
#  - client/dist/           (built SPA)

tar -czf "$ARCHIVE_NAME" \
  server/dist \
  server/package.json \
  server/package-lock.json \
  server/prisma \
  server/ecosystem.config.cjs \
  client/dist

echo "✅ Tarball created: ${ARCHIVE_NAME} ($(du -h "$ARCHIVE_NAME" | cut -f1))"

# ─── Step 5: Upload to VPS ───────────────────────────────────────────────────

echo "━━━ Step 5/7: Uploading to VPS ━━━"
ssh "${VPS_HOST}" "sudo mkdir -p ${REMOTE_DIR}/releases ${REMOTE_DIR}/logs && sudo chown -R \$(whoami):\$(whoami) ${REMOTE_DIR}"
scp "$ARCHIVE_NAME" "${VPS_HOST}:${REMOTE_DIR}/releases/"

# Clean up local tarball
rm -f "$ARCHIVE_NAME"

echo "✅ Uploaded"

# ─── Step 6: Extract & install deps on VPS ───────────────────────────────────

echo "━━━ Step 6/7: Extracting & installing dependencies on VPS ━━━"

ssh "${VPS_HOST}" << 'ENDSSH'
set -e

ARCHIVE_NAME=$(ls -t /var/www/amadewitransport/releases/deploy_*.tar.gz | head -1)
REMOTE_DIR="/var/www/amadewitransport"

echo "Extracting: ${ARCHIVE_NAME}"

# Extract into a temp dir, then move into place atomically
TEMP_DIR="${REMOTE_DIR}/tmp_$(date +%s)"
mkdir -p "$TEMP_DIR"
tar -xzf "$ARCHIVE_NAME" -C "$TEMP_DIR"

# Move server files into place
if [ -d "${REMOTE_DIR}/server" ]; then
  # Backup old dist before replacing
  sudo rm -rf "${REMOTE_DIR}/server_previous"
  sudo mv "${REMOTE_DIR}/server" "${REMOTE_DIR}/server_previous" 2>/dev/null || true
fi
sudo mv "$TEMP_DIR/server" "$REMOTE_DIR/server"

# Move client dist — Express expects ../client/dist relative to server/dist/index.js
sudo mkdir -p "${REMOTE_DIR}/client"
sudo rm -rf "${REMOTE_DIR}/client/dist" 2>/dev/null || true
sudo mv "$TEMP_DIR/client/dist" "${REMOTE_DIR}/client/dist"

# Cleanup temp
rm -rf "$TEMP_DIR"

echo "Files extracted"

# Install production dependencies
cd "${REMOTE_DIR}/server"
npm install --omit=dev
npx prisma generate

echo "✅ Dependencies installed & Prisma client generated"
ENDSSH

# ─── Step 7: Restart PM2 ─────────────────────────────────────────────────────

echo "━━━ Step 7/7: Restarting PM2 ━━━"

ssh "${VPS_HOST}" << 'ENDSSH'
set -e

REMOTE_DIR="/var/www/amadewitransport"
cd "${REMOTE_DIR}/server"

# Load environment variables from .env
set -a
source .env
set +a

# Stop existing PM2 process
npx pm2 delete amadewi-api 2>/dev/null || true

# Start fresh with all env vars
echo "Starting PM2 with env vars..."
SUPABASE_URL="$SUPABASE_URL" \
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
DATABASE_URL="$DATABASE_URL" \
DIRECT_URL="$DIRECT_URL" \
JWT_SECRET="$JWT_SECRET" \
IPINFO_TOKEN="$IPINFO_TOKEN" \
NODE_ENV=production \
PORT=3000 \
npx pm2 start ecosystem.config.cjs

# Save PM2 process list (auto-start on reboot)
npx pm2 save

echo ""
echo "✅ PM2 restarted"
npx pm2 status
ENDSSH

# ─── Done ────────────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   ✅ Deploy Complete!                        ║"
echo "║                                                            ║"
echo "║  App should be running at: http://${VPS_IP}:3000           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Next steps:"
echo "  1. Open http://${VPS_IP}:3000/api/health to verify"
echo "  2. Check logs:  ssh ${VPS_HOST} 'pm2 logs amadewi-api'"
echo "  3. Setup firewall: see vps-setup.sh"
echo ""
