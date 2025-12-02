# Install Next.js Frontend Dependencies

Write-Host "🚀 Installing Smart Notes Search Engine Frontend..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location -Path "A:\IR\frontend"

# Install dependencies
Write-Host "`n📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open Terminal 1 and run:" -ForegroundColor White
    Write-Host "   cd A:\IR" -ForegroundColor Gray
    Write-Host "   python app.py" -ForegroundColor Gray
    Write-Host "`n2. Open Terminal 2 and run:" -ForegroundColor White
    Write-Host "   cd A:\IR\frontend" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host "`n3. Open your browser to:" -ForegroundColor White
    Write-Host "   http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Installation failed!" -ForegroundColor Red
    exit 1
}
