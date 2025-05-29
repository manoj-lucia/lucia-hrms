Write-Host "SSH Status Check" -ForegroundColor Green

# Check SSH Client
Write-Host "`nSSH Client:" -ForegroundColor Cyan
$client = ssh -V 2>&1
Write-Host "  $client" -ForegroundColor White

# Check SSH Server
Write-Host "`nSSH Server:" -ForegroundColor Cyan
$server = Get-Service -Name sshd -ErrorAction SilentlyContinue
if ($server) {
    Write-Host "  Status: $($server.Status)" -ForegroundColor White
} else {
    Write-Host "  Not installed" -ForegroundColor Red
}

# Check SSH Agent
Write-Host "`nSSH Agent:" -ForegroundColor Cyan
$agent = Get-Service -Name ssh-agent -ErrorAction SilentlyContinue
if ($agent) {
    Write-Host "  Status: $($agent.Status)" -ForegroundColor White
} else {
    Write-Host "  Not found" -ForegroundColor Red
}

# Summary
Write-Host "`nSummary:" -ForegroundColor Green
if ($server -and $server.Status -eq "Running") {
    Write-Host "  SSH Server is ready!" -ForegroundColor Green
    Write-Host "  Test: ssh $env:USERNAME@localhost" -ForegroundColor White
} else {
    Write-Host "  SSH Server needs setup" -ForegroundColor Yellow
}
