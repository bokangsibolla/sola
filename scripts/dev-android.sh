#!/bin/bash
# Android development startup script
# Ensures USB port forwarding + Metro dev server are running

set -e

echo "Setting up Android development..."

# 1. Check device is connected
if ! adb devices | grep -q "device$"; then
  echo "No Android device connected. Plug in your phone and enable USB debugging."
  exit 1
fi

# 2. USB port forwarding (required for debug app to connect to Metro)
echo "Setting up port forwarding..."
adb reverse tcp:8081 tcp:8081
echo "Port forwarding active (8081)"

# 3. Start Metro dev server
echo "Starting Metro..."
npx expo start --dev-client
