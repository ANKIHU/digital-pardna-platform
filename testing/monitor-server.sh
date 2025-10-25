#!/bin/bash

# PardnaLink Server Monitoring Script
SERVER_IP="52.23.203.107"
API_BASE="http://$SERVER_IP:3001/v1"

echo "📊 PARDNALINK SERVER MONITORING"
echo "==============================="

# Function to check server status
check_server() {
    echo "🔍 Checking server status..."
    
    # Check ping connectivity
    if ping -c 1 $SERVER_IP &> /dev/null; then
        echo "✅ Server is reachable via ping"
    else
        echo "❌ Server not reachable via ping"
        return 1
    fi
    
    # Check API health
    HEALTH_RESPONSE=$(curl -s -w "%{http_code}" $API_BASE/health)
    if [[ "$HEALTH_RESPONSE" == *"200"* ]]; then
        echo "✅ API is responding (HTTP 200)"
        return 0
    else
        echo "❌ API not responding (HTTP: ${HEALTH_RESPONSE:-'No response'})"
        return 1
    fi
}

# Function to show restart instructions
show_restart_instructions() {
    echo ""
    echo "🔧 SERVER RESTART INSTRUCTIONS"
    echo "=============================="
    echo "1. Connect to AWS Console"
    echo "2. Navigate to EC2 Dashboard"
    echo "3. Find instance: ip-10-0-1-213.ec2.internal"
    echo "4. If stopped, click 'Start Instance'"
    echo "5. If running, connect via Session Manager or SSH:"
    echo ""
    echo "   SSH Command:"
    echo "   ssh -i /Users/macbookair/Downloads/pardnalink-keypair.pem ec2-user@$SERVER_IP"
    echo ""
    echo "   Then run:"
    echo "   cd /home/ec2-user/digital-pardna-platform/backend"
    echo "   pm2 status"
    echo "   pm2 restart all"
    echo "   pm2 logs"
    echo ""
    echo "6. Wait 30-60 seconds for server to start"
    echo "7. Test with: curl http://$SERVER_IP:3001/v1/health"
}

# Main monitoring loop
while true; do
    if check_server; then
        echo "🎯 Server is operational!"
        echo ""
        echo "📋 READY TO RUN TESTS:"
        echo "====================="
        echo "./run-all-tests.sh     # All tests"
        echo "./customer-tests.sh    # Customer tests"
        echo "./corporate-tests.sh   # Corporate tests"
        echo "./third-party-tests.sh # API tests"
        echo "./load-test.sh         # Performance tests"
        echo "./security-tests.sh    # Security tests"
        break
    else
        show_restart_instructions
        echo ""
        echo "⏳ Retrying in 30 seconds... (Ctrl+C to exit)"
        sleep 30
    fi
done