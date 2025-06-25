// utils/registerForPushNotificationsAsync.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync(userId: number) {
  if (!Device.isDevice) {
    console.log("📱 Is real device:", Device.isDevice);
    alert("Push notifications wymagają prawdziwego urządzenia!");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Nie uzyskano zgody na powiadomienia!");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("🟢 Token push:", token);
  console.log("📤 Wysyłanie tokena z userId:", userId);

  await fetch("http://192.168.1.26:3000/api/push-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, token }),
  });
}
