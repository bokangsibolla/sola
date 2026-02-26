import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Sola',
  slug: 'sola',
  owner: 'bokangsibolla',
  extra: {
    eas: {
      projectId: '770cff79-e30c-4a09-9b84-e113ba71de07',
    },
  },
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'sola',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.solatravel.sola',
    buildNumber: '1',
    usesAppleSignIn: true,
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        'Sola needs access to your photos to set your profile picture and share travel moments.',
      NSCameraUsageDescription:
        'Sola needs camera access to take a profile photo or capture travel moments.',
      NSPhotoLibraryAddUsageDescription:
        'Sola needs permission to save photos to your library.',
    },
  },
  android: {
    googleServicesFile: './google-services.json',
    package: 'app.solatravel.sola',
    permissions: ['android.permission.ACCESS_NETWORK_STATE'],
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    '@react-native-google-signin/google-signin',
    [
      'expo-splash-screen',
      {
        image: './assets/images/sola-logo-white.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#E5653A',
        dark: {
          backgroundColor: '#E5653A',
        },
      },
    ],
    'expo-notifications',
    'expo-secure-store',
    'expo-apple-authentication',
    [
      '@sentry/react-native/expo',
      {
        organization: 'sola',
        project: 'sola',
        uploadSourceMaps: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Sola needs access to your photos to set your profile picture and share travel moments.',
        cameraPermission:
          'Sola needs camera access to take a profile photo or capture travel moments.',
      },
    ],
    './plugins/withSplashBackstop',
    './plugins/withProviderInstaller',
    './plugins/withStripPermissions',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: false,
  },
});
