#!/bin/bash

echo "🚀 Deploying Local Environment..."

# Ensure docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start containers
echo "🏗️ Building and Starting services (Locally)..."
docker-compose up -d --build

# Check status
echo "✅ Local Deployment complete! Checking status..."
docker-compose ps

echo "🌐 App should be accessible at http://localhost:8081"
