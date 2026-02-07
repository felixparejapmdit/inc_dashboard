#!/bin/bash

echo "🚀 Deploying Production Build to Proxmox (172.18.121.18)..."

# 1. Check for docker-compose file
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found!"
    exit 1
fi

# 2. Sync .env.docker to .env
if [ -f ".env.docker" ]; then
    echo "📄 Syncing .env.docker to .env..."
    cp .env.docker .env
fi

# 3. Stop existing containers (Pinalitan ng 'docker compose')
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans

# 4. Deep Clean
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

# 5. Build and start containers (Pinalitan ng 'docker compose')
echo "🏗️ Building and Starting services..."
docker compose -f docker-compose.prod.yml up -d --build

# 6. Check status
echo "⏳ Waiting for services to initialize..."
sleep 5
echo "✅ Deployment complete! Status:"
docker compose -f docker-compose.prod.yml ps

echo "🌐 Dashboard: https://test-portal.pmdmc.net"
echo "📡 API: https://test-api-portal.pmdmc.net"

# 7. Show logs
echo "📝 Recent Backend Logs:"
docker compose -f docker-compose.prod.yml logs --tail=10 backend