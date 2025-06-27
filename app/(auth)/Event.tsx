import { registerForPushNotificationsAsync } from "@/utilis/registerForPushNotificatiionsAsync";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/Event.styles";
import { router, useLocalSearchParams } from "expo-router";

const BACKEND_URL = "http://192.168.1.26:3000";

export type Event = {
  spots: number;
  id: number;
  activity: string;
  location: string;
  startDate: string;
  endDate: string;
  creator: {
    userName: string;
  };
  participantsCount: number;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = useAuth();
    const { location, startDate, endDate } =
      useLocalSearchParams();
  

  const fetchEvents = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/events?userId=${userId}`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Błąd pobierania wydarzeń:", err);
    }
  };

  const joinEvent = async (eventId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/join/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eventId }),
      });
      if (res.ok) {
        Alert.alert("Sukces", "Dołączono do wydarzenia");
        fetchEvents();
            router.push({
              pathname: "/screens/EventScreenRoom",
              params: {
                location: location,
                startDate: startDate,
                endDate: endDate,
              },
            })
        
        
      } else {
        const err = await res.json();
        Alert.alert("Błąd", err.error || "Nie udało się dołączyć");
      }
    } catch (error) {
      console.error("Błąd dołączania:", error);
      Alert.alert("Błąd", "Wystąpił problem z serwerem");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

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
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.eventInfo}>
          <Text style={styles.title}>{item.activity}</Text>
          <Text>📍 {item.location}</Text>
          <Text>🕒 {new Date(item.startDate).toLocaleString()}</Text>
          <Text>👤 Twórca: {item.creator.userName}</Text>
        </View>

        <View style={styles.participantsBox}>
          <Text style={styles.participantIcon}>👥</Text>
          <Text style={styles.participantCount}>
            {item.participantsCount}/{item.spots}
          </Text>
      

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => joinEvent(item.id)}
      >
        <Text style={styles.joinButtonText}>Dołącz</Text>
      </TouchableOpacity> 
      </View>
      </View>
    </View>
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
