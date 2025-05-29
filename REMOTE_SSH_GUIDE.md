# Remote SSH Access Guide for Lucia HRMS

This guide will help you set up SSH access to your localhost so you can access your Lucia HRMS website from anywhere.

## 🎯 What This Achieves

- **Remote Access**: Connect to your computer from anywhere in the world
- **Web Access**: Access your Lucia HRMS website remotely via SSH tunneling
- **Secure Connection**: Encrypted SSH connection for safe remote access
- **Port Forwarding**: Access localhost:3000 from remote locations

## 🚀 Quick Setup

### Step 1: Run SSH Setup Script
```bash
# Run as Administrator in PowerShell
powershell -ExecutionPolicy Bypass -File scripts/setup-remote-ssh.ps1
```

### Step 2: Configure Router Port Forwarding
1. Access your router's admin panel (usually http://192.168.1.1)
2. Find "Port Forwarding" or "Virtual Server" settings
3. Add new rule:
   - **Service Name**: SSH
   - **External Port**: 22 (or custom port)
   - **Internal Port**: 22
   - **Internal IP**: Your computer's local IP
   - **Protocol**: TCP

### Step 3: Test Local Connection
```bash
# Test from another device on same network
ssh your_username@192.168.1.xxx
```

### Step 4: Test Remote Connection
```bash
# Test from outside your network
ssh your_username@your_public_ip
```

## 🌐 Accessing Lucia HRMS Remotely

### Method 1: SSH Tunnel (Recommended)
```bash
# Create SSH tunnel to forward port 3000
ssh -L 3000:localhost:3000 your_username@your_public_ip

# Then access in browser: http://localhost:3000
```

### Method 2: Remote Desktop via SSH
```bash
# Connect via SSH
ssh your_username@your_public_ip

# Start Lucia HRMS on remote machine
cd /path/to/lucia-hrms
npm run dev

# Access via tunnel or direct connection
```

### Method 3: SSH with X11 Forwarding (Linux/Mac)
```bash
# Connect with X11 forwarding
ssh -X your_username@your_public_ip

# Launch browser remotely
firefox http://localhost:3000
```

## 🔧 Network Configuration

### Find Your Network Information

#### Local IP Address:
```powershell
# Windows
ipconfig | findstr "IPv4"

# Linux/Mac
ip addr show | grep inet
```

#### Public IP Address:
```bash
# Check your public IP
curl https://api.ipify.org
# or visit: https://whatismyipaddress.com
```

### Router Configuration Examples

#### Common Router Interfaces:
- **Linksys**: Advanced → Port Range Forwarding
- **Netgear**: Dynamic DNS → Port Forwarding
- **TP-Link**: Advanced → NAT Forwarding → Port Forwarding
- **ASUS**: Adaptive QoS → Port Forwarding
- **D-Link**: Advanced → Port Forwarding

#### Port Forwarding Settings:
```
Service Name: SSH-Lucia-HRMS
External Port: 22 (or 2222 for security)
Internal Port: 22
Internal IP: 192.168.1.xxx (your computer)
Protocol: TCP
Status: Enabled
```

## 🔒 Security Best Practices

### 1. Change Default SSH Port
```bash
# Edit SSH config to use custom port
# In sshd_config: Port 2222
# Then update firewall and router accordingly
```

### 2. Use SSH Key Authentication
```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/lucia_hrms_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/lucia_hrms_key.pub user@your_server

# Connect using key
ssh -i ~/.ssh/lucia_hrms_key user@your_server
```

### 3. Configure SSH Security
```bash
# Disable password authentication (after setting up keys)
# In sshd_config:
# PasswordAuthentication no
# PubkeyAuthentication yes
# PermitRootLogin no
```

### 4. Use Fail2Ban (Linux) or Similar
```bash
# Install fail2ban to prevent brute force attacks
sudo apt install fail2ban

# Configure SSH protection
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📱 Mobile Access

### SSH Apps for Mobile:
- **iOS**: Termius, SSH Files, Prompt 3
- **Android**: JuiceSSH, Termux, ConnectBot

### Mobile SSH Tunnel:
1. Install SSH app on mobile
2. Create connection to your server
3. Set up local port forwarding: 3000 → localhost:3000
4. Access http://localhost:3000 in mobile browser

## 🌍 Dynamic DNS (Optional)

If your public IP changes frequently:

### Free Dynamic DNS Services:
- **No-IP**: https://www.noip.com
- **DuckDNS**: https://www.duckdns.org
- **Dynu**: https://www.dynu.com

### Setup Example (No-IP):
1. Create account and hostname (e.g., lucia-hrms.ddns.net)
2. Install No-IP client on your computer
3. Configure client to update your IP automatically
4. Use hostname instead of IP: `ssh user@lucia-hrms.ddns.net`

## 🔍 Troubleshooting

### Connection Refused
```bash
# Check if SSH service is running
Get-Service sshd

# Check if port 22 is listening
netstat -an | findstr :22

# Test local connection first
ssh user@localhost
```

### Firewall Issues
```bash
# Check Windows Firewall rules
Get-NetFirewallRule -DisplayName "*SSH*"

# Add firewall rule manually
New-NetFirewallRule -DisplayName 'SSH' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow
```

### Router Configuration
- Ensure port forwarding is correctly configured
- Check if router firewall is blocking connections
- Verify internal IP address hasn't changed
- Test with different external ports

### ISP Restrictions
- Some ISPs block port 22
- Try using alternative ports (2222, 443, 80)
- Contact ISP if standard ports are blocked

## 📋 Quick Reference Commands

### SSH Connection:
```bash
# Basic connection
ssh username@hostname_or_ip

# Custom port
ssh -p 2222 username@hostname_or_ip

# With tunnel for web access
ssh -L 3000:localhost:3000 username@hostname_or_ip
```

### File Transfer:
```bash
# Copy files to remote server
scp file.txt username@hostname:/path/to/destination

# Copy files from remote server
scp username@hostname:/path/to/file.txt ./local/path
```

### SSH Config File (~/.ssh/config):
```
Host lucia-hrms
    HostName your_public_ip_or_domain
    User your_username
    Port 22
    LocalForward 3000 localhost:3000
    IdentityFile ~/.ssh/lucia_hrms_key
```

Then connect with: `ssh lucia-hrms`

## 🎉 Success!

Once configured, you can:
1. **SSH from anywhere**: `ssh user@your_domain_or_ip`
2. **Access Lucia HRMS**: Create tunnel and visit http://localhost:3000
3. **Manage remotely**: Full access to your development environment
4. **Work from anywhere**: Complete remote development setup

Your Lucia HRMS is now accessible from anywhere in the world! 🌍
