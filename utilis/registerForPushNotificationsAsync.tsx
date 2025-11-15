import { Platform, AppState } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Tokens = {
  expoToken: string | null;
  fcmToken: string | null;
  apnsToken: string | null;
};

const LAST_SENT_KEY = "lastSentPushTokens_v2";

async function askPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });

  return status === "granted";
}

async function getTokens(): Promise<Tokens> {
  const ownership = Constants.appOwnership; // 'expo' | 'standalone' | 'guest'
  const projectId =
    // w dev-client/standalone:
    (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    (Constants as any)?.expoConfig?.extra?.eas?.projectID;

  // 1) Expo push token (przez serwery Expo)
  let expoToken: string | null = null;
  try {
    if (projectId) {
      const t = await Notifications.getExpoPushTokenAsync({ projectId });
      expoToken = t.data ?? null;
    }
  } catch (e) {
    console.log("[PUSH] Error getting Expo token", e);
  }

  // 2) Natywny token (FCM/APNS) – przez expo-notifications
  let fcmToken: string | null = null;
  let apnsToken: string | null = null;

  // W Expo Go zwykle nie ma sensu, w dev-client / standalone tak
  if (ownership !== "expo") {
    try {
      const native = await Notifications.getDevicePushTokenAsync();
      const nativeToken: any =
        (native as any)?.data ?? (native as any)?.token ?? null;

      if (typeof nativeToken === "string") {
        if (Platform.OS === "android") {
          // Dla Androida to będzie FCM
          fcmToken = nativeToken;
        } else if (Platform.OS === "ios") {
          // Dla iOS to będzie APNS
          apnsToken = nativeToken;
        }
      }
    } catch (e) {
      console.log("[PUSH] Error getting native device token", e);
    }
  }

  return { expoToken, fcmToken, apnsToken };
}

async function sendToBackend(userId: number, tokens: Tokens) {
  try {
    await fetch("https://meeton-backend-ffmo.onrender.com/api/push-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        token: tokens.expoToken,
        fcmToken: tokens.fcmToken,
        apnsToken: tokens.apnsToken,
        platform: Platform.OS,
        ownership: Constants.appOwnership,
        appVersion: (Constants as any)?.expoConfig?.version ?? null,
      }),
    });
  } catch (e) {
    console.log("[PUSH] Error sending tokens to backend", e);
  }
}

function shouldSendAgain(prev: any, next: Tokens) {
  return (
    prev?.expoToken !== next.expoToken ||
    prev?.fcmToken !== next.fcmToken ||
    prev?.apnsToken !== next.apnsToken
  );
}

/** Wołaj przy starcie aplikacji i po zalogowaniu. */
export async function registerPushToken(userId: number) {
  const granted = await askPermissions();
  if (!granted) {
    console.log("[PUSH] Permissions not granted");
    return;
  }

  const tokens = await getTokens();
  console.log("[PUSH] Current tokens:", tokens);

  const prevJson = await AsyncStorage.getItem(LAST_SENT_KEY);
  const prev = prevJson ? JSON.parse(prevJson) : null;

  if (!prev || shouldSendAgain(prev, tokens)) {
    await sendToBackend(userId, tokens);
    await AsyncStorage.setItem(LAST_SENT_KEY, JSON.stringify(tokens));
    console.log("[PUSH] Tokens sent to backend");
  } else {
    console.log("[PUSH] Tokens unchanged, not sending");
  }
}

/** Subskrypcja odświeżania tokenów – ustaw w App.tsx */
export function subscribeTokenRefresh(userId: number) {
  // Bez RN Firebase korzystamy z "recheck przy powrocie z tła"
  const appStateHandler = async (state: string) => {
    if (state === "active") {
      await registerPushToken(userId);
    }
  };

  const sub = AppState.addEventListener("change", appStateHandler);

  return () => {
    sub.remove();
  };
}
