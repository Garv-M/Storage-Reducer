import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'storage_reducer_app',
  slug: 'storage_reducer_app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'storage-reducer-app',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: 'com.anonymous.storage-reducer-app',
    supportsTablet: true,
    infoPlist: {
      NSPhotoLibraryUsageDescription:
        'This app needs photo library access to help you review and manage your gallery.',
      NSPhotoLibraryAddUsageDescription:
        'This app needs permission to update your photo library during restore and delete workflows.',
      NSFaceIDUsageDescription:
        'Use Face ID to quickly and securely unlock the app.',
    },
  },
  android: {
    package: 'com.anonymous.storage_reducer_app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'USE_BIOMETRIC'],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-media-library',
    'expo-local-authentication',
    'expo-video',
    'expo-secure-store',
    'expo-splash-screen',
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
