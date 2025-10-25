#!/bin/bash

# PardnaLink Customer Testing Suite
API_BASE="http://localhost:4000/v1"
TEST_EMAIL="customer@test.com"
TEST_PHONE="+1234567890"

echo "🧪 PARDNALINK CUSTOMER TESTING SUITE"
echo "===================================="

# Test 1: Customer Registration
echo "1️⃣ Testing Customer Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"phone\":\"$TEST_PHONE\",\"firstName\":\"Test\",\"lastName\":\"Customer\"}")

echo "Registration Response: $REGISTER_RESPONSE"

# Test 2: Customer Login
echo "2️⃣ Testing Customer Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Login Response: $LOGIN_RESPONSE"

# Test 3: Profile Access
echo "3️⃣ Testing Profile Access..."
PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/users/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"

# Test 4: Circle Creation
echo "4️⃣ Testing Circle Creation..."
CIRCLE_RESPONSE=$(curl -s -X POST "$API_BASE/circles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Circle","handAmountMinor":100000,"currency":"USD","intervalSeconds":604800,"startAtISO":"2024-12-01T00:00:00Z","members":[{"userId":"test-user-123","payoutPosition":0}]}')

echo "Circle Response: $CIRCLE_RESPONSE"

# Test 5: KYC Status Check
echo "5️⃣ Testing KYC Status..."
KYC_RESPONSE=$(curl -s -X GET "$API_BASE/kyc/status" \
  -H "Authorization: Bearer $TOKEN")

echo "KYC Response: $KYC_RESPONSE"

# Test 6: Payment Methods
echo "6️⃣ Testing Payment Methods..."
PAYMENT_RESPONSE=$(curl -s -X GET "$API_BASE/payments/methods" \
  -H "Authorization: Bearer $TOKEN")

echo "Payment Methods: $PAYMENT_RESPONSE"

echo "✅ Customer testing completed!"