#!/bin/bash

# Start PardnaLink Services on EC2
set -e

echo "🔥 Starting PardnaLink Services..."

# Update environment for production
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:SecurePassword123!@your-rds-endpoint:5432/pardnalink"

# Start API service
echo "🚀 Starting API service..."
cd apps/api
npm start > /var/log/pardnalink-api.log 2>&1 &
echo $! > /var/run/pardnalink-api.pid
echo "API started (PID: $(cat /var/run/pardnalink-api.pid))"

# Start web service  
echo "🌐 Starting Web service..."
cd ../web
npm start > /var/log/pardnalink-web.log 2>&1 &
echo $! > /var/run/pardnalink-web.pid
echo "Web started (PID: $(cat /var/run/pardnalink-web.pid))"

echo "✅ All services started!"
echo "📊 Check logs:"
echo "  API: tail -f /var/log/pardnalink-api.log"
echo "  Web: tail -f /var/log/pardnalink-web.log"