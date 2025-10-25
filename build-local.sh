#!/bin/bash

echo "🚀 Building PardnaLink Backend locally..."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    brew install --cask docker
    echo "Please start Docker Desktop and run this script again"
    exit 1
fi

# Build the image locally first
docker build -f Dockerfile.api -t pardnalink-api:latest .

echo "✅ Backend built successfully: pardnalink-api:latest"
echo "🔧 To push to ECR, ensure AWS permissions and run: ./build-ecr.sh"