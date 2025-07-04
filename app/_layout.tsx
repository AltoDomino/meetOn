import { useEffect, useState } from "react";
import { SplashScreen } from "expo-router";
import { Slot } from "expo-router";
import SplashScreenComponent from "@/SplashScreen";
import { AuthProvider } from "./context/AuthContext";
import { ActivityProvider } from "./context/ActivityContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
