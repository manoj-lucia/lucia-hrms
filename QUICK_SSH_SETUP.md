# Quick SSH Setup for Lucia HRMS

## Current Status
✅ OpenSSH Client is installed (version 9.5p1)
❓ OpenSSH Server needs to be installed

## Step-by-Step Setup

### Step 1: Install OpenSSH Server (Requires Administrator)

**Option A: Using PowerShell (Recommended)**
1. Right-click on PowerShell and select "Run as Administrator"
2. Run these commands:

```powershell
# Check if OpenSSH Server is installed
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

# Install OpenSSH Server if not installed
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Configure and start SSH service
Set-Service -Name sshd -StartupType 'Automatic'
Start-Service sshd

# Configure SSH Agent
Set-Service -Name ssh-agent -StartupType 'Automatic'
Start-Service ssh-agent

# Configure Windows Firewall
New-NetFirewallRule -DisplayName 'OpenSSH-Server-In-TCP' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow
```

**Option B: Using Windows Settings**
1. Open Settings → Apps → Optional Features
2. Click "Add an optional feature"
3. Search for "OpenSSH Server"
4. Install it
5. Then run the service configuration commands above

### Step 2: Test SSH Server

After installation, test if SSH server is running:

```powershell
# Check service status
Get-Service sshd

# Test local connection
ssh $env:USERNAME@localhost
```

### Step 3: Generate SSH Keys (Optional but Recommended)

Run as regular user (not Administrator):

```powershell
# Navigate to project directory
cd C:\Users\user\Desktop\lucia-hrms

# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Add key to SSH agent
ssh-add ~/.ssh/id_rsa

# Copy public key to authorized_keys
mkdir ~/.ssh -Force
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

### Step 4: Test Connection

```powershell
# Test SSH connection
ssh $env:USERNAME@localhost

# If successful, you should see a command prompt
# Type 'exit' to close the SSH session
```

### Step 5: Start Lucia HRMS via SSH

Once connected via SSH:

```bash
# Navigate to project
cd /c/Users/user/Desktop/lucia-hrms

# Start the application
npm run dev
```

## Troubleshooting

### SSH Server Not Starting
```powershell
# Check Windows Event Log
Get-WinEvent -LogName "OpenSSH/Operational" | Select-Object -First 5

# Restart SSH service
Restart-Service sshd
```

### Connection Refused
1. Verify SSH service is running: `Get-Service sshd`
2. Check firewall: `Get-NetFirewallRule -DisplayName "*SSH*"`
3. Test port: `Test-NetConnection -ComputerName localhost -Port 22`

### Permission Denied
1. Check if user account is enabled
2. Verify SSH configuration allows the user
3. Try password authentication first, then keys

## Network Access

### Find Your IP Address
```powershell
# Get your local IP address
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne "127.0.0.1"}
```

### Connect from Another Device
```bash
# Replace YOUR_IP with your actual IP address
ssh yourusername@YOUR_IP
```

## Security Notes

- Change default SSH port (22) for better security
- Use SSH keys instead of passwords
- Limit SSH access to specific users
- Monitor SSH logs regularly

## Next Steps After Setup

1. **Test local connection**: `ssh $env:USERNAME@localhost`
2. **Start Lucia HRMS**: `npm run dev` (via SSH)
3. **Access application**: http://localhost:3000
4. **Set up port forwarding** (for external access)
5. **Configure Dynamic DNS** (optional)

## Automated Scripts

After manual setup, you can use our automated scripts:

```powershell
# Run our setup scripts (after manual SSH server installation)
.\scripts\setup-ssh-keys.ps1
.\scripts\apply-ssh-security.ps1
```
