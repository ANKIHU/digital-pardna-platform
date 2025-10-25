#!/bin/bash

# Simple AWS deployment without Docker
set -e

echo "🚀 Deploying Digital Pardna to AWS (without Docker)..."

REGION="us-east-1"
STACK_NAME="digital-pardna-stack"

# Deploy CloudFormation stack
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file aws-deploy.yml \
  --stack-name $STACK_NAME \
  --parameter-overrides DBPassword=SecurePassword123! \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "✅ Infrastructure deployed!"
echo "📊 Check your stack: $STACK_NAME"
echo "🔗 Next: Build and push Docker images manually"