# Start Smart Notes Search Engine - Full Stack

Write-Host "Starting Smart Notes Search Engine..." -ForegroundColor Cyan

# Start Flask Backend in new terminal
Write-Host "`nStarting Flask Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd A:\IR; python app.py"

# Wait for backend to start
Write-Host "Waiting for backend to start (5 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Start Next.js Frontend in new terminal  
Write-Host "`nStarting Next.js Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd A:\IR\frontend; npm run dev"

Write-Host "`nBoth servers are starting!" -ForegroundColor Green
Write-Host "`nServer URLs:" -ForegroundColor Cyan
Write-Host "Backend:  http://127.0.0.1:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nPress Ctrl+C in each terminal to stop the servers." -ForegroundColor Gray
