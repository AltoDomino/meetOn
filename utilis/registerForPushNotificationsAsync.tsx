import { Platform, AppState } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Tokens = { expoToken: string | null; apnsToken: string | null };

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
  const projectId =
    (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  // ✅ Expo push token
  let expoToken: string | null = null;
  try {
    if (projectId) {
      const t = await Notifications.getExpoPushTokenAsync({ projectId });
      expoToken = t.data ?? null;
    }
  } catch (e) {
    console.warn("Expo token error", e);
  }

  // ✅ APNS token dla iOS
  let apnsToken: string | null = null;
  try {
    if (Platform.OS === "ios") {
      const native = await Notifications.getDevicePushTokenAsync();
      const nativeData: any = (native as any)?.data ?? (native as any)?.token ?? null;
      apnsToken = typeof nativeData === "string" ? nativeData : null;
    }
  } catch {}

  return { expoToken, apnsToken };
}

async function sendToBackend(userId: number, tokens: Tokens) {
  await fetch("https://meeton-backend-ffmo.onrender.com/api/push-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      token: tokens.expoToken,
      apnsToken: tokens.apnsToken,
      platform: Platform.OS,
      ownership: Constants.appOwnership,
      appVersion: (Constants as any)?.expoConfig?.version ?? null,
    }),
  }).catch(() => {});
}

function shouldSendAgain(prev: any, next: any) {
  return prev?.expoToken !== next.expoToken || prev?.apnsToken !== next.apnsToken;
}

/** Wołaj przy starcie aplikacji i po zalogowaniu. */
export async function registerPushToken(userId: number) {
  const granted = await askPermissions();
  if (!granted) return;

  const tokens = await getTokens();
  const prevJson = await AsyncStorage.getItem(LAST_SENT_KEY);
  const prev = prevJson ? JSON.parse(prevJson) : null;

  if (!prev || shouldSendAgain(prev, tokens)) {
    await sendToBackend(userId, tokens);
    await AsyncStorage.setItem(LAST_SENT_KEY, JSON.stringify(tokens));
  }
}

/** Subskrybuj odświeżanie tokenu i powrót aplikacji z tła */
export function subscribeTokenRefresh(userId: number) {
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
