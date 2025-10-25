#!/bin/bash

echo "🧪 QUICK PLATFORM TEST"
echo "====================="

# Test 1: Health Check
echo "1️⃣ Health Check:"
curl -s http://localhost:4000/v1/health
echo -e "\n"

# Test 2: Registration (should work)
echo "2️⃣ Registration:"
curl -s -X POST http://localhost:4000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"quicktest@test.com","phone":"+1234567890","firstName":"Quick","lastName":"Test"}'
echo -e "\n"

# Test 3: Login (should fail - no password)
echo "3️⃣ Login:"
curl -s -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"quicktest@test.com","password":"test123"}'
echo -e "\n"

echo "✅ Quick test complete!"