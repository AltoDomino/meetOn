// ✅ CommonJS app.config.cjs (kompatybilny z Android, iOS, EAS i OAuth Google)
require("dotenv").config();

module.exports = {
  expo: {
    name: "meetOn",
    slug: "meetOn",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/ikonkameeton.png",

    scheme: "meeton",
    userInterfaceStyle: "automatic",

    splash: {
      image: "./assets/images/startMeetOn.png",
      resizeMode: "cover",
      backgroundColor: "#01032f",
    },

    // ================================
    // ANDROID
    // ================================
    android: {
      package: "com.domino96.meetOn",
      versionCode: 8,
      useNextNotificationsApi: true,

      adaptiveIcon: {
        foregroundImage: "./assets/images/ikonkameeton.png",
        backgroundColor: "#01032f",
      },

      edgeToEdgeEnabled: true,

      // Firebase Android
      googleServicesFile: "./google-services.json",

      softwareKeyboardLayoutMode: "pan",

      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "INTERNET",
        "POST_NOTIFICATIONS",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO",
        "SYSTEM_ALERT_WINDOW",
        "VIBRATE",
      ],

      allowBackup: true,
      dataExtractionRules: "@xml/secure_store_data_extraction_rules",
      fullBackupContent: "@xml/secure_store_backup_rules",

      // Deep linking — Google OAuth
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "meeton" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],

      queries: [
        {
          intent: {
            action: "android.intent.action.VIEW",
            category: "android.intent.category.BROWSABLE",
            data: { scheme: "https" },
          },
        },
      ],

      metaData: [
        {
          "android:name": "com.google.firebase.messaging.default_notification_color",
          "android:resource": "@color/notification_icon_color",
        },
        {
          "android:name": "com.google.firebase.messaging.default_notification_icon",
          "android:resource": "@drawable/notification_icon",
        },
        {
          "android:name": "expo.modules.notifications.default_notification_color",
          "android:resource": "@color/notification_icon_color",
        },
        {
          "android:name": "expo.modules.notifications.default_notification_icon",
          "android:resource": "@drawable/notification_icon",
        },
      ],

      config: {
        googleMobileAdsAppId: "ca-app-pub-4590930660721541~1689041712",
      },
    },

    // ================================
    // iOS
    // ================================
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.domino96.meetOn",

      googleServicesFile: "./GoogleService-Info.plist",

      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "Aplikacja potrzebuje Twojej lokalizacji, aby pokazać wydarzenia w pobliżu.",
        NSUserTrackingUsageDescription:
          "Używamy identyfikatora urządzenia, aby wyświetlać dopasowane reklamy.",
      },

      icon: "./assets/images/meetonikonaIOS.jpeg",
    },

    // ================================
    // POWIADOMIENIA
    // ================================
    notification: {
      icon: "./assets/images/powiadomienie-meeton.png",
      color: "#0d1a4d",
    },

    // ================================
    // UPDATES
    // ================================
    updates: {
      enabled: false,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },

    // ================================
    // WEB
    // ================================
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/startMeetOn.png",
      name: "meetOn",
      scheme: "meeton",
    },

    // ================================
    // PLUGINS
    // ================================
    plugins: [
      "expo-router",
      "expo-font",
      "expo-secure-store",
      "expo-apple-authentication",
      "react-native-edge-to-edge",

      [
        "expo-notifications",
        {
          icon: "./assets/images/powiadomienie-meeton.png",
          color: "#0d1a4d",
        },
      ],

      [
        "expo-build-properties",
        {
          android: {
            kotlinVersion: "2.0.21",
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
            minSdkVersion: 24,
          },
          ios: {
            useFrameworks: "static", // 🔥 Firebase + GoogleUtilities
          },
        },
      ],

      "./plugins/withIosModularHeaders.js", // 🔥 naprawia modular headers
    ],

    experiments: {
      typedRoutes: true,
    },

    // ================================
    // EXTRA
    // ================================
    extra: {
      router: {},
      eas: { projectId: "21c25dfa-afc4-4d4a-9ce3-3d1a809d4dfe" },

      EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    },

    // ================================
    // AdMob CONFIG (RN Google Mobile Ads)
    // ================================
    "react-native-google-mobile-ads": {
      android_app_id: "ca-app-pub-4590930660721541~1689041712",
      ios_app_id: "ca-app-pub-4590930660721541~2628957980",
    },

    owner: "domino96",

    cli: {
      version: ">=3.0.0",
      appVersionSource: "remote",
    },
  },
};

// ================================
// FALLBACK FOR GRADLE (Android)
// ================================
if (require.main === module) {
  const config = {
    expo: {
      android: {
        config: {
          googleMobileAdsAppId: "ca-app-pub-4590930660721541~1689041712",
        },
      },
      "react-native-google-mobile-ads": {
        android_app_id: "ca-app-pub-4590930660721541~1689041712",
        ios_app_id: "ca-app-pub-4590930660721541~2628957980",
      },
    },
  };
  process.stdout.write(JSON.stringify(config));
}
