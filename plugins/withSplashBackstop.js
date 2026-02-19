/**
 * Expo config plugin: adds a native 8-second splash screen backstop to MainActivity.
 *
 * If the JS bundle fails to load (bad bytecode, native crash, etc.),
 * the native splash screen will still hide after 8 seconds so the user
 * isn't stuck on an orange screen forever.
 *
 * The JS-level failsafe (3s in _layout.tsx) should fire first in normal operation.
 */
const { withMainActivity } = require('expo/config-plugins');

const BACKSTOP_IMPORTS = `import android.os.Handler
import android.os.Looper
import android.util.Log
import expo.modules.splashscreen.SplashScreenManager`;

const BACKSTOP_CODE = `
    // Native backstop: force-hide splash after 8s in case JS never loads.
    Handler(Looper.getMainLooper()).postDelayed({
      try {
        Log.w("SolaMainActivity", "Native splash backstop triggered")
        SplashScreenManager.hide()
      } catch (e: Exception) {
        Log.w("SolaMainActivity", "Splash backstop error: \${e.message}")
      }
    }, 8_000)`;

function withSplashBackstop(config) {
  return withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    // Ensure SplashScreenManager import is present (expo-splash-screen plugin
    // should add it, but we need it for our backstop code too)
    if (!contents.includes('import expo.modules.splashscreen.SplashScreenManager')) {
      contents = contents.replace(
        'import android.os.Bundle',
        `import android.os.Bundle\nimport expo.modules.splashscreen.SplashScreenManager`
      );
    }

    // Add Handler/Log imports if not already present
    if (!contents.includes('android.os.Handler')) {
      contents = contents.replace(
        'import android.os.Bundle',
        `import android.os.Bundle\nimport android.os.Handler\nimport android.os.Looper\nimport android.util.Log`
      );
    }

    // Add backstop code after super.onCreate(null)
    if (!contents.includes('Native backstop')) {
      contents = contents.replace(
        'super.onCreate(null)',
        `super.onCreate(null)\n${BACKSTOP_CODE}`
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withSplashBackstop;
