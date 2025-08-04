import { registerPushToken } from "@/utilis/registerForPushNotificatiionsAsync";
import SwitchButton from "@/utilis/SwitchButton";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  const [distanceFilter, setDistanceFilter] = useState<{ min: number; max: number }>({ min: 0, max: 30 });
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const { userId, hasChosenActivities } = useAuth();
  const { location, startDate, endDate } = useLocalSearchParams();
  const { activities } = useActivity();

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Brak dostępu do lokalizacji");
          return;
        }
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocationCoords({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
      } catch {
        Alert.alert("Błąd", "Nie udało się pobrać lokalizacji.");
      }
    };
    requestLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkIfAlreadyInEvent = async () => {
        if (!userId) return;
        console.log("📲 [checkIfAlreadyInEvent] userId:", userId);
        try {
          const res = await fetch(`${BACKEND_URL}/api/event/joined?userId=${userId}`);
          const events = await res.json();
          console.log("📡 Otrzymane events z backendu:", events);
          const joinedEvent = events.find(
            (e: Event) => e.isUserJoined && !e.isCreator
          );
          if (joinedEvent) {
            console.log("🔁 Przekierowuję do pokoju wydarzenia:", joinedEvent.id);
            router.replace({
              pathname: "/screens/LocalEventRoom",
              params: {
                eventId: joinedEvent.id.toString(),
                location: joinedEvent.location,
                startDate: joinedEvent.startDate,
                endDate: joinedEvent.endDate,
              },
            });
          }
        } catch (e) {
          console.warn("Błąd przy sprawdzaniu eventu:", e);
        }
      };

      checkIfAlreadyInEvent();
    }, [userId])
  );

  const fetchEvents = async () => {
    if (!userId || !locationCoords) return;
    try {
      let url = `${BACKEND_URL}/api/events?userId=${userId}&minDistance=${distanceFilter.min}&distance=${distanceFilter.max}&latitude=${locationCoords.latitude}&longitude=${locationCoords.longitude}`;
      const res = await fetch(url);
      const data = await res.json();
      const now = new Date();
      const upcomingEvents = data.filter((event: Event) => new Date(event.endDate) > now);
      setEvents(upcomingEvents);
    } catch {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem.");
    }
  };

  const fetchEventParticipants = async (eventId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/participants?eventId=${eventId}`);
      const data = await res.json();
      setSelectedParticipants(data);
      setModalVisible(true);
    } catch (err) {
      Alert.alert("Błąd", "Nie udało się pobrać uczestników wydarzenia.");
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
        Alert.alert("Dołączono do wydarzenia");
        fetchEvents();
        router.push({
          pathname: "/screens/LocalEventRoom",
          params: { eventId, location, startDate, endDate },
        });
      } else {
        const err = await res.json();
        Alert.alert("Nie możesz dołączyć", err.error || "Błąd serwera");
      }
    } catch {
      Alert.alert("Błąd", "Wystąpił problem z serwerem");
    }
  };

  const renderItem = ({ item }: { item: Event }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.eventInfo}>
          <Text style={styles.title}>{item.activity}</Text>
          <Text>📍 {item.location}</Text>
          <Text>🕒 {new Date(item.startDate).toLocaleDateString()} {new Date(item.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
          <Text>🔚 {new Date(item.endDate).toLocaleDateString()} {new Date(item.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
          <Text>👤 Twórca: {item.creator?.userName ?? "Nieznany"}</Text>
        </View>
        <View style={styles.participantsBox}>
          <Text style={styles.participantIcon}>👥</Text>
          <Text style={styles.participantCount}>{item.participantsCount}/{item.spots}</Text>
          <TouchableOpacity
            onPress={() => {
              if (item.isUserJoined || item.isCreator) {
                router.push({
                  pathname: item.isCreator ? "/screens/MyEventRoom" : "/screens/LocalEventRoom",
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
              {item.isUserJoined || item.isCreator ? "PODGLĄD" : "DOŁĄCZ"}
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
          {[{ label: "0–30 km", min: 0, max: 30 }, { label: "30–100 km", min: 30, max: 100 }, { label: "100+ km", min: 100, max: 9999 }].map(({ label, min, max }) => (
            <TouchableOpacity key={label} onPress={() => setDistanceFilter({ min, max })}>
              <Text style={{
                backgroundColor: distanceFilter.min === min && distanceFilter.max === max ? "#007AFF" : "#ccc",
                color: distanceFilter.min === min && distanceFilter.max === max ? "#fff" : "#000",
                padding: 8,
                borderRadius: 8,
              }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshing={refreshing}
          ListEmptyComponent={<Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginTop: 10 }}>Brak aktualnych wydarzeń w pobliżu 😞</Text>}
        />
      )}
    </View>
  );
}
