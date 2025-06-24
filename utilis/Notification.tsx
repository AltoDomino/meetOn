import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import fetchNotifications from "./fetchNotification";
import { styles } from "@/app/styles/notification.styles";

type Notification = {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
};

const Notifications = () => {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchNotifications(userId!);
      setNotifications(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Powiadomienia</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default Notifications;
