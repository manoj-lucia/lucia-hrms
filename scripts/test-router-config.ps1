# Router Configuration Test Script
Write-Host "=== Router Configuration Test ===" -ForegroundColor Green

# Get network info
Write-Host "`n1. Network Information:" -ForegroundColor Cyan
try {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.PrefixOrigin -eq "Dhcp" }).IPAddress
    $gateway = (Get-NetRoute -DestinationPrefix "0.0.0.0/0").NextHop | Select-Object -First 1
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 5).Content
    
    Write-Host "Local IP: $localIP" -ForegroundColor White
    Write-Host "Gateway (Router): $gateway" -ForegroundColor White
    Write-Host "Public IP: $publicIP" -ForegroundColor White
} catch {
    Write-Host "Could not get network information" -ForegroundColor Red
}

# Test local SSH
Write-Host "`n2. Local SSH Test:" -ForegroundColor Cyan
try {
    $localTest = Test-NetConnection -ComputerName $localIP -Port 22 -WarningAction SilentlyContinue
    if ($localTest.TcpTestSucceeded) {
        Write-Host "✓ Local SSH connection successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Local SSH connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Could not test local SSH" -ForegroundColor Yellow
}

# Test router access
Write-Host "`n3. Router Access Test:" -ForegroundColor Cyan
try {
    $routerTest = Test-NetConnection -ComputerName $gateway -Port 80 -WarningAction SilentlyContinue
    if ($routerTest.TcpTestSucceeded) {
        Write-Host "✓ Router web interface accessible" -ForegroundColor Green
        Write-Host "  Access at: http://$gateway" -ForegroundColor White
    } else {
        Write-Host "⚠ Router web interface not accessible on port 80" -ForegroundColor Yellow
        Write-Host "  Try: http://$gateway or https://$gateway" -ForegroundColor Gray
    }
} catch {
    Write-Host "Could not test router access" -ForegroundColor Yellow
}

# Port forwarding instructions
Write-Host "`n4. Port Forwarding Configuration:" -ForegroundColor Cyan
Write-Host "Configure these settings in your router:" -ForegroundColor Yellow
Write-Host "  Service Name: SSH-Lucia-HRMS" -ForegroundColor White
Write-Host "  External Port: 22" -ForegroundColor White
Write-Host "  Internal Port: 22" -ForegroundColor White
Write-Host "  Internal IP: $localIP" -ForegroundColor White
Write-Host "  Protocol: TCP" -ForegroundColor White
Write-Host "  Status: Enabled" -ForegroundColor White

Write-Host "`n5. Router Admin Access:" -ForegroundColor Cyan
Write-Host "Try these URLs to access your router:" -ForegroundColor Yellow
Write-Host "  http://$gateway" -ForegroundColor White
Write-Host "  https://$gateway" -ForegroundColor White
Write-Host "  http://192.168.1.1" -ForegroundColor White
Write-Host "  http://192.168.0.1" -ForegroundColor White

Write-Host "`n6. After Router Configuration:" -ForegroundColor Cyan
Write-Host "Test remote access with:" -ForegroundColor Yellow
Write-Host "  ssh user@$publicIP" -ForegroundColor White
Write-Host "Create tunnel with:" -ForegroundColor Yellow
Write-Host "  ssh -L 3000:localhost:3000 user@$publicIP" -ForegroundColor White

Write-Host "`nPress any key to open router admin page..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Try to open router admin page
try {
    Start-Process "http://$gateway"
    Write-Host "Opening router admin page..." -ForegroundColor Green
} catch {
    Write-Host "Could not open router page automatically" -ForegroundColor Yellow
    Write-Host "Manually go to: http://$gateway" -ForegroundColor White
}
