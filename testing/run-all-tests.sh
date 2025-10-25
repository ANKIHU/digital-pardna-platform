#!/bin/bash

# PardnaLink Complete Testing Suite Runner
echo "🚀 PARDNALINK PLATFORM TESTING SUITE"
echo "===================================="
echo "Testing all access tiers: Customer, Corporate, Third-Party"
echo ""

# Check server health first
echo "🔍 Checking server health..."
HEALTH_CHECK=$(curl -s -w "%{http_code}" http://52.23.203.107:3001/v1/health)
if [[ "$HEALTH_CHECK" != *"200"* ]]; then
    echo "❌ Server is not responding. Please start the server first."
    exit 1
fi
echo "✅ Server is healthy"
echo ""

# Run Customer Tests
echo "🧪 RUNNING CUSTOMER TESTS"
echo "========================="
chmod +x customer-tests.sh
./customer-tests.sh
echo ""

# Run Corporate Tests
echo "🏢 RUNNING CORPORATE TESTS"
echo "=========================="
chmod +x corporate-tests.sh
./corporate-tests.sh
echo ""

# Run Third-Party Tests
echo "🔌 RUNNING THIRD-PARTY TESTS"
echo "============================"
chmod +x third-party-tests.sh
./third-party-tests.sh
echo ""

echo "🎯 ALL TESTING COMPLETED!"
echo "========================"
echo "Review the results above for any failures or issues."
echo "Check the server logs for detailed error information."