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
    const expoTokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "21c25dfa-afc4-4d4a-9ce3-3d1a809d4dfe",
    });

    const expoToken = expoTokenData.data;
    console.log("📨 Expo Push Token:", expoToken);

    const fcmTokenData = await Notifications.getDevicePushTokenAsync();
    const fcmToken = fcmTokenData.data;
    console.log("🔥 FCM Registration Token:", fcmToken);

    await fetch("https://meeton-backend-ffmo.onrender.com/api/push-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token: expoToken }),
    });
  } catch (error) {
    console.error("❌ Błąd podczas rejestracji tokena push:", error);
  }
};
