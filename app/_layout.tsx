import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Slot, SplashScreen } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

import SplashScreenComponent from "@/components/SplashScreen";
import { usePersistentLocation } from "@/hooks/usePersistentLocation"; // ✅ teraz importujemy normalnie
import { useBackExit } from "@/utilis/useBackExit";
import { useNotificationListener } from "@/utilis/useNotificationListener";
import { ActivityProvider } from "../context/ActivityContext";
import { AuthProvider } from "../context/AuthContext";

enableScreens(false);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowInList: true,
    shouldShowList: true,
  }),
});

function useNotifDebugLogs() {
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener((n) =>
      console.log("🟢 [FOREGROUND] received:", JSON.stringify(n, null, 2))
    );
    const sub2 = Notifications.addNotificationResponseReceivedListener((r) =>
      console.log("🟣 [TAP/RESPONSE]:", JSON.stringify(r, null, 2))
    );
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);
}

async function checkLocationPermission() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Dostęp do lokalizacji wymagany 🌍",
          "Aby aplikacja mogła pokazywać wydarzenia w pobliżu, włącz dostęp do lokalizacji w ustawieniach.",
          [
            {
              text: "Otwórz ustawienia",
              onPress: () => Linking.openSettings(),
            },
            { text: "Anuluj", style: "cancel" },
          ]
        );
      }
    }
  } catch (err) {
    console.warn("⚠️ Błąd sprawdzania uprawnień lokalizacji:", err);
  }
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  useBackExit();
  useNotifDebugLogs();
  useNotificationListener();
  usePersistentLocation(); // ✅ TERAZ hook wywołujemy tu, poprawnie w komponencie
  useEffect(() => {
    if (splashDone) checkLocationPermission();
  }, [splashDone]);

  useEffect(() => {
    if (splashDone) {
      setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 400);
    }
  }, [splashDone]);

  if (!splashDone) {
    return <SplashScreenComponent onFinish={() => setSplashDone(true)} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ActivityProvider>
            <Slot />
          </ActivityProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
