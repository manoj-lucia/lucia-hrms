# Simple SSH Server Installation
Write-Host "=== SSH Server Installation ===" -ForegroundColor Green

# Check admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "ERROR: Administrator privileges required!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing OpenSSH Server..." -ForegroundColor Yellow
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

Write-Host "Configuring SSH service..." -ForegroundColor Yellow
Set-Service -Name sshd -StartupType 'Automatic'
Start-Service sshd

Write-Host "Configuring SSH Agent..." -ForegroundColor Yellow
Set-Service -Name ssh-agent -StartupType 'Automatic'
Start-Service ssh-agent

Write-Host "Configuring firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName 'OpenSSH-Server-In-TCP' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow -ErrorAction SilentlyContinue

Write-Host "`nChecking status..." -ForegroundColor Cyan
$sshd = Get-Service -Name sshd
$agent = Get-Service -Name ssh-agent

Write-Host "SSH Server: $($sshd.Status)" -ForegroundColor White
Write-Host "SSH Agent: $($agent.Status)" -ForegroundColor White

if ($sshd.Status -eq "Running") {
    Write-Host "`n✓ SUCCESS! SSH Server is running!" -ForegroundColor Green
    Write-Host "Test connection: ssh $env:USERNAME@localhost" -ForegroundColor Yellow
} else {
    Write-Host "`n✗ SSH Server failed to start" -ForegroundColor Red
}

Write-Host "`nInstallation complete!" -ForegroundColor Green
