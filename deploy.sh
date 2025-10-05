#!/bin/bash

# # Env Vars
API_URL="http://localhost:8000/api" # for the demo app
SECRET_KEY="my-secret" # for the demo app
NEXT_PUBLIC_SAFE_KEY="safe-key" # for the demo app
DOMAIN_NAME="task.io" # replace with your own
EMAIL="rick@task.com" # replace with your own

# Script Vars
REPO_URL="https://github.com/de-azaglo/task.git"
APP_DIR=~/task
SWAP_SIZE="1G"  # Swap size of 1GB

# Update package list and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Add Swap Space
echo "Adding swap space..."
sudo fallocate -l $SWAP_SIZE /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Install Docker
# Install Docker (only if not installed)
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
  sudo apt update
  sudo apt install docker-ce -y
  
  # Ensure Docker starts on boot
  sudo systemctl enable docker
  sudo systemctl start docker
else
  echo "Docker already installed, skipping..."
fi

# Install Docker Compose

# Install Docker Compose (only if not installed or outdated)
if ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  
  if [ ! -f /usr/local/bin/docker-compose ]; then
    echo "Docker Compose download failed. Exiting."
    exit 1
  fi
  
  sudo chmod +x /usr/local/bin/docker-compose
  sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
  echo "Docker Compose already installed, skipping..."
fi

# Verify Docker Compose installation
docker-compose --version
if [ $? -ne 0 ]; then
  echo "Docker Compose installation failed. Exiting."
  exit 1
fi


# Clone the Git repository
if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR already exists. Pulling latest changes..."
  cd $APP_DIR && git pull
else
  echo "Cloning repository from $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Create the .env file inside the app directory (~/task/.env)
cat > "$APP_DIR/.env" <<EOF
API_URL=$API_URL
SECRET_KEY=$SECRET_KEY
NEXT_PUBLIC_SAFE_KEY=$NEXT_PUBLIC_SAFE_KEY
EOF

# Install Nginx
sudo apt install nginx -y

# Remove old Nginx config (if it exists)
sudo rm -f /etc/nginx/sites-available/task
sudo rm -f /etc/nginx/sites-enabled/task

# Obtain SSL certificate using Certbot (uncomment if you need to set up SSL for the first time)
# # Stop Nginx temporarily to allow Certbot to run in standalone mode
# sudo systemctl stop nginx

# # Obtain SSL certificate using Certbot standalone mode
# sudo apt install certbot -y
# sudo certbot certonly --standalone -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL

# # Ensure SSL files exist or generate them
# if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
#   sudo wget https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
# fi

# if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
#   sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
# fi

# Create Nginx config with reverse proxy, SSL support, rate limiting, and streaming support
sudo tee /etc/nginx/sites-available/task > /dev/null <<EOL
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name $DOMAIN_NAME;

     # Enable rate limiting
    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;

        # Disable buffering for streaming support
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
    }

    # # Redirect all HTTP requests to HTTPS
    # return 301 https://\$host\$request_uri;
}

# Uncomment the following block if SSL is set up
# server {
#     listen 443 ssl;
#     server_name $DOMAIN_NAME;

#     ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
#     include /etc/letsencrypt/options-ssl-nginx.conf;
#     ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

#     # Enable rate limiting
#     limit_req zone=mylimit burst=20 nodelay;

#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_cache_bypass \$http_upgrade;

#         # Disable buffering for streaming support
#         proxy_buffering off;
#         proxy_set_header X-Accel-Buffering no;
#     }
# }
EOL

# Create symbolic link if it doesn't already exist
sudo ln -s /etc/nginx/sites-available/task /etc/nginx/sites-enabled/task

# Add domain to /etc/hosts if not already present (for local testing)
if ! grep -q "$DOMAIN_NAME" /etc/hosts; then
  echo "Adding $DOMAIN_NAME to /etc/hosts..."
  echo "127.0.0.1 $DOMAIN_NAME" | sudo tee -a /etc/hosts
else
  echo "$DOMAIN_NAME already in /etc/hosts, skipping..."
fi

# Restart Nginx to apply the new configuration
sudo systemctl restart nginx

# Build and run the Docker containers from the app directory (~/task)
cd $APP_DIR
sudo docker-compose up --build -d

# Check if Docker Compose started correctly
if ! sudo docker-compose ps | grep "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker-compose logs'."
  exit 1
fi

# Uncomment the following lines if you need to set up SSL for the first time
# Setup automatic SSL certificate renewal...
# ( crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx" ) | crontab -

# Output final message
echo "
===============================================
Deployment complete!
===============================================
Your Next.js app is available at: http://$DOMAIN_NAME

Environment variables configured:
- API_URL
- SECRET_KEY
- NEXT_PUBLIC_SAFE_KEY

NOTE: SSL/HTTPS is currently disabled.
When you have a domain, update the script to enable SSL.
===============================================
"