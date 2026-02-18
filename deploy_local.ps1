Write-Host "🚀 Deploying Local Environment..." -ForegroundColor Cyan

# 1. Ensure docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: docker-compose.yml not found!" -ForegroundColor Red
    exit 1
}

# 2. Sync .env
if (Test-Path ".env.docker") {
    Write-Host "📄 Syncing .env.docker to .env..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env" -Force
}

# 3. Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans

# 4. Deep Clean
Write-Host "🧹 Cleaning up unused Docker resources..." -ForegroundColor Yellow
docker system prune -f

# 5. Build and start containers
Write-Host "🏗️ Building and Starting services (Locally)..." -ForegroundColor Cyan
docker-compose up -d --build

# 6. Check status
Write-Host "✅ Local Deployment complete! Checking status..." -ForegroundColor Green
docker-compose ps

Write-Host "🌐 App should be accessible at http://localhost:8081" -ForegroundColor Green
