#!/bin/bash

# PardnaLink Security Testing Suite
API_BASE="http://52.23.203.107:3001/v1"

echo "🔒 PARDNALINK SECURITY TESTING SUITE"
echo "===================================="

# Test 1: SQL Injection Protection
echo "1️⃣ Testing SQL Injection Protection..."
SQL_INJECTION_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\''OR 1=1--","password":"anything"}')

echo "SQL Injection Test: $SQL_INJECTION_RESPONSE"

# Test 2: XSS Protection
echo "2️⃣ Testing XSS Protection..."
XSS_RESPONSE=$(curl -s -X POST "$API_BASE/users/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","firstName":"<script>alert(\"XSS\")</script>","lastName":"Test"}')

echo "XSS Test: $XSS_RESPONSE"

# Test 3: Authentication Bypass
echo "3️⃣ Testing Authentication Bypass..."
AUTH_BYPASS_RESPONSE=$(curl -s -X GET "$API_BASE/users/profile" \
  -H "Authorization: Bearer invalid-token")

echo "Auth Bypass Test: $AUTH_BYPASS_RESPONSE"

# Test 4: Rate Limiting
echo "4️⃣ Testing Rate Limiting..."
for i in {1..20}; do
    RATE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$API_BASE/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"wrong"}')
    echo "Rate Limit Test $i: $RATE_RESPONSE"
    if [[ "$RATE_RESPONSE" == *"429"* ]]; then
        echo "✅ Rate limiting is working"
        break
    fi
done

# Test 5: CORS Headers
echo "5️⃣ Testing CORS Headers..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$API_BASE/health" \
  -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: GET")

echo "CORS Test: $CORS_RESPONSE"

# Test 6: Input Validation
echo "6️⃣ Testing Input Validation..."
VALIDATION_RESPONSE=$(curl -s -X POST "$API_BASE/circles" \
  -H "Content-Type: application/json" \
  -d '{"name":"","contributionAmount":-1000,"frequency":"INVALID"}')

echo "Input Validation Test: $VALIDATION_RESPONSE"

echo "✅ Security testing completed!"