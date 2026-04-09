#!/usr/bin/env bash
# deploy.sh — Tuitional AI VPS deployment script
# Usage: ./scripts/deploy.sh
# Run as: tuitional user on the VPS

set -euo pipefail

DEPLOY_DIR="/opt/tuitional"
REPO_URL="https://github.com/Tuitional-AI-123/Agent-"
BRANCH="main"

echo "[deploy] Starting deployment at $(date)"

# --- 1. Pull latest code ---
if [ -d "$DEPLOY_DIR/.git" ]; then
  echo "[deploy] Pulling latest from $BRANCH..."
  git -C "$DEPLOY_DIR" fetch origin
  git -C "$DEPLOY_DIR" reset --hard "origin/$BRANCH"
else
  echo "[deploy] Cloning repo..."
  git clone --branch "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
fi

# --- 2. Run database migrations ---
echo "[deploy] Running migrations..."
cd "$DEPLOY_DIR"
DATABASE_URL="$(grep DATABASE_URL backend/.env | cut -d= -f2-)" \
  node scripts/run-migrations.js

# --- 3. Build backend ---
echo "[deploy] Building backend..."
cd "$DEPLOY_DIR/backend"
npm ci --omit=dev
npm run build

# --- 4. Build frontend ---
echo "[deploy] Building frontend..."
cd "$DEPLOY_DIR/frontend"
npm ci --omit=dev
npm run build

# --- 5. Restart services ---
echo "[deploy] Restarting services..."
sudo systemctl restart tuitional-app
sudo systemctl restart tuitional-daemon

# Wait and verify
sleep 3
if systemctl is-active --quiet tuitional-app; then
  echo "[deploy] tuitional-app is running"
else
  echo "[deploy] ERROR: tuitional-app failed to start"
  sudo journalctl -u tuitional-app -n 30 --no-pager
  exit 1
fi

if systemctl is-active --quiet tuitional-daemon; then
  echo "[deploy] tuitional-daemon is running"
else
  echo "[deploy] WARNING: tuitional-daemon failed to start"
  sudo journalctl -u tuitional-daemon -n 30 --no-pager
fi

echo "[deploy] Deployment complete at $(date)"
