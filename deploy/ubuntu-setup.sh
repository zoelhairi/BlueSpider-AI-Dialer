#!/usr/bin/env bash
# ==============================================================================
# Automated Production Setup Script for Ubuntu 22.04 / 24.04 LTS
# Deploys Vapi Voice AI Platform with Docker, Nginx Reverse Proxy, and SSL
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo " Starting Vapi Voice AI Platform Ubuntu Deployment"
echo "=========================================================="

# 1. Update OS packages
echo "--> Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw jq unzip apt-transport-https ca-certificates gnupg lsb-release

# 2. Install Docker & Docker Compose
echo "--> Installing Docker Engine and Docker Compose Plugin..."
if ! command -v docker &> /dev/null; then
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker "$USER"
  echo "Docker installed successfully."
else
  echo "Docker is already installed."
fi

# 3. Configure Firewall
echo "--> Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 4. Install Nginx and Certbot for SSL
echo "--> Installing Nginx and Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 5. Setup Project Directory & Environment
APP_DIR="/opt/vapi-platform"
echo "--> Setting up application in $APP_DIR..."
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

if [ ! -f "$APP_DIR/.env" ]; then
  if [ -f "./.env.example" ]; then
    cp ./.env.example "$APP_DIR/.env"
  else
    cat << 'EOF' > "$APP_DIR/.env"
NODE_ENV=production
PORT=3000
VAPI_API_KEY=""
VAPI_PUBLIC_KEY=""
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
APP_URL="http://localhost:3000"
EOF
  fi
  echo "Created initial .env file at $APP_DIR/.env. Please configure your API keys."
fi

# 6. Setup Systemd Service for auto-restart
echo "--> Setting up Systemd Service..."
sudo tee /etc/systemd/system/vapi-platform.service > /dev/null << EOF
[Unit]
Description=Vapi Voice AI Orchestrator Container Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable vapi-platform.service

# 7. Configure Nginx Reverse Proxy
echo "--> Creating Nginx reverse proxy configuration..."
sudo tee /etc/nginx/sites-available/vapi-platform > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/vapi-platform /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=========================================================="
echo " Vapi Voice AI Platform Deployment Ready!"
echo " Next steps:"
echo " 1. Edit $APP_DIR/.env to insert your VAPI_API_KEY and SUPABASE credentials"
echo " 2. Run 'cd $APP_DIR && docker compose up -d --build'"
echo " 3. Setup SSL: sudo certbot --nginx -d your-domain.com"
echo "=========================================================="
