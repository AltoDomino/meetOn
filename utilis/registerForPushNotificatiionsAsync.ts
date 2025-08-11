import { Platform, Alert } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationChannelAsync("default", {
  name: "default",
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#FF231F7C",
});

export const registerPushToken = async (userId: number) => {
  if (!Device.isDevice) {
    console.log("🚫 To nie jest fizyczne urządzenie.");
    return;
  }

  // uprawnienia
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("🚫 Brak zgody na powiadomienia.");
    return;
  }

  const ownership = Constants.appOwnership; // 'expo' (Expo Go) | 'standalone' (APK/AAB/Dev Client)
  console.log("ℹ️ appOwnership:", ownership, "platform:", Platform.OS);

  let expoToken: string | undefined;
  let fcmToken: string | undefined;

  try {
    // 1) Expo token — tylko w Expo Go
    if (ownership === "expo") {
      const r = await Notifications.getExpoPushTokenAsync({
        projectId:
          (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
          (Constants as any)?.easConfig?.projectId ??
          "21c25dfa-afc4-4d4a-9ce3-3d1a809d4dfe",
      });
      expoToken = r.data;
      console.log("📨 Expo Push Token:", expoToken);
    }

  
    if (Platform.OS === "android" && ownership !== "expo") {
      const native = await Notifications.getDevicePushTokenAsync();
      console.log("🔥 native token object:", native); // zwykle: { type: 'android', data: '...' }

      // NIE sprawdzamy type === 'fcm' — bierzemy zawsze native.data, jeśli jest
      const rawData: any = (native as any)?.data ?? (native as any)?.token ?? null;
      if (typeof rawData === "string" && rawData.length > 0) {
        fcmToken = rawData;
      }
    }

    const payload = {
      userId,
      token: expoToken ?? null,  // Expo push token (null gdy brak)
      fcmToken: fcmToken ?? null, // FCM token (null gdy brak)
      platform: Platform.OS,
    };

    console.log("➡️ Wyślę do backendu:", payload);

    await fetch("https://meeton-backend-ffmo.onrender.com/api/push-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("❌ Błąd rejestracji tokenów:", err);
  }
};
