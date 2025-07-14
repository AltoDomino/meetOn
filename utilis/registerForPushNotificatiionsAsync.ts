import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// 👉 Konfiguracja kanału powiadomień — WYMAGANE dla Androida
Notifications.setNotificationChannelAsync("default", {
  name: "default",
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#FF231F7C",
});

export const registerPushToken = async (userId: number) => {
  if (!Device.isDevice) {
    alert("Push działa tylko na fizycznym urządzeniu!");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Brak zgody na powiadomienia");
    return;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    const token = tokenData.data;
    console.log("📨 Token push:", token);

    await fetch("https://meeton-backend-ffmo.onrender.com/api/push-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    });
  } catch (error) {
    console.error("❌ Błąd podczas rejestracji tokena push:", error);
  }
};
