/**
 * Expo config plugin: injects ProviderInstaller.installIfNeeded() into MainApplication.onCreate().
 *
 * Fixes Android 15 TLS race condition where GmsCore security provider isn't
 * ready before React Native boots, causing Supabase auth requests to fail
 * with SSL handshake errors.
 *
 * play-services-base (which contains ProviderInstaller) is already a transitive
 * dependency of @react-native-google-signin/google-signin — no Gradle changes needed.
 */
const { withMainApplication } = require('expo/config-plugins');

const PROVIDER_IMPORT =
  'import com.google.android.gms.security.ProviderInstaller';

const PROVIDER_CODE = `    // Fix Android 15 TLS: ensure GmsCore security provider is ready before RN boots
    try {
      ProviderInstaller.installIfNeeded(this)
    } catch (e: Exception) {
      android.util.Log.w("SolaApp", "ProviderInstaller failed: \${e.message}")
    }`;

function withProviderInstaller(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    // Idempotency: skip if already injected
    if (contents.includes('ProviderInstaller.installIfNeeded')) {
      return config;
    }

    // Add import after the last expo import
    const expoImportAnchor = 'import expo.modules.ReactNativeHostWrapper';
    if (!contents.includes(expoImportAnchor)) {
      throw new Error(
        `[withProviderInstaller] Could not find anchor import: "${expoImportAnchor}". ` +
          'MainApplication.kt structure may have changed.'
      );
    }

    contents = contents.replace(
      expoImportAnchor,
      `${expoImportAnchor}\n${PROVIDER_IMPORT}`
    );

    // Insert ProviderInstaller call before loadReactNative
    const loadAnchor = 'ApplicationLifecycleDispatcher.onApplicationCreate(this)';
    if (!contents.includes(loadAnchor)) {
      throw new Error(
        `[withProviderInstaller] Could not find anchor: "${loadAnchor}". ` +
          'MainApplication.kt structure may have changed.'
      );
    }

    contents = contents.replace(
      loadAnchor,
      `${PROVIDER_CODE}\n    ${loadAnchor}`
    );

    config.modResults.contents = contents;
    console.log(
      '[withProviderInstaller] Injected ProviderInstaller into MainApplication.onCreate()'
    );
    return config;
  });
}

module.exports = withProviderInstaller;
