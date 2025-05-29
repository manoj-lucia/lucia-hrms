# Simple SSH Test Script
Write-Host "=== SSH Remote Access Test ===" -ForegroundColor Green

# Test 1: SSH Service
Write-Host "`n1. SSH Service Status:" -ForegroundColor Cyan
try {
    $sshd = Get-Service -Name sshd -ErrorAction SilentlyContinue
    if ($sshd) {
        $color = if ($sshd.Status -eq "Running") {"Green"} else {"Red"}
        Write-Host "SSH Service: $($sshd.Status)" -ForegroundColor $color
    } else {
        Write-Host "SSH Service: Not installed" -ForegroundColor Red
    }
} catch {
    Write-Host "Could not check SSH service" -ForegroundColor Yellow
}

# Test 2: Port listening
Write-Host "`n2. Port 22 Status:" -ForegroundColor Cyan
try {
    $port = Get-NetTCPConnection -LocalPort 22 -State Listen -ErrorAction SilentlyContinue
    if ($port) {
        Write-Host "Port 22: Listening" -ForegroundColor Green
        foreach ($p in $port) {
            Write-Host "  $($p.LocalAddress):$($p.LocalPort)" -ForegroundColor White
        }
    } else {
        Write-Host "Port 22: Not listening" -ForegroundColor Red
    }
} catch {
    Write-Host "Could not check port status" -ForegroundColor Yellow
}

# Test 3: Firewall
Write-Host "`n3. Firewall Rules:" -ForegroundColor Cyan
try {
    $rules = Get-NetFirewallRule -DisplayName "*SSH*" -ErrorAction SilentlyContinue
    if ($rules) {
        foreach ($rule in $rules) {
            $color = if ($rule.Enabled -eq "True") {"Green"} else {"Red"}
            Write-Host "$($rule.DisplayName): $($rule.Enabled)" -ForegroundColor $color
        }
    } else {
        Write-Host "No SSH firewall rules found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not check firewall rules" -ForegroundColor Yellow
}

# Test 4: Network info
Write-Host "`n4. Network Information:" -ForegroundColor Cyan
try {
    $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.PrefixOrigin -eq "Dhcp" }
    Write-Host "Local IP addresses:" -ForegroundColor White
    foreach ($ip in $ips) {
        Write-Host "  ssh $env:USERNAME@$($ip.IPAddress)" -ForegroundColor Gray
    }
    
    $public = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing -TimeoutSec 5).Content
    Write-Host "Public IP:" -ForegroundColor White
    Write-Host "  ssh $env:USERNAME@$public" -ForegroundColor Gray
} catch {
    Write-Host "Could not get network information" -ForegroundColor Yellow
}

# Test 5: Local connection
Write-Host "`n5. Local SSH Test:" -ForegroundColor Cyan
try {
    $test = Test-NetConnection -ComputerName localhost -Port 22 -WarningAction SilentlyContinue
    if ($test.TcpTestSucceeded) {
        Write-Host "Local connection: Success" -ForegroundColor Green
    } else {
        Write-Host "Local connection: Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Could not test local connection" -ForegroundColor Yellow
}

# Test 6: Web server
Write-Host "`n6. Lucia HRMS Web Server:" -ForegroundColor Cyan
try {
    $web = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
    if ($web.TcpTestSucceeded) {
        Write-Host "Web server: Running on port 3000" -ForegroundColor Green
        Write-Host "  Access: http://localhost:3000" -ForegroundColor White
    } else {
        Write-Host "Web server: Not running" -ForegroundColor Yellow
        Write-Host "  Start with: npm run dev" -ForegroundColor Gray
    }
} catch {
    Write-Host "Could not test web server" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Green
$sshRunning = $null -ne (Get-Service -Name sshd -ErrorAction SilentlyContinue) -and (Get-Service -Name sshd).Status -eq "Running"
$portOpen = $null -ne (Get-NetTCPConnection -LocalPort 22 -State Listen -ErrorAction SilentlyContinue)

if ($sshRunning -and $portOpen) {
    Write-Host "✓ SSH is ready for remote access!" -ForegroundColor Green
    Write-Host "Next: Configure router port forwarding" -ForegroundColor Yellow
} else {
    Write-Host "⚠ SSH setup incomplete" -ForegroundColor Yellow
    Write-Host "Run: npm run ssh:setup" -ForegroundColor White
}

Write-Host ""
