#!/bin/bash

echo "🚀 Deploying Production Build to Proxmox (172.18.121.18)..."

# Ensure docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Prune unused images to save space (optional)
echo "🧹 Cleaning up unused images..."
docker image prune -f

# Build and start containers
echo "🏗️ Building and Starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
echo "✅ Deployment complete! Checking status..."
docker-compose -f docker-compose.prod.yml ps

echo "🌐 App should be accessible at http://172.18.121.18 or https://172.18.121.18"
