// ✅ CommonJS app.config.cjs
require("dotenv").config();

module.exports = {
  expo: {
    name: "meetOn",
    slug: "meetOn",
    version: "1.0.18",
    orientation: "portrait",
    icon: "./assets/images/ikonkameeton.png",

    // ✅ WAŻNE: scheme jako TABLICA (iOS + Android + custom)
    scheme: [
      "meeton",
      "com.googleusercontent.apps.547147710127-d4avsbe3ffoold6jiu22tfrkf3lbc1sp", // iOS base
      "com.googleusercontent.apps.547147710127-v1edmllj1mlfmpq7dthquo8hohrae8bh", // Android base
    ],

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
      versionCode: 11,
      useNextNotificationsApi: true,

      adaptiveIcon: {
        foregroundImage: "./assets/images/ikonkameeton.png",
        backgroundColor: "#01032f",
      },

      edgeToEdgeEnabled: true,
      googleServicesFile: "./google-services.json",
      softwareKeyboardLayoutMode: "pan",

      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "INTERNET",
        "com.google.android.gms.permission.AD_ID", // ✅ DODANE (Advertising ID)
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

      intentFilters: [
        // ✅ Twój custom scheme
        {
          action: "VIEW",
          data: [{ scheme: "meeton" }],
          category: ["BROWSABLE", "DEFAULT"],
        },

        // ✅ GOOGLE native redirect scheme (ANDROID)
        {
          action: "VIEW",
          data: [
            {
              scheme:
                "com.googleusercontent.apps.547147710127-v1edmllj1mlfmpq7dthquo8hohrae8bh",
              pathPrefix: "/oauthredirect",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },

        // ✅ (Opcjonalnie) GOOGLE native redirect scheme (iOS base)
        // Nie jest wymagane dla Androida, ale nie szkodzi jeśli zostawisz.
        {
          action: "VIEW",
          data: [
            {
              scheme:
                "com.googleusercontent.apps.547147710127-d4avsbe3ffoold6jiu22tfrkf3lbc1sp",
              pathPrefix: "/oauthredirect",
            },
          ],
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
          "android:name":
            "com.google.firebase.messaging.default_notification_color",
          "android:resource": "@color/notification_icon_color",
        },
        {
          "android:name":
            "com.google.firebase.messaging.default_notification_icon",
          "android:resource": "@drawable/notification_icon",
        },
        {
          "android:name":
            "expo.modules.notifications.default_notification_color",
          "android:resource": "@color/notification_icon_color",
        },
        {
          "android:name":
            "expo.modules.notifications.default_notification_icon",
          "android:resource": "@drawable/notification_icon",
        },
      ],
    },

    // ================================
    // iOS
    // ================================
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.domino96.meetOn",
      buildNumber: "16",
      googleServicesFile: "./GoogleService-Info.plist",

      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "Aplikacja potrzebuje Twojej lokalizacji, aby pokazać wydarzenia w pobliżu.",
        NSUserTrackingUsageDescription:
          "Używamy identyfikatora urządzenia, aby wyświetlać dopasowane reklamy.",

        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "meeton",
              "com.googleusercontent.apps.547147710127-d4avsbe3ffoold6jiu22tfrkf3lbc1sp",
              "com.googleusercontent.apps.547147710127-v1edmllj1mlfmpq7dthquo8hohrae8bh",
            ],
          },
        ],
      },
    },

    // ================================
    // NOTIFICATIONS
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
            useFrameworks: "static",
          },
        },
      ],

      [
        "react-native-google-mobile-ads",
        {
          androidAppId:
            process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
            "ca-app-pub-4590930660721541~1689041712",
          iosAppId:
            process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ||
            "ca-app-pub-4590930660721541~2628957980",
        },
      ],

      "./plugins/withIosModularHeaders.js",
    ],

    experiments: {
      typedRoutes: true,
    },

    // ================================
    // EXTRA
    // ================================
    extra: {
      router: {},
      eas: {
        projectId: "21c25dfa-afc4-4d4a-9ce3-3d1a809d4dfe",
      },

      EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    },

    owner: "domino96",

    cli: {
      version: ">=3.0.0",
      appVersionSource: "remote",
    },
  },
};
