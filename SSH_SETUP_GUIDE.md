# SSH Setup Guide for Lucia HRMS

This guide will help you set up SSH access to your localhost running the Lucia HRMS application.

## Overview

SSH (Secure Shell) allows you to securely connect to your machine remotely, enabling you to:
- Access your development environment from anywhere
- Run commands remotely
- Transfer files securely
- Manage your Lucia HRMS application remotely

## Prerequisites

- Windows 11 Pro (already confirmed)
- Administrator access to your machine
- Lucia HRMS application (already set up)

## Step-by-Step Setup

### Phase 1: Install and Configure SSH Server

1. **Run the SSH Server Setup Script**
   ```powershell
   # Open PowerShell as Administrator
   # Navigate to your project directory
   cd C:\Users\user\Desktop\lucia-hrms
   
   # Run the setup script
   .\scripts\setup-ssh.ps1
   ```

   This script will:
   - Install OpenSSH Server if not already installed
   - Configure SSH service to start automatically
   - Configure Windows Firewall
   - Generate SSH host keys
   - Display network information for connections

### Phase 2: Set Up SSH Key Authentication (Recommended)

2. **Generate SSH Keys**
   ```powershell
   # Run as regular user (not Administrator)
   .\scripts\setup-ssh-keys.ps1
   ```

   This script will:
   - Create SSH directory structure
   - Generate RSA key pair (4096-bit)
   - Set up authorized_keys file
   - Configure proper file permissions
   - Add key to SSH agent

### Phase 3: Apply Security Configuration

3. **Apply Secure SSH Configuration**
   ```powershell
   # Run as Administrator
   .\scripts\apply-ssh-security.ps1
   ```

   This script will:
   - Backup current SSH configuration
   - Apply secure SSH settings
   - Test configuration validity
   - Restart SSH service

## Connection Methods

### Local Connections
```bash
# Using username and password
ssh yourusername@localhost
ssh yourusername@127.0.0.1

# Using SSH keys (after setup)
ssh -i ~/.ssh/id_rsa yourusername@localhost
```

### Network Connections
```bash
# From other machines on your network
ssh yourusername@YOUR_IP_ADDRESS

# Example (replace with your actual IP)
ssh yourusername@192.168.1.100
```

## Accessing Lucia HRMS via SSH

Once connected via SSH, you can:

### Start the Application
```bash
cd /c/Users/user/Desktop/lucia-hrms
npm run dev
```

### Check Application Status
```bash
# Check if the app is running
netstat -an | findstr :3000

# View application logs
npm run dev 2>&1 | tee app.log
```

### Manage the Database
```bash
# Run database commands
npm run db:studio
npm run db:push
npm run db:seed
```

## Security Best Practices

### 1. Use SSH Key Authentication
- Disable password authentication after setting up keys
- Use strong passphrases for private keys
- Regularly rotate SSH keys

### 2. Change Default SSH Port
```powershell
# Edit SSH configuration
notepad C:\ProgramData\ssh\sshd_config

# Change Port 22 to Port 2222 (or another port)
# Restart SSH service
Restart-Service sshd
```

### 3. Limit User Access
```powershell
# Edit SSH configuration to allow only specific users
# Add this line to sshd_config:
# AllowUsers yourusername
```

### 4. Monitor SSH Access
```powershell
# View SSH logs
Get-WinEvent -LogName "OpenSSH/Operational" | Select-Object -First 10
```

## Port Forwarding for External Access

### Router Configuration
1. Access your router's admin panel
2. Navigate to Port Forwarding settings
3. Forward external port (e.g., 2222) to internal port 22
4. Set destination IP to your machine's local IP

### Dynamic DNS (Optional)
Consider setting up Dynamic DNS for easier external access:
- No-IP
- DuckDNS
- Cloudflare Dynamic DNS

## Troubleshooting

### SSH Service Not Starting
```powershell
# Check service status
Get-Service sshd

# View service logs
Get-WinEvent -LogName "System" | Where-Object {$_.ProviderName -eq "Service Control Manager" -and $_.Message -like "*sshd*"}

# Restart service
Restart-Service sshd
```

### Connection Refused
1. Check if SSH service is running
2. Verify firewall settings
3. Check SSH configuration syntax
4. Ensure correct port is being used

### Permission Denied
1. Verify SSH key permissions
2. Check authorized_keys file
3. Ensure user account is not locked
4. Verify SSH configuration allows the user

### Lucia HRMS Access Issues
```bash
# Check if Node.js is in PATH
node --version
npm --version

# Navigate to project directory
cd /c/Users/user/Desktop/lucia-hrms

# Install dependencies if needed
npm install

# Start application
npm run dev
```

## Advanced Configuration

### SSH Tunneling for Web Access
```bash
# Forward local port 3000 to remote machine
ssh -L 3000:localhost:3000 yourusername@your-server-ip

# Access Lucia HRMS at http://localhost:3000
```

### Reverse SSH Tunnel (for NAT traversal)
```bash
# On your machine (behind NAT)
ssh -R 2222:localhost:22 user@public-server

# Connect from public server
ssh -p 2222 yourusername@localhost
```

## Maintenance

### Regular Tasks
1. **Update SSH keys** every 6-12 months
2. **Review SSH logs** weekly
3. **Update SSH configuration** as needed
4. **Monitor failed login attempts**

### Backup Important Files
- SSH private keys (`~/.ssh/id_rsa`)
- SSH configuration (`C:\ProgramData\ssh\sshd_config`)
- Authorized keys (`~/.ssh/authorized_keys`)

## Integration with Development Workflow

### VS Code Remote Development
1. Install "Remote - SSH" extension
2. Configure SSH connection in VS Code
3. Open Lucia HRMS project remotely

### Git Operations via SSH
```bash
# Clone repositories
git clone git@github.com:username/repository.git

# Push/pull changes
git push origin main
git pull origin main
```

## Support and Resources

- [OpenSSH Documentation](https://www.openssh.com/)
- [Windows OpenSSH Documentation](https://docs.microsoft.com/en-us/windows-server/administration/openssh/)
- [SSH Key Management Best Practices](https://www.ssh.com/academy/ssh/key-management)

For issues specific to Lucia HRMS integration, refer to the main project documentation.
