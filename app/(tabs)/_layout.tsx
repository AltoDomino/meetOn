import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import Login from "../(main)/Login";
import { ActivityIndicator, View } from "react-native";

const BACKEND_URL = "http://192.168.1.26:3000";

export default function Index() {
  const { userId } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (userId === undefined) return; // poczekaj aż context się załaduje

    if (!userId) {
      setIsReady(true); // pokaż ekran logowania
      return;
    }

    const checkUserState = async () => {
      try {
        const eventRes = await fetch(`${BACKEND_URL}/api/event/joined?userId=${userId}`);
        const events = await eventRes.json();

        if (events.length > 0) {
          const event = events[0];
          router.replace({
            pathname: "/screens/LocalEventRoom",
            params: {
              eventId: event.id,
              location: event.location,
              startDate: event.startDate,
              endDate: event.endDate,
            },
          });
        } else {
          const interestsRes = await fetch(`${BACKEND_URL}/api/interests/${userId}`);
          const interests = await interestsRes.json();

          if (!interests || interests.length === 0) {
            router.replace("/(main)/HomeScreen");
          } else {
            router.replace("/(auth)/Event");
          }
        }
      } catch (err) {
        console.error("❌ Błąd podczas przekierowania:", err);
        setIsReady(true); // pokaż login, jeśli coś się wywali
      }
    };

    checkUserState();
  }, [userId]);
useEffect(() => {
  console.log("🔑 AuthContext loaded:", userId);
}, [userId]);
  if (userId === undefined || !isReady && !userId) {
    // czekamy na załadowanie kontekstu
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Login />;
}
