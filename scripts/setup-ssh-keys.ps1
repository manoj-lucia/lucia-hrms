# SSH Key Authentication Setup
Write-Host "=== SSH Key Authentication Setup ===" -ForegroundColor Green
Write-Host "Setting up SSH keys for secure passwordless authentication..." -ForegroundColor Yellow

# Check if running as current user (not admin needed for this)
$currentUser = $env:USERNAME
Write-Host "Setting up SSH keys for user: $currentUser" -ForegroundColor Cyan

# Create .ssh directory
$sshDir = "$env:USERPROFILE\.ssh"
if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "✓ Created .ssh directory" -ForegroundColor Green
} else {
    Write-Host "✓ .ssh directory already exists" -ForegroundColor Green
}

# Check if SSH key already exists
$keyPath = "$sshDir\id_rsa"
$pubKeyPath = "$sshDir\id_rsa.pub"

if (Test-Path $keyPath) {
    Write-Host "⚠ SSH key already exists at $keyPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to create a new key? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Using existing SSH key" -ForegroundColor Green
        if (Test-Path $pubKeyPath) {
            $publicKey = Get-Content $pubKeyPath
            Write-Host "`nYour public key:" -ForegroundColor Cyan
            Write-Host $publicKey -ForegroundColor White
        }
        exit 0
    }
}

# Generate SSH key pair
Write-Host "`nGenerating SSH key pair..." -ForegroundColor Cyan
$email = Read-Host "Enter your email (optional, press Enter to skip)"
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "$currentUser@lucia-hrms"
}

try {
    # Generate key with no passphrase for simplicity
    $null = & ssh-keygen -t rsa -b 4096 -f $keyPath -N '""' -C $email 2>$null
    Write-Host "✓ SSH key pair generated successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to generate SSH key" -ForegroundColor Red
    Write-Host "Make sure OpenSSH client is installed" -ForegroundColor Yellow
    exit 1
}

# Set up authorized_keys
$authorizedKeysPath = "$sshDir\authorized_keys"
if (Test-Path $pubKeyPath) {
    $publicKey = Get-Content $pubKeyPath
    
    # Add public key to authorized_keys
    if (!(Test-Path $authorizedKeysPath)) {
        $publicKey | Out-File -FilePath $authorizedKeysPath -Encoding UTF8
        Write-Host "✓ Created authorized_keys file" -ForegroundColor Green
    } else {
        # Check if key already exists in authorized_keys
        $existingKeys = Get-Content $authorizedKeysPath
        if ($existingKeys -notcontains $publicKey) {
            $publicKey | Add-Content -Path $authorizedKeysPath
            Write-Host "✓ Added public key to authorized_keys" -ForegroundColor Green
        } else {
            Write-Host "✓ Public key already in authorized_keys" -ForegroundColor Green
        }
    }
    
    # Set proper permissions (Windows)
    try {
        icacls $sshDir /inheritance:r /grant:r "$currentUser:(OI)(CI)F" /T | Out-Null
        icacls $authorizedKeysPath /inheritance:r /grant:r "$currentUser:F" | Out-Null
        Write-Host "✓ Set proper file permissions" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not set file permissions" -ForegroundColor Yellow
    }
}

# Display information
Write-Host "`n=== SSH Key Setup Complete ===" -ForegroundColor Green
Write-Host "`nKey files created:" -ForegroundColor Cyan
Write-Host "Private key: $keyPath" -ForegroundColor White
Write-Host "Public key: $pubKeyPath" -ForegroundColor White
Write-Host "Authorized keys: $authorizedKeysPath" -ForegroundColor White

if (Test-Path $pubKeyPath) {
    $publicKey = Get-Content $pubKeyPath
    Write-Host "`nYour public key:" -ForegroundColor Cyan
    Write-Host $publicKey -ForegroundColor White
}

Write-Host "`nUsage:" -ForegroundColor Yellow
Write-Host "Local connection with key:" -ForegroundColor White
Write-Host "  ssh -i $keyPath $currentUser@localhost" -ForegroundColor Gray
Write-Host "Remote connection with key:" -ForegroundColor White
Write-Host "  ssh -i $keyPath $currentUser@your_public_ip" -ForegroundColor Gray
Write-Host "Create tunnel with key:" -ForegroundColor White
Write-Host "  ssh -i $keyPath -L 3000:localhost:3000 $currentUser@your_public_ip" -ForegroundColor Gray

Write-Host "`nSecurity Notes:" -ForegroundColor Yellow
Write-Host "- Keep your private key secure" -ForegroundColor White
Write-Host "- Never share your private key" -ForegroundColor White
Write-Host "- You can disable password authentication after testing keys" -ForegroundColor White
Write-Host "- Copy private key to remote devices for passwordless access" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
