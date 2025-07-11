import { registerPushToken } from "@/utilis/registerForPushNotificatiionsAsync";
import { setupNotificationListener } from "@/utilis/useNotificationListener";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Login from "../(main)/Login";
import { useAuth } from "../../context/AuthContext";

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

export default function Index() {
  const { userId } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const [notification, setNotification] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;

    registerPushToken(userId);

    // Obsługa niestandardowego modala
    const subscription = Notifications.addNotificationReceivedListener(
      (notif) => {
        setNotification(notif);
        setVisible(true);
      }
    );

    const unsubscribe = setupNotificationListener();
    return () => {
      subscription.remove();
      unsubscribe();
    };
  }, [userId]);

  // 🔍 Sprawdzanie stanu użytkownika (czy jest w wydarzeniu lub ma zainteresowania)
  useEffect(() => {
    if (userId === undefined) return;

    if (!userId) {
      setIsReady(true);
      return;
    }

    const checkUserState = async () => {
      try {
        const eventRes = await fetch(
          `${BACKEND_URL}/api/event/joined?userId=${userId}`
        );
        const events = await eventRes.json();

        if (events.length > 0) {
          const event = events[0];
          if (!event.isCreator) {
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
        }

        const interestsRes = await fetch(
          `${BACKEND_URL}/api/interests/${userId}`
        );
        const interests = await interestsRes.json();

        if (!interests || interests.length === 0) {
          router.replace("/(main)/HomeScreen");
        } else {
          router.replace("/(auth)/Event");
        }
      } catch (err) {
        console.error("❌ Błąd podczas przekierowania:", err);
        setIsReady(true);
      }
    };

    checkUserState();
  }, [userId]);

  if (userId === undefined || (!isReady && !userId)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Login />

      {/* === Custom powiadomienie === */}
      <Modal visible={visible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#0F2742",
              borderRadius: 20,
              padding: 20,
              width: "85%",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/startMeetOn.png")}
              style={{ width: 40, height: 40, marginBottom: 10 }}
            />
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
              meetOn
            </Text>
            <Text style={{ color: "white", fontSize: 18, marginTop: 10 }}>
              Nowe powiadomienie!
            </Text>
            <Text
              style={{
                color: "#CFCFCF",
                marginVertical: 10,
                textAlign: "center",
              }}
            >
              {notification?.request?.content?.body ||
                "Sprawdź lokalne wydarzenia, które mogą Cię zainteresować."}
            </Text>

            <Pressable
              onPress={() => {
                setVisible(false);
                router.push("/(auth)/Event");
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#3D5B8A",
                paddingHorizontal: 30,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                SPRAWDŹ
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
