import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.wellio.health',
  appName: 'Wellio',
  webDir: 'dist',
  
  // Production build configuration (comment out server block for production)
  // For development/hot-reload, uncomment the server block below:
  // server: {
  //   url: 'https://313fb361-1ca9-408d-86bb-bf8138adf458.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1e2433',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e2433',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  
  ios: {
    scheme: 'Wellio',
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
  },
  
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
