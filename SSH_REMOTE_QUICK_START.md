# SSH Remote Access Quick Start

Access your Lucia HRMS website from anywhere in the world! 🌍

## 🚀 Quick Setup (4 Steps)

### Step 1: Setup SSH Server
```bash
# Run as Administrator
npm run ssh:setup
```

### Step 2: Test Configuration
```bash
npm run ssh:test
```

### Step 3: Configure Router
1. Open router admin panel (usually http://192.168.1.1)
2. Find "Port Forwarding" settings
3. Forward port 22 to your computer's IP
4. Save settings

### Step 4: Connect Remotely
```bash
# From anywhere in the world
ssh your_username@your_public_ip

# Or create tunnel for web access
npm run ssh:tunnel -- -RemoteHost your_public_ip
```

## 🌐 Access Lucia HRMS Remotely

### Method 1: SSH Tunnel (Easiest)
```bash
# Create tunnel
ssh -L 3000:localhost:3000 username@your_public_ip

# Open browser: http://localhost:3000
```

### Method 2: Using Our Script
```bash
# Use our tunnel script
npm run ssh:tunnel -- -RemoteHost your_public_ip -Username your_username

# Then open: http://localhost:3000
```

## 📋 What You Need

### Before Starting:
- ✅ Windows 10/11 with Administrator access
- ✅ Router with port forwarding capability
- ✅ Internet connection with static or dynamic DNS

### Information to Gather:
- 🔍 Your computer's local IP: `ipconfig`
- 🔍 Your public IP: Visit https://whatismyipaddress.com
- 🔍 Router admin credentials
- 🔍 Your Windows username and password

## 🔧 Router Configuration

### Common Router Settings:
```
Service Name: SSH-Lucia-HRMS
External Port: 22
Internal Port: 22
Internal IP: [Your Computer's IP]
Protocol: TCP
Status: Enabled
```

### Popular Router Interfaces:
- **Linksys**: Advanced → Port Range Forwarding
- **Netgear**: Dynamic DNS → Port Forwarding  
- **TP-Link**: Advanced → NAT Forwarding → Port Forwarding
- **ASUS**: Adaptive QoS → Port Forwarding

## 🔒 Security Tips

### 1. Use Strong Passwords
- Use complex Windows password
- Consider SSH key authentication

### 2. Change Default Port (Optional)
```bash
# Use custom port instead of 22
ssh -p 2222 username@your_public_ip
```

### 3. Monitor Access
- Check SSH logs regularly
- Use Windows Event Viewer

## 📱 Mobile Access

### SSH Apps:
- **iOS**: Termius, SSH Files
- **Android**: JuiceSSH, Termux

### Mobile Steps:
1. Install SSH app
2. Connect to your server
3. Set up port forwarding: 3000 → localhost:3000
4. Open browser: http://localhost:3000

## 🌍 Dynamic DNS (If IP Changes)

### Free Services:
- No-IP: https://www.noip.com
- DuckDNS: https://www.duckdns.org

### Benefits:
- Use domain name instead of IP
- Automatic IP updates
- More reliable access

## 🔍 Troubleshooting

### Can't Connect?
```bash
# Test local connection first
ssh username@localhost

# Check if SSH is running
npm run ssh:test

# Verify router settings
ping your_public_ip
```

### Common Issues:
- **Port 22 blocked**: Try port 2222 or 443
- **Router not configured**: Check port forwarding
- **Firewall blocking**: Allow SSH in Windows Firewall
- **ISP restrictions**: Some ISPs block SSH

## 📞 Quick Commands

### Test Everything:
```bash
npm run ssh:test
```

### Create Tunnel:
```bash
npm run ssh:tunnel -- -RemoteHost YOUR_IP
```

### Manual SSH:
```bash
ssh -L 3000:localhost:3000 username@your_server_ip
```

### Check Services:
```bash
Get-Service sshd
netstat -an | findstr :22
```

## 🎯 Success Checklist

- ✅ SSH server installed and running
- ✅ Windows Firewall configured
- ✅ Router port forwarding enabled
- ✅ Can connect locally: `ssh username@localhost`
- ✅ Can connect remotely: `ssh username@public_ip`
- ✅ SSH tunnel works for web access
- ✅ Lucia HRMS accessible at http://localhost:3000

## 🎉 You're Done!

Once everything is set up:

1. **From anywhere**: `ssh username@your_domain_or_ip`
2. **Create tunnel**: `ssh -L 3000:localhost:3000 username@server`
3. **Access website**: http://localhost:3000
4. **Work remotely**: Full access to your Lucia HRMS!

Your localhost is now accessible from anywhere in the world! 🚀

---

**Need Help?**
- Check REMOTE_SSH_GUIDE.md for detailed instructions
- Run `npm run ssh:test` to diagnose issues
- Verify router configuration and firewall settings
