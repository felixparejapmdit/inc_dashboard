#!/bin/bash

echo "🚀 Deploying Local Environment..."

# 1. Ensure docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found!"
    exit 1
fi

# 2. Sync .env
if [ -f ".env.docker" ]; then
    echo "📄 Syncing .env.docker to .env..."
    cp .env.docker .env
fi

# 3. Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down --remove-orphans

# 4. Deep Clean
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

# 5. Build and start containers
echo "🏗️ Building and Starting services (Locally)..."
docker compose up -d --build

# 6. Check status
echo "✅ Local Deployment complete! Checking status..."
docker compose ps

echo "🌐 App should be accessible at http://localhost:8081"
