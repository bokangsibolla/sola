# Mobile Preview Troubleshooting

## Quick Fix: Use Expo Go App (Recommended)

You don't need Android SDK to preview on a physical device:

1. **Install Expo Go** on your phone:
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Scan the QR code** shown in your terminal with:
   - **iOS**: Use the built-in Camera app
   - **Android**: Use the Expo Go app's scanner

3. Make sure your phone and computer are on the **same WiFi network**

## Fix Android SDK (Only if using Android Emulator)

If you want to use Android emulator, you need to:

1. **Install Android Studio** from https://developer.android.com/studio

2. **Set up ANDROID_HOME** in your shell profile (~/.zshrc or ~/.bash_profile):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

3. **Reload your shell**:
   ```bash
   source ~/.zshrc  # or ~/.bash_profile
   ```

4. **Verify installation**:
   ```bash
   echo $ANDROID_HOME
   adb version
   ```

## Package Version Fix

The package version mismatch has been fixed. Run:
```bash
npm install
```

## Common Issues

### "Cannot connect to Metro bundler"
- Make sure your phone and computer are on the same WiFi
- Try restarting: `npx expo start -c`

### "Network request failed"
- Check firewall settings
- Try using tunnel mode: `npx expo start --tunnel`

### QR code not working
- Make sure Expo Go app is installed
- Try manually entering the URL shown in terminal
