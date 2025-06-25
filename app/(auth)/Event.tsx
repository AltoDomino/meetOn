import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { registerForPushNotificationsAsync } from "@/utilis/registerForPushNotificatiionsAsync";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

type Event = {
  id: number;
  activity: string;
  location: string;
  startDate: string;
  endDate: string;
  creator: {
    userName: string;
  };
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();
  
useFocusEffect(
  useCallback(() => {
    fetchEvents(); // ← Twój fetch z wydarzeniami
  }, [])
);
  const fetchEvents = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://192.168.1.26:3000/api/events?userId=${userId}`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Błąd pobierania wydarzeń:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync(userId);

    fetchEvents().finally(() => setLoading(false));
  }, [userId]);

  const handleRefresh = async () => {
    if (!userId) return;

    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/screens/EventScreenRoom",
          params: {
            location: item.location,
            startDate: item.startDate,
            endDate: item.endDate,
          },
        })
      }
    >
      <Text style={styles.title}>{item.activity}</Text>
      <Text>📍 {item.location}</Text>
      <Text>🕒 {new Date(item.startDate).toLocaleString()}</Text>
      <Text>👤 Twórca: {item.creator.userName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#666" }}>
          Brak aktualnych wydarzeń w pobliżu 😞
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});
