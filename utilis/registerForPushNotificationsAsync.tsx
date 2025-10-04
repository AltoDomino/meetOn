import { Platform, AppState } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Typy tokenów
type Tokens = { expoToken: string | null; fcmToken: string | null; apnsToken: string | null };

const LAST_SENT_KEY = "lastSentPushTokens_v2";

// Inicjalizacja Firebase
const firebaseConfig = Constants.expoConfig?.extra?.firebase;
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const messaging = getMessaging(app);

async function askPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status === "granted";
}

async function getTokens(): Promise<Tokens> {
  const ownership = Constants.appOwnership; // 'expo' | 'standalone'
  const projectId =
    (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  // ✅ Expo token (do testów lub fallbacku)
  let expoToken: string | null = null;
  try {
    if (projectId) {
      const t = await Notifications.getExpoPushTokenAsync({ projectId });
      expoToken = t.data ?? null;
    }
  } catch {}

  // ✅ Firebase Cloud Messaging token
  let fcmToken: string | null = null;
  try {
    fcmToken = await getToken(messaging);
  } catch {}

  // ✅ APNS token (dla iOS)
  let apnsToken: string | null = null;
  try {
    if (Platform.OS === "ios") {
      const native = await Notifications.getDevicePushTokenAsync();
      const nativeData: any = (native as any)?.data ?? (native as any)?.token ?? null;
      apnsToken = typeof nativeData === "string" ? nativeData : null;
    }
  } catch {}

  return { expoToken, fcmToken, apnsToken };
}

async function sendToBackend(userId: number, tokens: Tokens) {
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
  }).catch(() => {});
}

function shouldSendAgain(prev: any, next: any) {
  return (
    prev?.expoToken !== next.expoToken ||
    prev?.fcmToken !== next.fcmToken ||
    prev?.apnsToken !== next.apnsToken
  );
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
  // 🔔 Foreground listener (np. pushy danych)
  const unsub = onMessage(messaging, async (message) => {
    console.log("Foreground message:", message);
  });

  // Recheck przy powrocie z tła
  const appStateHandler = async (state: string) => {
    if (state === "active") {
      await registerPushToken(userId);
    }
  };
  const sub = AppState.addEventListener("change", appStateHandler);

  return () => {
    unsub();
    sub.remove();
  };
}
