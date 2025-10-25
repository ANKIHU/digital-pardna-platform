#!/bin/bash

echo "🚀 Deploying Digital Pardna Platform to AWS ECS..."

# Build and push images to ECR
echo "📦 Building Docker images..."

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 594194992190.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repositories if they don't exist
aws ecr create-repository --repository-name digital-pardna-web --region us-east-1 2>/dev/null || true
aws ecr create-repository --repository-name digital-pardna-api --region us-east-1 2>/dev/null || true

# Build web image
echo "🌐 Building web application..."
cd apps/web
docker build -t digital-pardna-web .
docker tag digital-pardna-web:latest 594194992190.dkr.ecr.us-east-1.amazonaws.com/digital-pardna-web:latest
docker push 594194992190.dkr.ecr.us-east-1.amazonaws.com/digital-pardna-web:latest

# Build API image  
echo "🔧 Building API..."
cd ../api
docker build -t digital-pardna-api .
docker tag digital-pardna-api:latest 594194992190.dkr.ecr.us-east-1.amazonaws.com/digital-pardna-api:latest
docker push 594194992190.dkr.ecr.us-east-1.amazonaws.com/digital-pardna-api:latest

cd ../..

# Deploy using docker-compose on EC2
echo "🚀 Deploying to production..."

# Create a simple deployment
cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  web:
    image: 594194992190.dkr.ecr.us-east-1.amazonaws.com/digital-pardna-web:latest
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:4000/v1
    restart: unless-stopped

  api:
    image: 594194992190.dkr.ecr.us-east-1.amazonaws.com/digital-pardna-api:latest
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
    restart: unless-stopped
EOF

echo "✅ Docker images built and pushed to ECR!"
echo "🌐 Deploy docker-compose.prod.yml to your EC2 instance to run the platform"
echo "📋 Your platform will be available at http://your-ec2-ip"