import { registerPushToken } from "@/utilis/registerForPushNotificatiionsAsync";
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
import { useActivity } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Event.styles";

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

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
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const { userId, hasChosenActivities } = useAuth();
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
          }
        }
      } catch (error) {
        console.error("❌ Błąd przy sprawdzaniu aktywnego wydarzenia:", error);
      }
    };

    checkIfAlreadyInEvent();
  }, [userId]);

  const fetchEvents = async (): Promise<void> => {
    if (!userId) return;
    try {
      let url = `${BACKEND_URL}/api/events?userId=${userId}`;
      if (distanceFilter) {
        url += `&distance=${distanceFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Błąd pobierania wydarzeń:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    if (!hasChosenActivities) {
      router.replace("/(main)/HomeScreen");
      return;
    }

    setLoading(true);
    registerPushToken(userId);
    fetchEvents().finally(() => setLoading(false));
  }, [userId, distanceFilter]);

  useEffect(() => {
    if (userId && activities.length > 0) fetchEvents();
  }, [activities]);

  useFocusEffect(
    useCallback(() => {
      if (userId && activities.length > 0) fetchEvents();
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
        let message = err.error || "Nie udało się dołączyć do wydarzenia.";

        if (message.includes("mężczyzn")) {
          message = "Brak miejsc dla mężczyzn. Wydarzenie ma równy podział płci.";
        } else if (message.includes("kobiet")) {
          message = "Brak miejsc dla kobiet. Wydarzenie ma równy podział płci.";
        } else if (message.includes("Brak miejsc w wydarzeniu")) {
          message = "Wszystkie miejsca w wydarzeniu są już zajęte.";
        } else if (message.includes("Użytkownik już dołączył")) {
          message = "Już jesteś uczestnikiem tego wydarzenia.";
        }

        Alert.alert("Nie możesz dołączyć", message);
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
                    : "/screens/LocalEventRoom",
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

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, backgroundColor: "#f0f0f0" }}>
        <SwitchButton to="/screens/MyEvents" label="Twoje wydarzenia" />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 16,
          }}
        >
          <TouchableOpacity onPress={() => setDistanceFilter(30)}>
            <Text
              style={{
                backgroundColor: distanceFilter === 30 ? "#007AFF" : "#ccc",
                color: distanceFilter === 30 ? "#fff" : "#000",
                padding: 8,
                borderRadius: 8,
              }}
            >
              5–30 km
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDistanceFilter(50)}>
            <Text
              style={{
                backgroundColor: distanceFilter === 50 ? "#007AFF" : "#ccc",
                color: distanceFilter === 50 ? "#fff" : "#000",
                padding: 8,
                borderRadius: 8,
              }}
            >
              30–50 km
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDistanceFilter(999)}>
            <Text
              style={{
                backgroundColor: distanceFilter === 999 ? "#007AFF" : "#ccc",
                color: distanceFilter === 999 ? "#fff" : "#000",
                padding: 8,
                borderRadius: 8,
              }}
            >
              50+ km
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
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
      )}
    </View>
  );
}
