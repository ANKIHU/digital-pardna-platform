#!/bin/bash

# Deploy Digital Pardna to AWS ECS Fargate
echo "🚀 Deploying Digital Pardna to AWS ECS Fargate..."

# Variables
CLUSTER_NAME="digital-pardna-cluster"
SERVICE_NAME="digital-pardna-service"
TASK_DEFINITION="digital-pardna-task"
REGION="us-east-1"

# Create ECS cluster
echo "📋 Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $REGION

# Create task definition
echo "📝 Creating task definition..."
cat > task-definition.json << EOF
{
  "family": "$TASK_DEFINITION",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::594194992190:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "digital-pardna-web",
      "image": "node:18-alpine",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "command": [
        "sh", "-c",
        "cd /app && npm install && npm run build && npm start"
      ],
      "workingDirectory": "/app",
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"},
        {"name": "NEXT_PUBLIC_API_URL", "value": "http://localhost:4000/v1"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/digital-pardna",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json --region $REGION

# Create service
echo "🌐 Creating ECS service..."
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --task-definition $TASK_DEFINITION \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --region $REGION

echo "✅ Deployment to ECS Fargate initiated!"
echo "🌐 Your app will be available at the ECS service endpoint once running."