#!/bin/bash

# EC2 Deployment Script for PardnaLink
set -e

echo "🚀 Deploying PardnaLink to EC2..."

# Install dependencies
echo "📦 Installing dependencies..."
cd apps/api
npm install
cd ../..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd apps/api
npx prisma generate
cd ../..

# Push database schema
echo "🗄️ Setting up database schema..."
cd apps/api
npx prisma db push
cd ../..

# Start API service
echo "🔥 Starting API service..."
cd apps/api
npm run dev &
API_PID=$!
echo "API started with PID: $API_PID"

# Start web service
echo "🌐 Starting web service..."
cd ../web
npm install
npm run build
npm start &
WEB_PID=$!
echo "Web started with PID: $WEB_PID"

echo "✅ PardnaLink deployed!"
echo "API: http://localhost:4000"
echo "Web: http://localhost:3000"
echo "PIDs: API=$API_PID, WEB=$WEB_PID"