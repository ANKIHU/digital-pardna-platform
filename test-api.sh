#!/bin/bash

# Test PardnaLink API endpoints
API_URL="http://52.23.203.107:3001"

echo "🧪 Testing PardnaLink API..."

# Test health endpoint
echo "1️⃣ Testing health endpoint..."
curl -s $API_URL/v1/health || curl -s $API_URL/health

echo -e "\n2️⃣ Testing circles endpoint..."
curl -s $API_URL/v1/circles

echo -e "\n3️⃣ Testing members endpoint..."
curl -s $API_URL/v1/circles/test-id/members

echo -e "\n4️⃣ Testing payments endpoint..."
curl -s $API_URL/v1/circles/test-id/payments

echo -e "\n✅ API tests complete!"