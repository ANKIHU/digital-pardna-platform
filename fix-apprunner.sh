#!/bin/bash

SERVICE_NAME="pardnalink-api"
REGION="us-east-1"

echo "🔍 Checking App Runner service status..."

# Get service details and failure reason
aws apprunner describe-service --service-arn "arn:aws:apprunner:us-east-1:594194992190:service/pardnalink-api/5896e2fa37104ae0ab596eb410ff9102" --region $REGION

echo "🗑️ Deleting failed service..."
aws apprunner delete-service --service-arn "arn:aws:apprunner:us-east-1:594194992190:service/pardnalink-api/5896e2fa37104ae0ab596eb410ff9102" --region $REGION

echo "⏳ Waiting for deletion..."
sleep 30

echo "🚀 Creating new App Runner service..."
aws apprunner create-service \
  --service-name $SERVICE_NAME \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "594194992190.dkr.ecr.us-east-1.amazonaws.com/pardnalink-api:latest",
      "ImageConfiguration": {
        "Port": "3001",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production"
        }
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": false
  }' \
  --instance-configuration '{
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  }' \
  --region $REGION