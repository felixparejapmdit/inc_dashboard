# Face-API.js Models Download Script
# This script downloads the required face recognition models

Write-Host "📦 Downloading face-api.js models..." -ForegroundColor Cyan

# Create models directory in public folder
$modelsDir = "public\models"
if (!(Test-Path $modelsDir)) {
    New-Item -ItemType Directory -Path $modelsDir -Force | Out-Null
    Write-Host "✅ Created models directory" -ForegroundColor Green
}

# Base URL for models
$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# List of required model files
$models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2"
)

$downloaded = 0
$failed = 0

foreach ($model in $models) {
    $url = "$baseUrl/$model"
    $output = "$modelsDir\$model"
    
    try {
        Write-Host "  Downloading $model..." -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Host " ✅" -ForegroundColor Green
        $downloaded++
    } catch {
        Write-Host " ❌ Failed" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Download Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Downloaded: $downloaded files" -ForegroundColor Green
Write-Host "  ❌ Failed: $failed files" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 All models downloaded successfully!" -ForegroundColor Green
    Write-Host "   Models location: $modelsDir" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Some models failed to download. Please check your internet connection." -ForegroundColor Yellow
}
