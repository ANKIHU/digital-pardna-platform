#!/bin/bash

echo "🚀 Deploying complete PardnaLink server to EC2..."

# Upload the complete server file
scp -o StrictHostKeyChecking=no complete-server.js ec2-user@52.23.203.107:~/

# Deploy on EC2
ssh -o StrictHostKeyChecking=no ec2-user@52.23.203.107 << 'EOF'
# Stop existing server
pkill -f "node"

# Start new complete server
nohup node complete-server.js > /var/log/pardnalink-complete.log 2>&1 &

echo "✅ Complete PardnaLink server deployed"
sleep 3

# Test endpoints
echo "🧪 Testing endpoints..."
curl -s http://localhost:3001/v1/health && echo " ✅ Health OK"
curl -s http://localhost:3001/v1/circles && echo " ✅ Circles OK"
EOF

echo "🎉 Deployment complete! Testing from outside..."
sleep 5
curl -s http://52.23.203.107:3001/v1/health && echo " ✅ External access OK"