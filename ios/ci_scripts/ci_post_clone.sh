#!/bin/sh

# ============================================
# BeakBuddy Xcode Cloud CI Script
# This runs after the code is cloned on Apple's servers.
# It handles the Expo prebuild to generate native files.
# ============================================

set -e

# 1. Install Node.js dependencies
echo "--- Installing dependencies ---"
npm install --frozen-lockfile || npm install

# 2. Generate native iOS project
echo "--- Running Expo Prebuild ---"
# We use --no-install because we already handled it, and it saves time.
npx expo prebuild --platform ios --no-install

# 3. CocoaPods installation
echo "--- Installing CocoaPods ---"
cd ios
pod install
cd ..

echo "--- Prebuild Complete! Xcode Cloud will now begin the archive. ---"
