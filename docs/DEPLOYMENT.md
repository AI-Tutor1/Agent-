# DEPLOYMENT.md — VPS Deployment Specification

## Target Environment
- **OS**: Ubuntu 24.04 LTS
- **VPS Provider**: Any (DigitalOcean, Hetzner, AWS recommended)
- **Minimum Specs**: 2 vCPU, 4GB RAM, 50GB SSD
- **Domain**: Required for HTTPS (e.g., agent.tuitionaledu.com)

---

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install essential tools
sudo apt install -y git ufw caddy postgresql-client

# Create application user
sudo useradd -m -s /bin/bash tuitional
sudo usermod -aG sudo tuitional
```

---

## 2. Application Deployment

```bash
# Clone repository
cd /home/tuitional
git clone https://github.com/AI-Tutor1/Agent-.git app
cd app

# Install dependencies
npm install --production

# Copy environment file
cp .env.example .env.production
# EDIT .env.production with real values (see /docs/ENV-REFERENCE.md)
nano .env.production

# Build application
npm run build

# Run database migrations
node scripts/run-migrations.js
```

---

## 3. Systemd Services

### Application Server
```ini
# /etc/systemd/system/tuitional-app.service
[Unit]
Description=Tuitional AI OS — Application Server
After=network.target

[Service]
Type=simple
User=tuitional
WorkingDirectory=/home/tuitional/app
EnvironmentFile=/home/tuitional/app/.env.production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Task Polling Daemon
```ini
# /etc/systemd/system/tuitional-daemon.service
[Unit]
Description=Tuitional AI OS — Task Polling Daemon
After=tuitional-app.service

[Service]
Type=simple
User=tuitional
WorkingDirectory=/home/tuitional/app
EnvironmentFile=/home/tuitional/app/.env.production
ExecStart=/usr/bin/node scripts/task-daemon.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Enable and Start
```bash
sudo systemctl daemon-reload
sudo systemctl enable tuitional-app tuitional-daemon
sudo systemctl start tuitional-app tuitional-daemon

# Verify
sudo systemctl status tuitional-app
sudo systemctl status tuitional-daemon
```

---

## 4. Caddy Reverse Proxy (HTTPS)

```
# /etc/caddy/Caddyfile
agent.tuitionaledu.com {
    encode zstd gzip
    tls {
        protocols tls1.3
    }
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
    }
}
```

```bash
sudo systemctl restart caddy
```

---

## 5. Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Caddy redirect)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 6. Cron Jobs

```bash
# Edit crontab for tuitional user
sudo -u tuitional crontab -e

# Add these lines:

# Google Sheets sync — every 15 minutes
*/15 * * * * cd /home/tuitional/app && node scripts/sync-sheets.js >> /var/log/tuitional/sync.log 2>&1

# Database backup — every 6 hours
0 */6 * * * cd /home/tuitional/app && node scripts/backup-db.js >> /var/log/tuitional/backup.log 2>&1

# Memory backup — every 6 hours (OpenClaw .openclaw folder)
0 */6 * * * cp -r /home/tuitional/.openclaw /home/tuitional/backups/openclaw-$(date +\%Y\%m\%d-\%H) 2>&1

# Log rotation
0 0 * * * find /var/log/tuitional -name "*.log" -mtime +30 -delete
```

```bash
# Create log directory
sudo mkdir -p /var/log/tuitional
sudo chown tuitional:tuitional /var/log/tuitional
sudo mkdir -p /home/tuitional/backups
sudo chown tuitional:tuitional /home/tuitional/backups
```

---

## 7. OpenClaw Installation (After coded infrastructure is verified)

```bash
# Install OpenClaw
curl -fsSL https://openclaw.ai/install.sh | bash

# Configure (see /docs/OPENCLAW-BRIDGE.md for full config)
openclaw config set gateway.auth.token "$(openssl rand -hex 32)"

# Copy agent files
cp -r /home/tuitional/app/agent-files/wajeeha/* ~/.openclaw/workspace/

# Enable memory flush
# Edit ~/.openclaw/openclaw.json — add compaction config from OPENCLAW-BRIDGE.md

# Start gateway
openclaw gateway start

# Verify
openclaw gateway status
```

---

## 8. NemoClaw (Production Security — When Handling Live Data)

```bash
git clone https://github.com/NVIDIA/NemoClaw.git /home/tuitional/nemoclaw
cd /home/tuitional/nemoclaw
./install.sh
nemoclaw launch --profile default
```

Only deploy NemoClaw AFTER shadow mode testing is complete and before handling live parent data.

---

## 9. Health Monitoring

```bash
# Check application health
curl -s https://agent.tuitionaledu.com/api/health | jq .

# Check daemon is running
sudo systemctl is-active tuitional-daemon

# Check logs
sudo journalctl -u tuitional-app -f
sudo journalctl -u tuitional-daemon -f

# Check disk space
df -h

# Check memory
free -h
```

---

## 10. Deployment Script

```bash
#!/bin/bash
# /home/tuitional/app/scripts/deploy.sh
# Run after pushing changes to git

set -e

echo "=== Pulling latest code ==="
cd /home/tuitional/app
git pull origin main

echo "=== Installing dependencies ==="
npm install --production

echo "=== Building ==="
npm run build

echo "=== Running migrations ==="
node scripts/run-migrations.js

echo "=== Restarting services ==="
sudo systemctl restart tuitional-app
sudo systemctl restart tuitional-daemon

echo "=== Verifying health ==="
sleep 5
curl -s http://localhost:3000/api/health | jq .

echo "=== Deployment complete ==="
```

```bash
chmod +x /home/tuitional/app/scripts/deploy.sh
```
