#!/usr/bin/env bash
# =============================================================================
#  VPS Initial Setup Script
# =============================================================================
#  Run this ONCE on a fresh Debian 13 VPS to prepare it for deployment.
#
#  Usage (from your LOCAL machine):
#    chmod +x vps-setup.sh
#    ./vps-setup.sh <VPS_USER> <VPS_IP>
#
#  This script will:
#    1. Install Node.js 22.x via NodeSource
#    2. Install PM2 globally
#    3. Create /var/www/amadewitransport directory
#    4. Configure UFW firewall (allow 22, 80, 443, 3000)
#    5. Setup PM2 to auto-start on boot
# =============================================================================

set -euo pipefail

VPS_USER="${1:-}"
VPS_IP="${2:-}"

if [ -z "$VPS_USER" ] || [ -z "$VPS_IP" ]; then
  echo "❌ Usage: $0 <VPS_USER> <VPS_IP>"
  echo "   Example: $0 arivan 123.45.67.89"
  exit 1
fi

VPS_HOST="${VPS_USER}@${VPS_IP}"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Amadewi Transport — VPS Initial Setup               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Target: ${VPS_HOST}"
echo ""

ssh "${VPS_HOST}" << 'ENDSSH'
set -e

echo "━━━ Step 1/5: Updating system packages ━━━"
sudo apt-get update -y
sudo apt-get upgrade -y

echo "━━━ Step 2/5: Installing Node.js 22.x ━━━"
# Check if Node.js is already installed
if command -v node &> /dev/null; then
  CURRENT_NODE=$(node -v)
  echo "Node.js already installed: ${CURRENT_NODE}"
  if [[ "$CURRENT_NODE" == v22* ]]; then
    echo "✅ Node.js 22.x already present"
  else
    echo "⚠️  Wrong version. Installing Node.js 22.x..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node.js: $(node -v)"
echo "npm:     $(npm -v)"

echo "━━━ Step 3/5: Installing PM2 globally ━━━"
sudo npm install -g pm2

echo "━━━ Step 4/5: Creating app directory ━━━"
sudo mkdir -p /var/www/amadewitransport/{server,releases,logs}
sudo chown -R $(whoami):$(whoami) /var/www/amadewitransport

echo "━━━ Step 5/5: Configuring firewall (UFW) ━━━"
# Install UFW if not present
sudo apt-get install -y ufw

# Default deny incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh
# Allow HTTP/HTTPS (for when you add a domain later)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Allow app port
sudo ufw allow 3000/tcp

# Enable firewall (will prompt, force with --force)
sudo ufw --force enable

echo ""
echo "✅ Firewall configured"
sudo ufw status verbose

# Setup PM2 to start on boot
echo ""
echo "Setting up PM2 auto-start on boot..."
pm2 startup systemd -u $(whoami) --hp /home/$(whoami) 2>/dev/null || pm2 startup

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║               ✅ VPS Setup Complete!                        ║"
echo "║                                                            ║"
echo "║  Next steps:                                               ║"
echo "║  1. Create .env on the VPS:                                ║"
echo "║     ssh ${VPS_USER}@${VPS_IP}                              ║"
echo "║     nano /var/www/amadewitransport/server/.env             ║"
echo "║                                                            ║"
echo "║  2. Run the deploy script:                                 ║"
echo "║     ./deploy.sh ${VPS_USER} ${VPS_IP}                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
ENDSSH

echo ""
echo "💡 IMPORTANT: Now create the .env file on your VPS:"
echo "   ssh ${VPS_HOST}"
echo "   nano /var/www/amadewitransport/server/.env"
echo ""
echo "   Required variables:"
echo "   ┌─────────────────────┬──────────────────────────────────┐"
echo "   │ DATABASE_URL        │ Supabase PgBouncer (port 6543)   │"
echo "   │ DIRECT_URL          │ Supabase direct (port 5432)      │"
echo "   │ SUPABASE_URL        │ Your Supabase project URL        │"
echo "   │ SUPABASE_ANON_KEY   │ Your Supabase anon key           │"
echo "   │ JWT_SECRET          │ Random string for signing tokens │"
echo "   │ IPINFO_TOKEN        │ ipinfo.io API token              │"
echo "   │ PORT                │ 3000 (optional, default)         │"
echo "   └─────────────────────┴──────────────────────────────────┘"
echo ""
