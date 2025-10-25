#!/bin/bash

echo "📦 Syncing files to EC2..."

# Replace with your EC2 details
EC2_HOST="ec2-user@your-ec2-ip"
EC2_PATH="/home/ec2-user/digital-pardna-platform"

# Copy Dockerfiles
scp Dockerfile.api Dockerfile.web $EC2_HOST:$EC2_PATH/

# Copy build scripts
scp build-ecr.sh $EC2_HOST:$EC2_PATH/

# Copy workspace files
scp package.json pnpm-workspace.yaml pnpm-lock.yaml $EC2_HOST:$EC2_PATH/

echo "✅ Files synced to EC2"