#!/bin/bash

# PardnaLink Third-Party API Testing Suite
API_BASE="http://52.23.203.107:3001/api"
API_KEY="third-party-test-key-123"

echo "🔌 PARDNALINK THIRD-PARTY API TESTING SUITE"
echo "============================================"

# Test 1: API Authentication
echo "1️⃣ Testing API Authentication..."
AUTH_RESPONSE=$(curl -s -X GET "$API_BASE/v1/auth/verify" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json")

echo "Auth Response: $AUTH_RESPONSE"

# Test 2: Circle Data Access
echo "2️⃣ Testing Circle Data Access..."
CIRCLES_API_RESPONSE=$(curl -s -X GET "$API_BASE/v1/circles" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json")

echo "Circles API: $CIRCLES_API_RESPONSE"

# Test 3: User Data Access (Limited)
echo "3️⃣ Testing User Data Access..."
USERS_API_RESPONSE=$(curl -s -X GET "$API_BASE/v1/users/summary" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json")

echo "Users API: $USERS_API_RESPONSE"

# Test 4: Payment Processing
echo "4️⃣ Testing Payment Processing..."
PAYMENT_API_RESPONSE=$(curl -s -X POST "$API_BASE/v1/payments/process" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"currency":"USD","method":"card","reference":"test-payment-123"}')

echo "Payment API: $PAYMENT_API_RESPONSE"

# Test 5: KYC Integration
echo "5️⃣ Testing KYC Integration..."
KYC_API_RESPONSE=$(curl -s -X POST "$API_BASE/v1/kyc/verify" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","documentType":"passport","documentNumber":"A12345678"}')

echo "KYC API: $KYC_API_RESPONSE"

# Test 6: Webhook Endpoint
echo "6️⃣ Testing Webhook Endpoint..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$API_BASE/webhooks/payment" \
  -H "X-Signature: webhook-signature-123" \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.completed","data":{"paymentId":"pay-123","amount":1000,"status":"completed"}}')

echo "Webhook: $WEBHOOK_RESPONSE"

# Test 7: Rate Limiting
echo "7️⃣ Testing Rate Limiting..."
for i in {1..5}; do
  RATE_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$API_BASE/v1/health" \
    -H "X-API-Key: $API_KEY")
  echo "Rate Test $i: $RATE_RESPONSE"
done

echo "✅ Third-party API testing completed!"