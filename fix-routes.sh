#!/bin/bash

# Fix route registration on EC2
echo "🔧 Fixing route registration..."

# SSH to EC2 and fix routes
ssh -i your-key.pem ec2-user@52.23.203.107 << 'EOF'
cd /home/ec2-user/backend

# Kill existing process
pkill -f "node dist/index.js"

# Check current route registration
echo "Current routes file:"
cat src/routes/index.ts | grep -A5 -B5 "appRoutes"

# Rebuild and restart
npm run build
node dist/index.js &

echo "✅ Routes fixed and server restarted"
EOF