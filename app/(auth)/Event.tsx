import { registerPushToken } from "@/utilis/registerForPushNotificatiionsAsync";
import SwitchButton from "@/utilis/SwitchButton";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
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
    id: number | null;
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
  const [distanceFilter, setDistanceFilter] = useState<number | null>(30);
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { userId, hasChosenActivities } = useAuth();
  const { location, startDate, endDate } = useLocalSearchParams();
  const { activities } = useActivity();

useEffect(() => {
  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("📋 Status lokalizacji:", status);

      if (status !== "granted") {
        Alert.alert("Brak dostępu do lokalizacji");
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };

      console.log("✅ Uzyskano lokalizację:", coords);
      setLocationCoords(coords);
    } catch (error) {
      console.error("❌ Błąd pobierania lokalizacji:", error);
      Alert.alert("Błąd", "Nie udało się pobrać lokalizacji.");
    }
  };

  requestLocation();
}, []);


  useEffect(() => {
    const checkIfAlreadyInEvent = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${BACKEND_URL}/api/event/joined?userId=${userId}`);
        const events = await res.json();
        if (events.length > 0 && !events[0].isCreator) {
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
        console.error("Błąd przy sprawdzaniu aktywnego wydarzenia:", error);
      }
    };
    checkIfAlreadyInEvent();
  }, [userId]);

  const fetchEvents = async (): Promise<void> => {
    if (!userId || !locationCoords) return;
    try {
      let url = `${BACKEND_URL}/api/events?userId=${userId}`;
      if (distanceFilter && locationCoords) {
        url += `&distance=${distanceFilter}`;
        url += `&latitude=${locationCoords.latitude}&longitude=${locationCoords.longitude}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data)) {
        Alert.alert("Błąd", "Nie udało się pobrać wydarzeń.");
        return;
      }
      const now = new Date();
      const upcomingEvents = data.filter((event: Event) => new Date(event.endDate) > now);
      setEvents(upcomingEvents);
    } catch (err) {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem.");
    }
  };

  useEffect(() => {
    if (!userId || !locationCoords) return;
    if (!hasChosenActivities) {
      router.replace("/(main)/HomeScreen");
      return;
    }
    setLoading(true);
    registerPushToken(userId);
    fetchEvents().finally(() => setLoading(false));
  }, [userId, distanceFilter, locationCoords]);

  useEffect(() => {
    if (userId && activities.length > 0 && locationCoords) fetchEvents();
  }, [activities, locationCoords]);

  useFocusEffect(
    useCallback(() => {
      if (userId && activities.length > 0 && locationCoords) fetchEvents();
    }, [activities, locationCoords])
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
        } else if (message.includes("Brak miejsc")) {
          message = "Wszystkie miejsca w wydarzeniu są już zajęte.";
        } else if (message.includes("już dołączył")) {
          message = "Już jesteś uczestnikiem tego wydarzenia.";
        }
        Alert.alert("Nie możesz dołączyć", message);
      }
    } catch (error) {
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
          <Text>👤 Twórca: {item.creator?.userName ?? "Nieznany"}</Text>
        </View>
        <View style={styles.participantsBox}>
          <Text style={styles.participantIcon}>👥</Text>
          <Text style={styles.participantCount}>
            {item.participantsCount}/{item.spots}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (item.isUserJoined || item.isCreator) {
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
                });
              } else {
                joinEvent(item.id);
              }
            }}
            style={styles.joinButton}
          >
            <Text style={styles.joinButtonText}>
              {item.isUserJoined || item.isCreator ? "Zobacz" : "Dołącz"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, backgroundColor: "#f0f0f0" }}>
        <SwitchButton to="/screens/MyEvents" label="Twoje wydarzenia" />
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 16 }}>
          {[30, 50, 999].map((value) => (
            <TouchableOpacity key={value} onPress={() => setDistanceFilter(value)}>
              <Text
                style={{
                  backgroundColor: distanceFilter === value ? "#007AFF" : "#ccc",
                  color: distanceFilter === value ? "#fff" : "#000",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                {value === 30 ? "0-30 km" : value === 50 ? "30–50 km" : "50+ km"}
              </Text>
            </TouchableOpacity>
          ))}
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
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginTop: 10 }}>
              Brak aktualnych wydarzeń w pobliżu 😞
            </Text>
          }
        />
      )}
    </View>
  );
}
