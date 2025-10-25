#!/bin/bash

echo "Setting up pardnalink.com domain configuration..."

# Install nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/pardnalink.com
sudo ln -sf /etc/nginx/sites-available/pardnalink.com /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
    sudo systemctl reload nginx
    sudo systemctl enable nginx
else
    echo "Nginx configuration has errors. Please check the config."
    exit 1
fi

# Install certbot for SSL (Let's Encrypt)
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot for SSL certificates..."
    sudo apt install -y certbot python3-certbot-nginx
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your DNS points pardnalink.com to this server (54.221.21.228)"
echo "2. Run: sudo certbot --nginx -d pardnalink.com -d www.pardnalink.com"
echo "3. Restart your services: npm run dev (frontend) and npm run backend:dev (API)"
echo ""
echo "Your site will be available at: https://pardnalink.com"