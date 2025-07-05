import SplashScreenComponent from "@/components/SplashScreen";
import { Slot, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityProvider } from "../context/ActivityContext";
import { AuthProvider } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

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
