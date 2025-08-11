// app/_layout.tsx
import SplashScreenComponent from "@/components/SplashScreen";
import { useBackExit } from "@/utilis/useBackExit";
import { Slot, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityProvider } from "../context/ActivityContext";
import { AuthProvider } from "../context/AuthContext";
import { usePersistentLocation } from "@/hooks/usePersistentLocation";
import * as Notifications from "expo-notifications";

// Globalny handler dla powiadomień (Android/iOS)
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

// Tymczasowe logi diagnostyczne (usuń po testach)
function useNotifDebugLogs() {
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener((n) => {
      console.log("🟢 [FOREGROUND] received:", JSON.stringify(n, null, 2));
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log("🟣 [TAP/RESPONSE] notification response:", JSON.stringify(r, null, 2));
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
  useNotifDebugLogs(); // 🔊 logi powiadomień

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
