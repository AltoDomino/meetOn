// ✅ DODAJ TE DWIE LINIE NA SAMĄ GÓRĘ
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

// app/_layout.tsx
import SplashScreenComponent from "@/components/SplashScreen";
import { usePersistentLocation } from "@/hooks/usePersistentLocation";
import { useBackExit } from "@/utilis/useBackExit";
import { useNotificationListener } from "@/utilis/useNotificationListener"; // ✅ zmienione
import * as Notifications from "expo-notifications";
import { Slot, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityProvider } from "../context/ActivityContext";
import { AuthProvider } from "../context/AuthContext";

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
    const sub1 = Notifications.addNotificationReceivedListener((n) => {
      console.log("🟢 [FOREGROUND] received:", JSON.stringify(n, null, 2));
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log(
        "🟣 [TAP/RESPONSE] notification response:",
        JSON.stringify(r, null, 2)
      );
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  useBackExit();
  usePersistentLocation();
  useNotifDebugLogs();
  useNotificationListener(); // ✅ teraz działa jako hook, a nie wywołanie w useEffect

  useEffect(() => {
    if (splashDone) {
      SplashScreen.hideAsync();
    }
  }, [splashDone]);

  if (!splashDone) {
    return <SplashScreenComponent onFinish={() => setSplashDone(true)} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ActivityProvider>
          <Slot />
        </ActivityProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
