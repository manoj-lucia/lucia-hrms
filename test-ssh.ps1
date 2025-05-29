# Test SSH Installation
Write-Host "=== Testing SSH Installation ===" -ForegroundColor Green
Write-Host ""

# Test SSH services
Write-Host "1. Checking SSH Services:" -ForegroundColor Cyan
$sshd = Get-Service -Name sshd -ErrorAction SilentlyContinue
$agent = Get-Service -Name ssh-agent -ErrorAction SilentlyContinue

if ($sshd) {
    if ($sshd.Status -eq "Running") {
        Write-Host "   ✓ SSH Server: Running" -ForegroundColor Green
    } else {
        Write-Host "   ✗ SSH Server: $($sshd.Status)" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ SSH Server: Not installed" -ForegroundColor Red
}

if ($agent) {
    if ($agent.Status -eq "Running") {
        Write-Host "   ✓ SSH Agent: Running" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ SSH Agent: $($agent.Status)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ SSH Agent: Not found" -ForegroundColor Red
}

# Test SSH port
Write-Host "`n2. Checking SSH Port:" -ForegroundColor Cyan
$port = Get-NetTCPConnection -LocalPort 22 -State Listen -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "   ✓ Port 22 is listening" -ForegroundColor Green
} else {
    Write-Host "   ✗ Port 22 is not listening" -ForegroundColor Red
}

# Test firewall
Write-Host "`n3. Checking Firewall Rules:" -ForegroundColor Cyan
$firewall = Get-NetFirewallRule -DisplayName "*SSH*" -ErrorAction SilentlyContinue
if ($firewall) {
    Write-Host "   ✓ SSH firewall rules found" -ForegroundColor Green
} else {
    Write-Host "   ⚠ No SSH firewall rules found" -ForegroundColor Yellow
}

# Network information
Write-Host "`n4. Connection Information:" -ForegroundColor Cyan
Write-Host "   Local: ssh $env:USERNAME@localhost" -ForegroundColor White
Write-Host "   Local: ssh $env:USERNAME@127.0.0.1" -ForegroundColor White

$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.PrefixOrigin -eq "Dhcp" }
if ($ips) {
    Write-Host "   Network connections:" -ForegroundColor White
    foreach ($ip in $ips) {
        Write-Host "     ssh $env:USERNAME@$($ip.IPAddress)" -ForegroundColor Gray
    }
}

# Summary
Write-Host "`n=== Test Results ===" -ForegroundColor Green
if ($sshd -and $sshd.Status -eq "Running" -and $port) {
    Write-Host "✓ SSH Server is ready for connections!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Test connection: ssh $env:USERNAME@localhost" -ForegroundColor White
    Write-Host "2. Start Lucia HRMS: npm run dev" -ForegroundColor White
    Write-Host "3. Access remotely via SSH tunnel" -ForegroundColor White
} else {
    Write-Host "⚠ SSH Server setup incomplete" -ForegroundColor Yellow
    Write-Host "Please run the installation script as Administrator" -ForegroundColor White
}

Write-Host ""
