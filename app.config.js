
export default {
  expo: {
    name: "PlateUp",
    slug: "plateup",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "plateup",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      url: "https://u.expo.dev/56521029-1de0-4560-af1d-b5daa9814d21"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "cover",
      backgroundColor: "#302783"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.jorge.plateup",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: ["android.permission.RECORD_AUDIO"],
      usesCleartextTraffic: true
    },
    plugins: [
      "expo-router",
      ["expo-splash-screen", { "backgroundColor": "#302783", "image": "./assets/images/splash.png", "resizeMode": "cover" }],
      ["expo-image-picker", { "photosPermission": "The app needs access to your photos..." }]
    ],
    extra: {
      router: {},
      eas: {
        projectId: "56521029-1de0-4560-af1d-b5daa9814d21"
      },
      apiUrl: process.env.API_URL || process.env.EXPO_PUBLIC_API_URL || "https://plateup-mobile-server.onrender.com/api"
    }
  }
};