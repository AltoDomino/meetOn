import { registerPushToken } from "@/utilis/registerForPushNotificatiionsAsync";
import SwitchButton from "@/utilis/SwitchButton";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  creator: { id: number | null; userName: string };
  participantsCount: number;
  isUserJoined: boolean;
  isCreator: boolean;
};

type DistOption = { label: string; min: number; max: number };

const DISTANCES: DistOption[] = [
  { label: "0–30 km", min: 0, max: 30 },
  { label: "30–100 km", min: 30, max: 100 },
  { label: "100+ km", min: 100, max: 9999 },
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 30 });
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // banner “zapisano”
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const { userId, hasChosenActivities, token } = useAuth();
  const { location, startDate, endDate } = useLocalSearchParams();
  const { activities } = useActivity();

  const currentLabel = useMemo(() => {
    const opt = DISTANCES.find(
      (d) => d.min === distanceFilter.min && d.max === distanceFilter.max
    );
    return opt?.label ?? "";
  }, [distanceFilter]);

  // mapowanie zakresu na promień (km) do zapisania
  const radiusKm = useMemo(() => {
    if (distanceFilter.max === 9999) return 9999;
    return distanceFilter.max; // 30 lub 100
  }, [distanceFilter]);

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
        try {
          const res = await fetch(
            `${BACKEND_URL}/api/event/joined?userId=${userId}`
          );
          const events = await res.json();
          const joinedEvent = events.find(
            (e: Event) => e.isUserJoined && !e.isCreator
          );
          if (joinedEvent) {
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
      const url = `${BACKEND_URL}/api/events?userId=${userId}&minDistance=${distanceFilter.min}&distance=${distanceFilter.max}&latitude=${locationCoords.latitude}&longitude=${locationCoords.longitude}`;
      const res = await fetch(url);
      const data = await res.json();
      const now = new Date();
      const upcomingEvents = data.filter(
        (event: Event) => new Date(event.endDate) > now
      );
      setEvents(upcomingEvents);
    } catch {
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

  // 🔔 zapis preferencji powiadomień dla aktualnego zakresu
  const saveNotifyPrefs = async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/users/${userId}/notification-prefs`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), // 👈 autoryzacja JWT
          },
          body: JSON.stringify({
            notificationRadiusKm: radiusKm,
            customNotifyEnabled: false,
            customNotifyLat: null,
            customNotifyLng: null,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.warn("Save prefs failed:", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      setSaveMsg(
        `Powiadomienia dla zakresu ${currentLabel} zostały zapisane ✅`
      );
      setTimeout(() => setSaveMsg(null), 2500);
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się zapisać preferencji powiadomień.");
    }
  };

  const renderItem = ({ item }: { item: Event }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.eventInfo}>
          <Text style={styles.title}>{item.activity}</Text>
          <Text>📍 {item.location}</Text>
          <Text>
            🕒 {new Date(item.startDate).toLocaleDateString()}{" "}
            {new Date(item.startDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text>
            🔚 {new Date(item.endDate).toLocaleDateString()}{" "}
            {new Date(item.endDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
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
              {item.isUserJoined || item.isCreator ? "PODGLĄD" : "DOŁĄCZ"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.switchWrapper,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <SwitchButton to="/screens/MyEvents" label="TWOJE WYDARZENIA" />
          {/* 🔔 Dzwoneczek */}
          <TouchableOpacity
            onPress={saveNotifyPrefs}
            style={styles.bellButton}
            accessibilityLabel="Zapisz powiadomienia dla wybranego zakresu"
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {DISTANCES.map(({ label, min, max }) => {
            const active =
              distanceFilter.min === min && distanceFilter.max === max;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => setDistanceFilter({ min, max })}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Baner potwierdzający zapis */}
        {saveMsg ? (
          <View style={styles.saveBanner}>
            <Text style={styles.saveBannerText}>{saveMsg}</Text>
          </View>
        ) : null}
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
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchEvents().finally(() => setRefreshing(false));
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Brak aktualnych wydarzeń 😞</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
