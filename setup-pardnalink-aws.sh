#!/bin/bash

echo "🔧 Setting up PardnaLink AWS Environment..."

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    brew install --cask docker
    echo "⚠️  Start Docker Desktop then run this script again"
    exit 1
fi

echo "📋 Configure AWS CLI for PardnaLink:"
echo "Run: aws configure"
echo "Enter PardnaLink AWS credentials (not paradise kool)"
echo ""
echo "Then run: ./build-ecr.sh"