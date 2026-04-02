#!/bin/bash

# setup-gui.sh - Enables Visual GUI on macOS GitHub Action Runner
# 🚀 Powered by noVNC and ngrok

echo "🔧 Starting GUI Setup..."

# 1. Install dependencies
brew install socat novnc

# 2. Enable Screen Sharing
echo "🔓 Enabling Screen Sharing..."
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
    -activate -configure -access -on \
    -privs -all -restart -agent

# 3. Create a VNC user (optional but recommended)
# Using default 'runner' user for simplicity in ephemeral environments

# 4. Start Websockify (for noVNC)
# We need to bridge the VNC port (5900) to WebSockets (6080)
echo "🌐 Starting noVNC proxy..."
websockify --web /usr/local/share/novnc --heartbeat 30 6080 localhost:5900 &

echo "✅ Setup complete. Ready for tunnel."
