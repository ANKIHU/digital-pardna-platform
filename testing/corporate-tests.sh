#!/bin/bash

# PardnaLink Corporate Testing Suite
API_BASE="http://52.23.203.107:3001/v1"
ADMIN_EMAIL="admin@pardnalink.com"
ADMIN_PASSWORD="admin123"

echo "🏢 PARDNALINK CORPORATE TESTING SUITE"
echo "====================================="

# Test 1: Admin Login
echo "1️⃣ Testing Admin Login..."
ADMIN_LOGIN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin Login: $ADMIN_LOGIN"

# Test 2: Dashboard Analytics
echo "2️⃣ Testing Dashboard Analytics..."
ANALYTICS_RESPONSE=$(curl -s -X GET "$API_BASE/admin/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Analytics: $ANALYTICS_RESPONSE"

# Test 3: User Management
echo "3️⃣ Testing User Management..."
USERS_RESPONSE=$(curl -s -X GET "$API_BASE/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Users List: $USERS_RESPONSE"

# Test 4: Circle Management
echo "4️⃣ Testing Circle Management..."
CIRCLES_RESPONSE=$(curl -s -X GET "$API_BASE/admin/circles" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Circles List: $CIRCLES_RESPONSE"

# Test 5: Fraud Detection
echo "5️⃣ Testing Fraud Detection..."
FRAUD_RESPONSE=$(curl -s -X GET "$API_BASE/admin/fraud/alerts" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Fraud Alerts: $FRAUD_RESPONSE"

# Test 6: Performance Metrics
echo "6️⃣ Testing Performance Metrics..."
METRICS_RESPONSE=$(curl -s -X GET "$API_BASE/admin/metrics" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Metrics: $METRICS_RESPONSE"

# Test 7: Compliance Reports
echo "7️⃣ Testing Compliance Reports..."
COMPLIANCE_RESPONSE=$(curl -s -X GET "$API_BASE/admin/compliance/reports" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Compliance: $COMPLIANCE_RESPONSE"

echo "✅ Corporate testing completed!"