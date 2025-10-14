import { registerPushToken } from "@/utilis/registerForPushNotificationsAsync";
import { useNotificationListener } from "@/utilis/useNotificationListener";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import React from "react";

export default function NotificationHandler() {
  const { userId } = useAuth();
  const router = useRouter();
  const [notification, setNotification] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;

    registerPushToken(userId);

    const subscription = Notifications.addNotificationReceivedListener(
      (notif) => {
        setNotification(notif);
        setVisible(true);
      }
    );

    useNotificationListener();

    return () => {
      subscription.remove();
    };
  }, [userId]);

  if (!visible) return null;

  return (
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
            source={require("@/assets/images/meetOn.png")}
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
            <Text style={{ color: "white", fontWeight: "bold" }}>SPRAWDŹ</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
