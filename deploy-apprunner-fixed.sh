#!/bin/bash

SERVICE_ARN="arn:aws:apprunner:us-east-1:594194992190:service/pardnalink-api/5896e2fa37104ae0ab596eb410ff9102"

echo "🗑️ Deleting failed service..."
aws apprunner delete-service --service-arn $SERVICE_ARN --region us-east-1

echo "⏳ Waiting for deletion..."
sleep 60

echo "🚀 Creating new service..."
aws apprunner create-service \
  --service-name "pardnalink-api" \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "594194992190.dkr.ecr.us-east-1.amazonaws.com/pardnalink-api:latest",
      "ImageConfiguration": {
        "Port": "3001",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "PORT": "3001"
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
  --region us-east-1