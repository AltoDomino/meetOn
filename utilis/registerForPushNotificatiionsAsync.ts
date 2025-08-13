import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  }).catch((e) => console.log("setNotificationChannelAsync error:", e));
}

type RegisterResult = {
  expoToken: string | null;
  fcmToken: string | null;  // Android
  apnsToken: string | null; // iOS
};

export const registerPushToken = async (userId: number): Promise<RegisterResult | null> => {
  if (!Device.isDevice) {
    console.log("🚫 To nie jest fizyczne urządzenie (simulator nie obsługuje pushy).");
    return null;
  }

  // 1) Uprawnienia
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

if (existing !== "granted") {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true
    }
  });
  finalStatus = status;
}


    if (finalStatus !== "granted") {
      console.log("🚫 Brak zgody na powiadomienia.");
      return null;
    }
  } catch (e) {
    console.error("❌ Błąd podczas sprawdzania/żądania uprawnień:", e);
    return null;
  }

  // 2) Tokeny
  const ownership = Constants.appOwnership; // 'expo' | 'standalone'
  const projectId =
    // SDK 53+: projectId z extra.eas lub easConfig (fallback to Twój ID)
    (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    "21c25dfa-afc4-4d4a-9ce3-3d1a809d4dfe";

  let expoToken: string | null = null;
  let fcmToken: string | null = null;  // Android native/FCM
  let apnsToken: string | null = null; // iOS native/APNs

  try {
    // 2a) Expo Push Token — dostępny zarówno w Expo Go (iOS/Android),
    // jak i w buildach EAS. Przydaje się do testów i do Expo Push Service.
    const expoResp = await Notifications.getExpoPushTokenAsync({ projectId });
    expoToken = expoResp.data;
    console.log("📨 Expo Push Token:", expoToken);
  } catch (e) {
    // W starych środowiskach może nie zadziałać — nie przerywaj
    console.log("ℹ️ getExpoPushTokenAsync error (niekrytyczne):", e);
  }

  try {
    // 2b) Native token – tylko w buildzie (ownership !== 'expo')
    if (ownership !== "expo") {
      const native = await Notifications.getDevicePushTokenAsync();
      // SDK 53: { type: 'ios'|'android', data: string }
      const nativeData: any = (native as any)?.data ?? (native as any)?.token ?? null;
      const nativeType: string | undefined = (native as any)?.type;

      if (Platform.OS === "android") {
        if (typeof nativeData === "string" && nativeData.length > 0) {
          fcmToken = nativeData; // FCM
          console.log("🔥 Android FCM token:", fcmToken);
        }
      } else if (Platform.OS === "ios") {
        if (typeof nativeData === "string" && nativeData.length > 0) {
          apnsToken = nativeData; // APNs
          console.log("🍎 iOS APNs token:", apnsToken, "type:", nativeType);
        }
      }
    } else {
      console.log("ℹ️ ownership=expo (Expo Go) — brak natywnego tokena APNs/FCM.");
    }
  } catch (e) {
    console.log("ℹ️ getDevicePushTokenAsync error (native token):", e);
  }

  // 3) Wyślij do backendu
  const payload = {
    userId,
    token: expoToken,     // Expo Push Token (może być null)
    fcmToken,             // Android FCM (null na iOS)
    apnsToken,            // iOS APNs (null na Androidzie lub w Expo Go)
    platform: Platform.OS,
    ownership,            // pomocne do debugowania po stronie backendu
  };

  console.log("➡️ Rejestruję w backendzie:", payload);

  try {
    await fetch("https://meeton-backend-ffmo.onrender.com/api/push-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("❌ Błąd wysyłki tokenu do backendu:", e);
  }

  return { expoToken, fcmToken, apnsToken };
};
