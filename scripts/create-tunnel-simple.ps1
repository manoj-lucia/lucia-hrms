# Simple SSH Tunnel Creator
param(
    [Parameter(Mandatory=$true)]
    [string]$RemoteHost,
    [string]$Username = $env:USERNAME,
    [int]$Port = 22,
    [int]$LocalPort = 3000
)

Write-Host "=== SSH Tunnel for Lucia HRMS ===" -ForegroundColor Green

if (-not $RemoteHost) {
    Write-Host "Usage: .\create-tunnel-simple.ps1 -RemoteHost YOUR_IP" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating tunnel to: $Username@$RemoteHost:$Port" -ForegroundColor Cyan
Write-Host "Local port: $LocalPort" -ForegroundColor White

# Check if SSH is available
try {
    $null = ssh -V 2>&1
    Write-Host "✓ SSH client found" -ForegroundColor Green
} catch {
    Write-Host "✗ SSH client not found" -ForegroundColor Red
    exit 1
}

# Check if local port is free
try {
    $portUsed = Get-NetTCPConnection -LocalPort $LocalPort -ErrorAction SilentlyContinue
    if ($portUsed) {
        Write-Host "⚠ Port $LocalPort is in use" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Port $LocalPort is available" -ForegroundColor Green
    }
} catch {
    Write-Host "✓ Port $LocalPort appears available" -ForegroundColor Green
}

$command = "ssh -L ${LocalPort}:localhost:3000 -p $Port $Username@$RemoteHost"

Write-Host "`nSSH Command:" -ForegroundColor Cyan
Write-Host $command -ForegroundColor White

Write-Host "`nInstructions:" -ForegroundColor Yellow
Write-Host "1. After connecting, open: http://localhost:$LocalPort" -ForegroundColor White
Write-Host "2. Keep this window open to maintain tunnel" -ForegroundColor White
Write-Host "3. Press Ctrl+C to close tunnel" -ForegroundColor White

Write-Host "`nPress Enter to connect..." -ForegroundColor Gray
Read-Host

Write-Host "Connecting..." -ForegroundColor Cyan
try {
    Invoke-Expression $command
} catch {
    Write-Host "Connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Tunnel closed." -ForegroundColor Yellow
