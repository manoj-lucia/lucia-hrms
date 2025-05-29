# Router Port Forwarding Setup Guide

## Your Network Information:
- **Local IP**: 192.168.1.4
- **Public IP**: 223.185.51.225
- **SSH Port**: 22
- **Username**: user

## Step 1: Access Router Admin Panel

### Common Router IP Addresses:
- http://192.168.1.1 (most common)
- http://192.168.0.1
- http://10.0.0.1
- http://192.168.1.254

### Default Login Credentials:
- **Username**: admin, **Password**: admin
- **Username**: admin, **Password**: password
- **Username**: admin, **Password**: (blank)
- Check router label for specific credentials

## Step 2: Find Port Forwarding Section

### Look for these menu items:
- **Advanced** → **Port Forwarding**
- **NAT** → **Virtual Server**
- **Applications & Gaming** → **Port Range Forwarding**
- **Security** → **Port Forwarding**
- **Network** → **Port Forwarding**

## Step 3: Create Port Forwarding Rule

### Settings to Configure:
```
Service Name: SSH-Lucia-HRMS
Application: SSH
External Port Start: 22
External Port End: 22
Internal Port Start: 22
Internal Port End: 22
Protocol: TCP
Internal IP Address: 192.168.1.4
Status: Enabled/Active
```

### Alternative Settings Format:
```
Rule Name: SSH-Remote-Access
Public Port: 22
Private Port: 22
Private IP: 192.168.1.4
Protocol: TCP
Schedule: Always
```

## Step 4: Save and Apply Settings

1. Click **Save** or **Apply**
2. Some routers require a **Reboot**
3. Wait 2-3 minutes for changes to take effect

## Step 5: Test Configuration

### From Inside Your Network:
```bash
# Test local SSH
ssh user@192.168.1.4

# Test with public IP (should work if router supports hairpin NAT)
ssh user@223.185.51.225
```

### From Outside Your Network:
```bash
# Test from mobile hotspot or friend's network
ssh user@223.185.51.225
```

## Common Router Interfaces

### Linksys Routers:
1. Go to **Smart Wi-Fi Tools** → **Port Range Forwarding**
2. Add new forwarding rule
3. Set External/Internal ports to 22
4. Set IP to 192.168.1.4

### Netgear Routers:
1. Go to **Advanced** → **Dynamic DNS** → **Port Forwarding**
2. Add custom service
3. Configure ports and IP address

### TP-Link Routers:
1. Go to **Advanced** → **NAT Forwarding** → **Port Forwarding**
2. Click **Add**
3. Configure service settings

### ASUS Routers:
1. Go to **Adaptive QoS** → **Port Forwarding**
2. Enable port forwarding
3. Add new rule

### D-Link Routers:
1. Go to **Advanced** → **Port Forwarding**
2. Add new rule
3. Configure ports and destination

## Troubleshooting

### Port Forwarding Not Working:
1. **Check router firewall** - Disable temporarily to test
2. **Verify internal IP** - Make sure 192.168.1.4 is correct
3. **Check ISP restrictions** - Some ISPs block port 22
4. **Try different port** - Use 2222 instead of 22
5. **Router reboot** - Power cycle the router

### Alternative Ports:
If port 22 is blocked, try these ports:
- **2222** (common SSH alternative)
- **443** (HTTPS port, rarely blocked)
- **80** (HTTP port, rarely blocked)
- **8080** (alternative HTTP port)

### ISP Port Blocking:
Some ISPs block common ports. Contact your ISP or:
- Use alternative ports (2222, 443, 8080)
- Use VPN service
- Use cloud-based solutions

## Security Considerations

### Recommended Security Measures:
1. **Change default SSH port** from 22 to 2222
2. **Use strong passwords** for user account
3. **Enable SSH key authentication**
4. **Disable password authentication** (after setting up keys)
5. **Monitor SSH logs** regularly
6. **Use fail2ban** or similar tools
7. **Keep SSH server updated**

### Change SSH Port (Optional):
1. Edit SSH config: `C:\ProgramData\ssh\sshd_config`
2. Change `Port 22` to `Port 2222`
3. Update firewall rule for new port
4. Update router port forwarding
5. Restart SSH service

## Testing Commands

### Local Testing:
```bash
# Test SSH service
Get-Service sshd

# Test port listening
netstat -an | findstr :22

# Test local connection
ssh user@localhost
```

### Remote Testing:
```bash
# Test from outside network
ssh user@223.185.51.225

# Test with custom port
ssh -p 2222 user@223.185.51.225

# Create tunnel for web access
ssh -L 3000:localhost:3000 user@223.185.51.225
```

## Success Indicators

### You'll know it's working when:
- ✅ Can SSH from outside your network
- ✅ Connection doesn't timeout
- ✅ Password prompt appears
- ✅ Can create SSH tunnels
- ✅ Can access Lucia HRMS remotely

### Common Error Messages:
- **Connection refused** → SSH service not running
- **Connection timeout** → Port forwarding not configured
- **Permission denied** → Wrong username/password
- **Host unreachable** → Network/firewall issue

## Next Steps After Success

1. **Test SSH tunnel**: `ssh -L 3000:localhost:3000 user@223.185.51.225`
2. **Start Lucia HRMS**: `npm run dev`
3. **Access remotely**: http://localhost:3000
4. **Set up SSH keys** for better security
5. **Configure dynamic DNS** if IP changes frequently

Your router configuration is the key step to enable remote access!
