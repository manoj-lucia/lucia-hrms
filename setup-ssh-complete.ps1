# Complete SSH Setup for Lucia HRMS
# Master setup script that guides through the entire SSH configuration process

Write-Host "=== Complete SSH Setup for Lucia HRMS ===" -ForegroundColor Green
Write-Host "This script will guide you through setting up SSH access to your localhost." -ForegroundColor Yellow
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

Write-Host "Current execution context:" -ForegroundColor Cyan
if ($isAdmin) {
    Write-Host "✓ Running as Administrator" -ForegroundColor Green
} else {
    Write-Host "⚠ Running as regular user" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SSH Setup Overview:" -ForegroundColor Cyan
Write-Host "1. Install and configure SSH server (requires Administrator)" -ForegroundColor White
Write-Host "2. Generate SSH keys (run as regular user)" -ForegroundColor White
Write-Host "3. Apply security configuration (requires Administrator)" -ForegroundColor White
Write-Host "4. Set up Lucia HRMS integration (requires Administrator)" -ForegroundColor White
Write-Host ""

# Function to run script with appropriate privileges
function Invoke-ScriptWithPrivileges {
    param(
        [string]$ScriptPath,
        [bool]$RequiresAdmin,
        [string]$Description
    )
    
    Write-Host "Running: $Description" -ForegroundColor Yellow
    
    if ($RequiresAdmin -and -not $isAdmin) {
        Write-Host "This step requires Administrator privileges." -ForegroundColor Red
        Write-Host "Please run the following command as Administrator:" -ForegroundColor White
        Write-Host "  $ScriptPath" -ForegroundColor Gray
        Write-Host ""
        $continue = Read-Host "Press Enter when you've completed this step, or 'skip' to continue"
        if ($continue -eq "skip") {
            Write-Host "Skipped: $Description" -ForegroundColor Yellow
        }
        return
    }
    
    if (Test-Path $ScriptPath) {
        try {
            & $ScriptPath
            Write-Host "✓ Completed: $Description" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed: $Description" -ForegroundColor Red
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ Script not found: $ScriptPath" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Step 1: SSH Integration Setup
Write-Host "=== Step 1: Setting up SSH Integration ===" -ForegroundColor Cyan
if ($isAdmin) {
    Invoke-ScriptWithPrivileges -ScriptPath ".\scripts\lucia-ssh-integration.ps1" -RequiresAdmin $true -Description "Lucia HRMS SSH Integration"
} else {
    Write-Host "Skipping SSH integration setup (requires Administrator)" -ForegroundColor Yellow
    Write-Host "Please run this script as Administrator first, or run:" -ForegroundColor White
    Write-Host "  .\scripts\lucia-ssh-integration.ps1" -ForegroundColor Gray
    Write-Host ""
}

# Step 2: SSH Server Setup
Write-Host "=== Step 2: SSH Server Installation and Configuration ===" -ForegroundColor Cyan
Invoke-ScriptWithPrivileges -ScriptPath ".\scripts\setup-ssh.ps1" -RequiresAdmin $true -Description "SSH Server Setup"

# Step 3: SSH Key Generation
Write-Host "=== Step 3: SSH Key Generation ===" -ForegroundColor Cyan
if ($isAdmin) {
    Write-Host "SSH key generation should be run as a regular user." -ForegroundColor Yellow
    Write-Host "Please run the following command as a regular user:" -ForegroundColor White
    Write-Host "  .\scripts\setup-ssh-keys.ps1" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter when you've completed SSH key generation"
} else {
    Invoke-ScriptWithPrivileges -ScriptPath ".\scripts\setup-ssh-keys.ps1" -RequiresAdmin $false -Description "SSH Key Generation"
}

# Step 4: Security Configuration
Write-Host "=== Step 4: SSH Security Configuration ===" -ForegroundColor Cyan
Invoke-ScriptWithPrivileges -ScriptPath ".\scripts\apply-ssh-security.ps1" -RequiresAdmin $true -Description "SSH Security Configuration"

# Step 5: Connection Testing
Write-Host "=== Step 5: Testing SSH Connection ===" -ForegroundColor Cyan
Write-Host "Testing SSH connection..." -ForegroundColor Yellow

try {
    # Test SSH service status
    $sshService = Get-Service -Name sshd -ErrorAction SilentlyContinue
    if ($sshService -and $sshService.Status -eq "Running") {
        Write-Host "✓ SSH service is running" -ForegroundColor Green
        
        # Test SSH connection
        Write-Host "Testing SSH connection to localhost..." -ForegroundColor Yellow
        $testResult = & ssh -o ConnectTimeout=5 -o BatchMode=yes $env:USERNAME@localhost "echo 'SSH connection successful'" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ SSH connection test successful" -ForegroundColor Green
        } else {
            Write-Host "⚠ SSH connection test failed (this is normal if keys aren't set up yet)" -ForegroundColor Yellow
            Write-Host "You can test manually with: ssh $env:USERNAME@localhost" -ForegroundColor White
        }
    } else {
        Write-Host "✗ SSH service is not running" -ForegroundColor Red
    }
}
catch {
    Write-Host "⚠ Could not test SSH connection" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Display connection information
Write-Host "=== Step 6: Connection Information ===" -ForegroundColor Cyan

Write-Host "SSH Connection Commands:" -ForegroundColor Yellow
Write-Host "Local connections:" -ForegroundColor White
Write-Host "  ssh $env:USERNAME@localhost" -ForegroundColor Gray
Write-Host "  ssh $env:USERNAME@127.0.0.1" -ForegroundColor Gray

# Get network IP addresses
try {
    $networkIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -ne "127.0.0.1" -and 
        ($_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual") 
    }
    
    if ($networkIPs) {
        Write-Host "`nNetwork connections:" -ForegroundColor White
        foreach ($ip in $networkIPs) {
            Write-Host "  ssh $env:USERNAME@$($ip.IPAddress)" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "Could not retrieve network information" -ForegroundColor Yellow
}

Write-Host "`nLucia HRMS Commands:" -ForegroundColor Yellow
Write-Host "Start application via SSH:" -ForegroundColor White
Write-Host "  cd /c/Users/user/Desktop/lucia-hrms" -ForegroundColor Gray
Write-Host "  npm run ssh:start" -ForegroundColor Gray
Write-Host "  # OR" -ForegroundColor DarkGray
Write-Host "  ./scripts/start-lucia-ssh.ps1" -ForegroundColor Gray

Write-Host "`nConnection helper:" -ForegroundColor White
Write-Host "  npm run ssh:helper" -ForegroundColor Gray

# Step 7: Next Steps and Recommendations
Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test SSH connection: ssh $env:USERNAME@localhost" -ForegroundColor White
Write-Host "2. Start Lucia HRMS remotely: npm run ssh:start" -ForegroundColor White
Write-Host "3. Access application at: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Security Recommendations:" -ForegroundColor Yellow
Write-Host "1. Set up SSH key authentication and disable password auth" -ForegroundColor White
Write-Host "2. Change SSH port from 22 to a custom port" -ForegroundColor White
Write-Host "3. Set up port forwarding on your router for external access" -ForegroundColor White
Write-Host "4. Consider setting up Dynamic DNS for easier external access" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "- Complete setup guide: SSH_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "- Troubleshooting: See SSH_SETUP_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "Support Scripts:" -ForegroundColor Yellow
Write-Host "- Connection helper: .\scripts\ssh-connect-helper.ps1" -ForegroundColor White
Write-Host "- Quick setup: .\scripts\quick-ssh-setup.ps1" -ForegroundColor White
Write-Host ""

Write-Host "Your localhost is now accessible via SSH!" -ForegroundColor Green
Write-Host "You can now develop and manage Lucia HRMS remotely." -ForegroundColor Cyan

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
