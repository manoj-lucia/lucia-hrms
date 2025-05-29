# Simple SSH Setup for Remote Access
Write-Host "=== SSH Remote Access Setup ===" -ForegroundColor Green

# Check admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-NOT $isAdmin) {
    Write-Host "ERROR: Run as Administrator!" -ForegroundColor Red
    pause
    exit 1
}

# Install OpenSSH Server
Write-Host "`n1. Installing OpenSSH Server..." -ForegroundColor Cyan
try {
    $feature = Get-WindowsCapability -Online | Where-Object Name -like "*OpenSSH.Server*"
    if ($feature.State -eq "Installed") {
        Write-Host "✓ Already installed" -ForegroundColor Green
    } else {
        Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
        Write-Host "✓ Installed successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Installation failed" -ForegroundColor Red
    exit 1
}

# Configure services
Write-Host "`n2. Configuring services..." -ForegroundColor Cyan
try {
    Set-Service -Name sshd -StartupType 'Automatic'
    Start-Service sshd
    Set-Service -Name ssh-agent -StartupType 'Automatic'
    Start-Service ssh-agent
    Write-Host "✓ Services configured" -ForegroundColor Green
} catch {
    Write-Host "✗ Service configuration failed" -ForegroundColor Red
    exit 1
}

# Configure firewall
Write-Host "`n3. Configuring firewall..." -ForegroundColor Cyan
try {
    $rule = Get-NetFirewallRule -DisplayName "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue
    if (-not $rule) {
        New-NetFirewallRule -DisplayName 'OpenSSH-Server-In-TCP' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow
    }
    Write-Host "✓ Firewall configured" -ForegroundColor Green
} catch {
    Write-Host "⚠ Firewall configuration failed" -ForegroundColor Yellow
}

# Get network info
Write-Host "`n4. Network Information:" -ForegroundColor Cyan
try {
    $localIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.PrefixOrigin -eq "Dhcp" }
    Write-Host "Local access:" -ForegroundColor White
    foreach ($ip in $localIPs) {
        Write-Host "  ssh $env:USERNAME@$($ip.IPAddress)" -ForegroundColor Gray
    }
    
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 5).Content
    Write-Host "Remote access (after port forwarding):" -ForegroundColor White
    Write-Host "  ssh $env:USERNAME@$publicIP" -ForegroundColor Gray
} catch {
    Write-Host "Could not get network info" -ForegroundColor Yellow
}

# Status check
Write-Host "`n5. Status:" -ForegroundColor Cyan
$sshd = Get-Service -Name sshd
$listening = Get-NetTCPConnection -LocalPort 22 -State Listen -ErrorAction SilentlyContinue
Write-Host "SSH Service: $($sshd.Status)" -ForegroundColor $(if($sshd.Status -eq "Running") {"Green"} else {"Red"})
Write-Host "Port 22 Listening: $(if($listening) {"Yes"} else {"No"})" -ForegroundColor $(if($listening) {"Green"} else {"Red"})

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "Next: Configure router port forwarding for port 22" -ForegroundColor Yellow
Write-Host "Then test: ssh $env:USERNAME@your_public_ip" -ForegroundColor White

Write-Host "`nPress any key..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
