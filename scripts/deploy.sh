#!/bin/bash
set -e
echo "=== Pulling latest code ==="
git pull origin main
echo "=== Installing backend dependencies ==="
cd backend && npm install --production && cd ..
echo "=== Installing frontend dependencies ==="
cd frontend && npm install && cd ..
echo "=== Building backend ==="
cd backend && npm run build && cd ..
echo "=== Building frontend ==="
cd frontend && npm run build && cd ..
echo "=== Running migrations ==="
node scripts/run-migrations.js
echo "=== Restarting services ==="
sudo systemctl restart tuitional-app
sudo systemctl restart tuitional-daemon
echo "=== Health check ==="
sleep 5
curl -s http://localhost:5001/api/health | head -20
echo ""
echo "=== Deployment complete ==="
