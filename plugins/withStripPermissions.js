/**
 * Expo config plugin: strips dangerous/unused permissions from AndroidManifest.xml.
 *
 * Works alongside `android.blockedPermissions` in app.config.ts:
 * - blockedPermissions handles permissions added by Expo's built-in system
 * - This plugin adds `tools:node="remove"` as a safety net for permissions
 *   injected by library AndroidManifest.xml files during Gradle manifest merging
 */
const { withAndroidManifest } = require('expo/config-plugins');

const PERMISSIONS_TO_REMOVE = [
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
];

function withStripPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    // Remove any existing entries for blocked permissions
    manifest['uses-permission'] = manifest['uses-permission'].filter(
      (perm) => {
        const name = perm.$?.['android:name'];
        return !PERMISSIONS_TO_REMOVE.includes(name);
      }
    );

    // Add tools:node="remove" entries so Gradle manifest merger also strips
    // these permissions if any library manifest tries to add them
    for (const permission of PERMISSIONS_TO_REMOVE) {
      const alreadyBlocked = manifest['uses-permission'].some(
        (perm) =>
          perm.$?.['android:name'] === permission &&
          perm.$?.['tools:node'] === 'remove'
      );

      if (!alreadyBlocked) {
        manifest['uses-permission'].push({
          $: {
            'android:name': permission,
            'tools:node': 'remove',
          },
        });
      }
    }

    console.log(
      `[withStripPermissions] Blocked ${PERMISSIONS_TO_REMOVE.length} permission(s) with tools:node="remove"`
    );

    return config;
  });
}

module.exports = withStripPermissions;
