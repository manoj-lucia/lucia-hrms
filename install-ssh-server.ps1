# SSH Server Installation Script for Lucia HRMS
# Run this script as Administrator

Write-Host "=== Installing SSH Server ===" -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing OpenSSH Server..." -ForegroundColor Yellow
try {
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    Write-Host "✓ OpenSSH Server installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install OpenSSH Server: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Configuring SSH service..." -ForegroundColor Yellow
try {
    Set-Service -Name sshd -StartupType 'Automatic'
    Start-Service sshd
    Write-Host "✓ SSH service configured and started" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to configure SSH service: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Configuring SSH Agent..." -ForegroundColor Yellow
try {
    Set-Service -Name ssh-agent -StartupType 'Automatic'
    Start-Service ssh-agent
    Write-Host "✓ SSH Agent configured and started" -ForegroundColor Green
} catch {
    Write-Host "⚠ SSH Agent configuration failed (optional)" -ForegroundColor Yellow
}

Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
try {
    $existingRule = Get-NetFirewallRule -DisplayName "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName 'OpenSSH-Server-In-TCP' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow
        Write-Host "✓ Firewall rule created" -ForegroundColor Green
    } else {
        Write-Host "✓ Firewall rule already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Firewall configuration failed (you may need to configure manually)" -ForegroundColor Yellow
}

Write-Host "`n=== Installation Complete ===" -ForegroundColor Green
Write-Host "SSH Server is now installed and running!" -ForegroundColor Cyan

# Test the installation
Write-Host "`nTesting SSH service..." -ForegroundColor Yellow
$sshService = Get-Service -Name sshd
Write-Host "SSH Service Status: $($sshService.Status)" -ForegroundColor White

if ($sshService.Status -eq "Running") {
    Write-Host "`n✓ SUCCESS: SSH Server is ready!" -ForegroundColor Green
    Write-Host "You can now connect with: ssh $env:USERNAME@localhost" -ForegroundColor White
    
    # Get IP addresses for network connections
    $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.PrefixOrigin -eq "Dhcp" }
    if ($ips) {
        Write-Host "`nNetwork connections:" -ForegroundColor Cyan
        foreach ($ip in $ips) {
            Write-Host "  ssh $env:USERNAME@$($ip.IPAddress)" -ForegroundColor White
        }
    }
} else {
    Write-Host "`n✗ SSH Service is not running" -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test connection: ssh $env:USERNAME@localhost" -ForegroundColor White
Write-Host "2. Generate SSH keys (optional): ssh-keygen -t rsa -b 4096" -ForegroundColor White
Write-Host "3. Start Lucia HRMS via SSH: npm run dev" -ForegroundColor White

Read-Host "`nPress Enter to exit"
