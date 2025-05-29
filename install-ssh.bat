@echo off
echo === SSH Server Installation ===
echo.

echo Checking administrator privileges...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator privileges confirmed.
) else (
    echo ERROR: This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Installing OpenSSH Server...
powershell -Command "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"

echo.
echo Configuring SSH service...
powershell -Command "Set-Service -Name sshd -StartupType 'Automatic'"
powershell -Command "Start-Service sshd"

echo.
echo Configuring SSH Agent...
powershell -Command "Set-Service -Name ssh-agent -StartupType 'Automatic'"
powershell -Command "Start-Service ssh-agent"

echo.
echo Configuring Windows Firewall...
powershell -Command "New-NetFirewallRule -DisplayName 'OpenSSH-Server-In-TCP' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow"

echo.
echo Checking service status...
powershell -Command "Get-Service sshd"
powershell -Command "Get-Service ssh-agent"

echo.
echo === Installation Complete ===
echo Test SSH connection with: ssh %USERNAME%@localhost
echo.
pause
