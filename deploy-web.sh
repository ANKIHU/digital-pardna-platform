#!/bin/bash

echo "🚀 Building and deploying PardnaLink Web Frontend..."

# Build the Docker image
docker build -f Dockerfile.web -t pardnalink-web .

# Stop existing container if running
docker stop pardnalink-web 2>/dev/null || true
docker rm pardnalink-web 2>/dev/null || true

# Run the new container
docker run -d \
  --name pardnalink-web \
  -p 3000:3000 \
  --env-file .env.local \
  pardnalink-web

echo "✅ Web frontend deployed on port 3000"
echo "🌐 Access at: http://localhost:3000"