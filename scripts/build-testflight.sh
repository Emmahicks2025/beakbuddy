#!/bin/bash
set -e

echo "======================================"
echo " BeakBuddy → TestFlight Build Script"
echo "======================================"

# Find project directory
PROJECT_DIR=""
for dir in ~/beakbuddy ~/Parrot ~/parrot ~/Desktop/beakbuddy ~/project; do
  if [ -f "$dir/app.json" ]; then
    PROJECT_DIR="$dir"
    break
  fi
done

if [ -z "$PROJECT_DIR" ]; then
  echo "Searching for project..."
  PROJECT_DIR=$(find ~ -name "app.json" -not -path "*/node_modules/*" -maxdepth 5 2>/dev/null | head -1 | xargs dirname)
fi

if [ -z "$PROJECT_DIR" ]; then
  echo "ERROR: Could not find project. Cloning from GitHub..."
  cd ~
  git clone https://github.com/Emmahicks2025/beakbuddy.git
  PROJECT_DIR=~/beakbuddy
fi

echo "Project found at: $PROJECT_DIR"
cd "$PROJECT_DIR"

echo ""
echo "[1/5] Pulling latest code..."
git pull origin main

echo ""
echo "[2/5] Installing JS dependencies..."
npm install

echo ""
echo "[3/5] Running Expo prebuild..."
npx expo prebuild --platform ios --no-install

echo ""
echo "[4/5] Installing CocoaPods..."
cd ios && pod install && cd ..

echo ""
echo "[5/5] Building & uploading to TestFlight via Fastlane..."
fastlane ios beta

echo ""
echo "======================================"
echo " SUCCESS! Build submitted to TestFlight"
echo "======================================"
