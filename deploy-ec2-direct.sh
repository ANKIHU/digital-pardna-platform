#!/bin/bash

echo "🚀 Building and deploying Digital Pardna platform..."

# Build the web application
echo "📦 Building web application..."
cd apps/web
npm install
npm run build

# Create deployment package
echo "📋 Creating deployment package..."
cd ../..
tar -czf digital-pardna-deploy.tar.gz \
  apps/web/.next \
  apps/web/public \
  apps/web/package.json \
  apps/web/next.config.js \
  apps/api/dist \
  apps/api/package.json \
  apps/api/prisma \
  package.json

# Upload to EC2
echo "🌐 Deploying to EC2..."
EC2_IP="52.23.203.107"
scp -i ~/.ssh/pardnalink-key.pem digital-pardna-deploy.tar.gz ec2-user@$EC2_IP:/home/ec2-user/

# Install and start on EC2
ssh -i ~/.ssh/pardnalink-key.pem ec2-user@$EC2_IP << 'EOF'
  sudo systemctl stop digital-pardna || true
  cd /home/ec2-user
  tar -xzf digital-pardna-deploy.tar.gz
  sudo rm -rf /var/www/digital-pardna
  sudo mkdir -p /var/www/digital-pardna
  sudo cp -r apps/* /var/www/digital-pardna/
  cd /var/www/digital-pardna/api
  sudo npm install --production
  cd ../web
  sudo npm install --production
  
  # Create systemd service
  sudo tee /etc/systemd/system/digital-pardna.service << SERVICE
[Unit]
Description=Digital Pardna Platform
After=network.target

[Service]
Type=forking
User=ec2-user
WorkingDirectory=/var/www/digital-pardna
ExecStart=/bin/bash -c 'cd api && npm start & cd ../web && npm start'
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE

  sudo systemctl daemon-reload
  sudo systemctl enable digital-pardna
  sudo systemctl start digital-pardna
EOF

echo "✅ Deployment complete!"
echo "🌐 Your platform should be available at: http://$EC2_IP"