Write-Host "Quick SSH Test" -ForegroundColor Green
$sshd = Get-Service -Name sshd -ErrorAction SilentlyContinue
if ($sshd -and $sshd.Status -eq "Running") {
    Write-Host "✓ SSH Server is running!" -ForegroundColor Green
    Write-Host "Test: ssh $env:USERNAME@localhost" -ForegroundColor Yellow
} else {
    Write-Host "✗ SSH Server not running" -ForegroundColor Red
}
