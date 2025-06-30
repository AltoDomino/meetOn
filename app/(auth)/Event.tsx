import { registerForPushNotificationsAsync } from "@/utilis/registerForPushNotificatiionsAsync";
import SwitchButton from "@/utilis/SwitchButton";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useActivity } from "../context/ActivityContext";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/Event.styles";

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
  isUserJoined: boolean;
  isCreator: boolean;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = useAuth();
  const { location, startDate, endDate } = useLocalSearchParams();
  const { activities } = useActivity();
  useEffect(() => {
    const checkIfAlreadyInEvent = async () => {
      if (!userId) return;

      try {
        const res = await fetch(
          `${BACKEND_URL}/api/event/joined?userId=${userId}`
        );
        const events = await res.json();

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
        }
      } catch (error) {
        console.error(
          "❌ Błąd przy automatycznym przekierowaniu z /screens/Events:",
          error
        );
      }
    };

    checkIfAlreadyInEvent();
  }, [userId]);
  const fetchEvents = async (): Promise<void> => {
    if (!userId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/events?userId=${userId}`);
      const data = await res.json();
      setEvents(data);
      console.log(data, ",wydarzenia ktore przychodzą");
    } catch (err) {
      console.error("Błąd pobierania wydarzeń:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    registerForPushNotificationsAsync(userId);
    fetchEvents().finally(() => setLoading(false));
  }, [userId]);

  // ⬇️ Automatyczne odświeżenie po zmianie aktywności
  useEffect(() => {
    if (userId) fetchEvents();
  }, [activities]);

  // ⬇️ Odświeżanie przy focusie + aktywności
  useFocusEffect(
    useCallback(() => {
      if (userId) fetchEvents();
    }, [activities])
  );

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
          pathname: "/screens/LocalEventRoom",
          params: {
            eventId,
            location,
            startDate,
            endDate,
          },
        });
      } else {
        const err = await res.json();
        Alert.alert("Błąd", err.error || "Nie udało się dołączyć");
      }
    } catch (error) {
      console.error("Błąd dołączania:", error);
      Alert.alert("Błąd", "Wystąpił problem z serwerem");
    }
  };

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

          {item.isUserJoined || item.isCreator ? (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: item.isCreator
                    ? "/screens/MyEventRoom"
                    : "/screens/LocalEventRoom", // 🔹 różnicuj pokój
                  params: {
                    eventId: item.id,
                    location: item.location,
                    startDate: item.startDate,
                    endDate: item.endDate,
                  },
                })
              }
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>Zobacz</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => joinEvent(item.id)}
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>Dołącz</Text>
            </TouchableOpacity>
          )}
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
        <SwitchButton to="/screens/MyEvents" label="Twoje wydarzenia" />
        <Text style={{ fontSize: 16, color: "#666", marginTop: 10 }}>
          Brak aktualnych wydarzeń w pobliżu 😞
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, backgroundColor: "#f0f0f0" }}>
        <SwitchButton to="/screens/MyEvents" label="Twoje wydarzenia" />
      </View>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text
            style={{
              fontSize: 16,
              color: "#666",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Brak aktualnych wydarzeń w pobliżu 😞
          </Text>
        }
      />
    </View>
  );
}
