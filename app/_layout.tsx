import { Slot, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ActivityProvider } from "./context/ActivityContext";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

const BACKEND_URL = "http://192.168.1.26:3000";

function InnerLayout() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

const checkUserStateAndRedirect = async () => {
  try {
    if (!userId) return;

    console.log("🔄 Sprawdzam wydarzenia...");

    // Sprawdź aktywne wydarzenia
    const eventRes = await fetch(`${BACKEND_URL}/api/event/joined?userId=${userId}`);
    const events = await eventRes.json();

    if (events.length > 0) {
      const event = events[0];
      console.log("➡️ Przekierowuję do wydarzenia:", event);
      router.replace({
        pathname: "/screens/LocalEventRoom",
        params: {
          eventId: event.id,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
        },
      });
      return;
    }

    // Jeśli nie ma wydarzeń → sprawdź zainteresowania
    console.log("🔍 Sprawdzam zainteresowania...");

    const interestsRes = await fetch(`${BACKEND_URL}/api/interests/${userId}`);
    const interests = await interestsRes.json();

    if (Array.isArray(interests) && interests.length === 0) {
      console.log("🧭 Brak zainteresowań → onboarding");
      router.replace("/(main)/HomeScreen");
    } else {
      console.log("✅ Zainteresowania są → ekran główny");
      router.replace("/(auth)/Event");
    }
  } catch (err) {
    console.error("❌ Błąd przekierowania:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (userId) {
      console.log("➡️ userId w InnerLayout:", userId);
   checkUserStateAndRedirect();
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}


export default function RootLayout() {
  return (
    <AuthProvider>
      <ActivityProvider>
        <InnerLayout />
      </ActivityProvider>
    </AuthProvider>
  );
}
