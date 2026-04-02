#!/bin/bash
set -e

echo "=============================="
echo " Mac Dev Tools Setup Script"
echo "=============================="

# 1. Install Homebrew
if ! command -v brew &>/dev/null; then
  echo "[1/5] Installing Homebrew..."
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add brew to PATH for Apple Silicon or Intel
  if [ -f /opt/homebrew/bin/brew ]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -f /usr/local/bin/brew ]; then
    echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/usr/local/bin/brew shellenv)"
  fi
else
  echo "[1/5] Homebrew already installed. Skipping."
fi

# Source brew env
if [ -f /opt/homebrew/bin/brew ]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [ -f /usr/local/bin/brew ]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

# 2. Install rbenv and ruby-build
if ! command -v rbenv &>/dev/null; then
  echo "[2/5] Installing rbenv + ruby-build..."
  brew install rbenv ruby-build
  echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zprofile
  echo 'eval "$(rbenv init -)"' >> ~/.zprofile
  export PATH="$HOME/.rbenv/bin:$PATH"
  eval "$(rbenv init -)"
else
  echo "[2/5] rbenv already installed. Skipping."
fi

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)" 2>/dev/null || true

# 3. Install Ruby 3.2.2
RUBY_VERSION="3.2.2"
if ! rbenv versions | grep -q "$RUBY_VERSION"; then
  echo "[3/5] Installing Ruby $RUBY_VERSION..."
  rbenv install "$RUBY_VERSION"
  rbenv global "$RUBY_VERSION"
else
  echo "[3/5] Ruby $RUBY_VERSION already installed. Skipping."
  rbenv global "$RUBY_VERSION"
fi

# 4. Install Fastlane
if ! command -v fastlane &>/dev/null; then
  echo "[4/5] Installing Fastlane..."
  gem install fastlane --no-document
  rbenv rehash
else
  echo "[4/5] Fastlane already installed. Skipping."
fi

# 5. Install CocoaPods
if ! command -v pod &>/dev/null; then
  echo "[5/5] Installing CocoaPods..."
  gem install cocoapods --no-document
  rbenv rehash
else
  echo "[5/5] CocoaPods already installed. Skipping."
fi

echo ""
echo "=============================="
echo " All tools installed!"
echo " Versions:"
echo "=============================="
brew --version
ruby --version
fastlane --version
pod --version
echo ""
echo "NEXT STEP: Install Xcode from the Mac App Store, then run:"
echo "  xcode-select --install"
echo "=============================="
