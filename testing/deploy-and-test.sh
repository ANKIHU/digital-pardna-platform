#!/bin/bash

# PardnaLink Deploy and Test Script
SERVER_IP="52.23.203.107"
KEY_PATH="/Users/macbookair/Downloads/pardnalink-keypair.pem"

echo "🚀 PARDNALINK DEPLOY AND TEST PIPELINE"
echo "======================================"

# Step 1: Check server connectivity
echo "1️⃣ Checking server connectivity..."
if ! ping -c 1 $SERVER_IP &> /dev/null; then
    echo "❌ Server not reachable. Check AWS instance status."
    exit 1
fi
echo "✅ Server is reachable"

# Step 2: Deploy latest code (if needed)
echo "2️⃣ Checking server status..."
SERVER_STATUS=$(curl -s -w "%{http_code}" http://$SERVER_IP:3001/v1/health)
if [[ "$SERVER_STATUS" != *"200"* ]]; then
    echo "⚠️ Server not responding. Attempting to restart..."
    
    # Try to restart via SSH (may timeout)
    timeout 30 ssh -i $KEY_PATH -o StrictHostKeyChecking=no ec2-user@$SERVER_IP \
        "cd /home/ec2-user/digital-pardna-platform/backend && pm2 restart all" || \
        echo "⚠️ SSH restart may have timed out, but server might be starting..."
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        sleep 2
        if curl -s http://$SERVER_IP:3001/v1/health &> /dev/null; then
            echo "✅ Server is now responding"
            break
        fi
        echo "Waiting... ($i/30)"
    done
else
    echo "✅ Server is already running"
fi

# Step 3: Run comprehensive tests
echo "3️⃣ Running comprehensive tests..."
./run-all-tests.sh

# Step 4: Run performance tests
echo "4️⃣ Running performance tests..."
./load-test.sh

# Step 5: Run security tests
echo "5️⃣ Running security tests..."
./security-tests.sh

echo ""
echo "🎯 DEPLOYMENT AND TESTING COMPLETED!"
echo "==================================="
echo "Platform Status: $(curl -s http://$SERVER_IP:3001/v1/health 2>/dev/null || echo 'Not responding')"
echo "Access URLs:"
echo "  - API Health: http://$SERVER_IP:3001/v1/health"
echo "  - Customer Portal: http://$SERVER_IP:3001/v1/"
echo "  - Admin Dashboard: http://$SERVER_IP:3001/v1/admin/"
echo "  - Third-Party API: http://$SERVER_IP:3001/api/v1/"