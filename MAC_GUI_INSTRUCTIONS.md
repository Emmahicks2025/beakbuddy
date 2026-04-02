# 🖥️ Enable Visual GUI on MacBook Instance

Follow these steps to enable a visual remote desktop connection on your macOS instance using nothing but the command line.

## Step 1: Enable Screen Sharing (Run on Mac)
Copy and paste this exact command into your current command-line window (SSH/PSH) connected to the Mac:

```bash
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
    -activate -configure -access -on \
    -privs -all -restart -agent
```

> [!IMPORTANT]
> This command requires `sudo` (Admin) access. It will prompt you for your password.

## Step 2: Get the IP Address
Run this on the Mac to find the local IP address:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Step 3: Connect from Windows

### Option A: Standard VNC (Recommended)
macOS uses the VNC protocol. The easiest way to connect is using a free tool like **VNC Viewer**.
1. Download here: [RealVNC Viewer](https://www.realvnc.com/en/connect/download/viewer/)
2. Open it and type in the **IP Address** from Step 2.
3. Log in with your Mac **Username** and **Password**.

### Option B: "Simple RDP" (Using MS Remote Desktop)
If you specifically want to use the built-in Windows "Remote Desktop Connection" (RDP):
1. Use a bridge like **Remote Desktoper** or install `XRDP` on the Mac.
2. However, for the most stable and visual experience on macOS, **Option A** is far more reliable.

---

## Troubleshooting
- **Firewall**: Make sure the Mac firewall allows incoming connections on port 5900.
- **User Account**: Ensure your user has a password set. Headless accounts with no password may fail to authenticate.
