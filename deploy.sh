#!/bin/bash

# Digital Pardna AWS Deployment Script

set -e

echo "🚀 Deploying Digital Pardna to AWS..."

# Variables
REGION="us-east-1"
CLUSTER_NAME="pardnalink-cluster"
SERVICE_NAME="pardnalink-api"
REPO_NAME="pardnalink-api"
ACCOUNT_ID="594194992190"

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -f Dockerfile.api -t $REPO_NAME .

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names $REPO_NAME --region $REGION || \
aws ecr create-repository --repository-name $REPO_NAME --region $REGION

# Get ECR login token
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Tag and push image
ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest"

docker tag $REPO_NAME:latest $ECR_URI
docker push $ECR_URI

echo "✅ Image pushed to ECR: $ECR_URI"

# Deploy CloudFormation stack
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file aws-deploy.yml \
  --stack-name pardnalink-stack \
  --parameter-overrides DBPassword=SecurePassword123! \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "🎉 Deployment complete!"
echo "📊 Check your ECS cluster: $CLUSTER_NAME"