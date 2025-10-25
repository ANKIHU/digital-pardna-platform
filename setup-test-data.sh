#!/bin/bash

# Setup test data for PardnaLink platform
API_URL="http://52.23.203.107:3001/v1"

echo "🔧 Setting up test data..."

# Create test users
echo "👥 Creating test users..."
curl -X POST $API_URL/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Customer",
    "email": "customer@test.com",
    "phone": "+1876-555-0001",
    "userType": "customer"
  }'

curl -X POST $API_URL/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Corporate",
    "email": "corporate@test.com", 
    "phone": "+1876-555-0002",
    "userType": "corporate"
  }'

# Create test circle
echo "⭕ Creating test circle..."
curl -X POST $API_URL/circles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Family Circle",
    "handAmountMinor": 50000,
    "currency": "JMD",
    "intervalSeconds": 2592000,
    "startAtISO": "2024-01-01T00:00:00Z",
    "members": [
      {"userId": "550e8400-e29b-41d4-a716-446655440000", "payoutPosition": 0}
    ]
  }'

echo "✅ Test data setup complete!"