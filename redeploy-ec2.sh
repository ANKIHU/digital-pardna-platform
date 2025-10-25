#!/bin/bash

# Complete redeployment to EC2
echo "🚀 Redeploying complete PardnaLink to EC2..."

# Package the application
tar -czf pardnalink-complete.tar.gz apps/ packages/ package.json pnpm-workspace.yaml

# Upload to EC2 (replace with your key path)
scp -i ~/.ssh/your-key.pem pardnalink-complete.tar.gz ec2-user@52.23.203.107:~/

# Deploy on EC2
ssh -i ~/.ssh/your-key.pem ec2-user@52.23.203.107 << 'EOF'
# Stop existing services
pkill -f "node"

# Extract new code
tar -xzf pardnalink-complete.tar.gz
cd apps/api

# Install dependencies
npm install --production

# Build TypeScript
npm run build

# Start service
nohup node dist/index.js > /var/log/pardnalink.log 2>&1 &

echo "✅ PardnaLink redeployed successfully"
EOF

echo "🎉 Deployment complete!"