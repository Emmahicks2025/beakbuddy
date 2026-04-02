#!/bin/bash
export PATH="$HOME/.rbenv/bin:/opt/homebrew/bin:$PATH"
eval "$(rbenv init -)"
rbenv global 3.2.2
echo "Using Ruby: $(ruby --version)"

# Add to shell profile permanently
echo 'export PATH="$HOME/.rbenv/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
echo 'export LANG=en_US.UTF-8' >> ~/.zshrc

gem install fastlane cocoapods --no-document
rbenv rehash

echo "=== All done! Verifying... ==="
fastlane --version
pod --version
echo "Ready to push to TestFlight!"
