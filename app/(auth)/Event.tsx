import { registerPushToken } from "@/utilis/registerForPushNotificationsAsync";
import SwitchButton from "@/utilis/SwitchButton";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import { useActivity } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Event.styles";
import { backend_URL } from "@/backendURL";

import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const UNLIMITED_RADIUS = 9999;

// ⏳ ile maksymalnie czekamy na reklamę po "DOŁĄCZ" (czas widoczny jako "ŁĄCZENIE…")
const MAX_AD_WAIT_MS = 6500;

export type Event = {
  spots: number;
  id: number;
  activity: string;
  location: string;
  startDate: string;
  endDate: string;
  creator: { id: number | null; userName: string };
  participantsCount: number;
  // ⬇️ czasem backend potrafi zwrócić "true"/"false" jako string
  isUserJoined: boolean | string;
  isCreator: boolean | string;
};

type DistOption = { label: string; min: number; max: number };

const DISTANCES: DistOption[] = [
  { label: "0–30 km", min: 0, max: 30 },
  { label: "30–100 km", min: 30, max: 100 },
  { label: "100+ km", min: 100, max: UNLIMITED_RADIUS },
];

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-4590930660721541/1086406483";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

// mała pomoc: normalizacja booleanów (true/false lub "true"/"false")
const toBool = (v: any) => v === true || v === "true";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [distanceFilter, setDistanceFilter] = useState<{ min: number; max: number }>(
    { min: 0, max: 30 }
  );

  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const { userId, hasChosenActivities, token } = useAuth();
  const { activities } = useActivity();

  const [adLoaded, setAdLoaded] = useState(false);

  // ✅ blokada wieloklików na "DOŁĄCZ" per event
  const [joiningIds, setJoiningIds] = useState<Set<number>>(new Set());
  const markJoining = (id: number) =>
    setJoiningIds((prev) => new Set(prev).add(id));
  const unmarkJoining = (id: number) =>
    setJoiningIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const pendingJoinRef = useRef<{
    eventId: number;
    location: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  const currentLabel = useMemo(() => {
    const opt = DISTANCES.find(
      (d) => d.min === distanceFilter.min && d.max === distanceFilter.max
    );
    return opt?.label ?? "";
  }, [distanceFilter]);

  const radiusKm = useMemo(() => {
    if (distanceFilter.max === UNLIMITED_RADIUS) return UNLIMITED_RADIUS;
    return distanceFilter.max;
  }, [distanceFilter]);

  // ✅ helper: czekaj na reklamę maksymalnie X ms (czas idzie na "ŁĄCZENIE…")
  const waitForAd = useCallback(
    (ms: number) =>
      new Promise<boolean>((resolve) => {
        if (adLoaded) return resolve(true);

        let done = false;

        const timeout = setTimeout(() => {
          if (!done) {
            done = true;
            resolve(false);
          }
        }, ms);

        const interval = setInterval(() => {
          if (adLoaded && !done) {
            done = true;
            clearTimeout(timeout);
            clearInterval(interval);
            resolve(true);
          }
        }, 100);
      }),
    [adLoaded]
  );

  // ✅ Interstitial listeners + preload
  useEffect(() => {
    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
    });

    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      interstitial.load();

      const pending = pendingJoinRef.current;
      if (pending) {
        pendingJoinRef.current = null;

        // (opcja) odblokuj join po przejściu (jakby user wrócił szybko)
        unmarkJoining(pending.eventId);

        router.push({
          pathname: "/screens/LocalEventRoom",
          params: {
            eventId: pending.eventId,
            location: pending.location,
            startDate: pending.startDate,
            endDate: pending.endDate,
          },
        });
      }
    });

    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      setAdLoaded(false);
      // spróbuj przeładować kolejną reklamę
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📍 Lokalizacja (z fallbackiem)
  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Brak dostępu do lokalizacji");
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert(
            "Lokalizacja wyłączona",
            "Włącz usługi lokalizacji (GPS), aby wyświetlać wydarzenia w pobliżu.",
            [
              { text: "OK" },
              { text: "Ustawienia", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }

        let userLocation: Location.LocationObject | null = null;

        try {
          userLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 1000,
            distanceInterval: 0,
          });
        } catch {
          // ignore -> fallback
        }

        if (!userLocation) {
          const last = await Location.getLastKnownPositionAsync({});
          if (last) {
            userLocation = { coords: last.coords, timestamp: last.timestamp } as any;
          }
        }

        if (!userLocation) {
          Alert.alert(
            "Nie udało się pobrać lokalizacji",
            "Upewnij się, że masz włączony GPS i spróbuj ponownie.",
            [
              { text: "OK" },
              { text: "Ustawienia", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }

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
          const res = await fetch(`${backend_URL}/api/event/joined?userId=${userId}`);
          const list = await res.json();
          const joinedEvent = list.find((e: Event) => toBool(e.isUserJoined) && !toBool(e.isCreator));

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
        } catch {
          // ignore
        }
      };

      checkIfAlreadyInEvent();
    }, [userId])
  );

  // ✅ FETCH EVENTS (z filtrowaniem po aktywnościach + normalizacja booleanów)
  const fetchEvents = useCallback(async () => {
    if (!userId || !locationCoords) return;

    if (!activities || activities.length === 0) {
      setEvents([]);
      return;
    }

    try {
      const url = `${backend_URL}/api/events?userId=${userId}&minDistance=${distanceFilter.min}&distance=${distanceFilter.max}&latitude=${locationCoords.latitude}&longitude=${locationCoords.longitude}`;
      const res = await fetch(url);
      const data = await res.json();

      const now = new Date();
      const upcomingEvents = (data as Event[]).filter(
        (event) => new Date(event.endDate) > now
      );

      const filtered = upcomingEvents.filter((event) =>
        activities.includes(event.activity)
      );

      // ✅ normalizacja booleans (żeby nie było "PODGLĄD" od stringa "false")
      const normalized = filtered.map((e) => ({
        ...e,
        isCreator: toBool(e.isCreator),
        isUserJoined: toBool(e.isUserJoined),
      }));

      setEvents(normalized);
    } catch {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem.");
    }
  }, [userId, locationCoords, distanceFilter.min, distanceFilter.max, activities]);

  useEffect(() => {
    if (!userId || !locationCoords) return;

    if (!hasChosenActivities) {
      router.replace("/(main)/HomeScreen");
      return;
    }

    setLoading(true);
    registerPushToken(userId);
    fetchEvents().finally(() => setLoading(false));
  }, [userId, locationCoords, distanceFilter, activities, hasChosenActivities, fetchEvents]);

  useFocusEffect(
    useCallback(() => {
      if (!userId || !locationCoords) return;
      fetchEvents();
    }, [userId, locationCoords, fetchEvents])
  );

  // ✅ JOIN + czekanie dłużej na reklamę (czas "ŁĄCZENIE…" idzie na doładowanie)
  const joinEvent = async (item: Event) => {
    if (!userId) return;

    // blokada wieloklików
    if (joiningIds.has(item.id)) return;

    markJoining(item.id);

    try {
      const res = await fetch(`${backend_URL}/api/join/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eventId: item.id }),
      });

      if (res.ok) {
        // odśwież listę (backend może zwrócić isUserJoined=true)
        fetchEvents();

        pendingJoinRef.current = {
          eventId: item.id,
          location: item.location,
          startDate: item.startDate,
          endDate: item.endDate,
        };

        // 🔥 zawsze spróbuj poczekać na reklamę trochę dłużej
        await waitForAd(MAX_AD_WAIT_MS);

        if (adLoaded) {
          interstitial.show();
        } else {
          // reklama nie zdążyła się załadować → idź od razu
          const pending = pendingJoinRef.current;
          pendingJoinRef.current = null;

          if (pending) {
            // odblokuj, gdyby user wrócił bez wejścia
            unmarkJoining(pending.eventId);

            router.push({
              pathname: "/screens/LocalEventRoom",
              params: {
                eventId: pending.eventId,
                location: pending.location,
                startDate: pending.startDate,
                endDate: pending.endDate,
              },
            });
          }
        }
      } else {
        const err = await res.json();
        Alert.alert("Nie możesz dołączyć", err.error || "Błąd serwera");
        unmarkJoining(item.id);
      }
    } catch {
      Alert.alert("Błąd", "Wystąpił problem z serwerem");
      unmarkJoining(item.id);
    }
  };

  const saveNotifyPrefs = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${backend_URL}/api/users/${userId}/notification-prefs`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          notificationRadiusKm: radiusKm,
          customNotifyEnabled: false,
          customNotifyLat: null,
          customNotifyLng: null,
        }),
      });

      if (!res.ok) throw new Error();

      setSaveMsg(`Powiadomienia dla zakresu ${currentLabel} zostały zapisane ✅`);
      setTimeout(() => setSaveMsg(null), 2500);
    } catch {
      Alert.alert("Błąd", "Nie udało się zapisać preferencji powiadomień.");
    }
  };

  const renderItem = ({ item }: { item: Event }) => {
    // ✅ tu już są booleany po normalizacji, ale zostawiamy czytelnie
    const isCreator = toBool(item.isCreator);
    const isJoined = toBool(item.isUserJoined);
    const isJoining = joiningIds.has(item.id);

    const isDisabled = isCreator || isJoined || isJoining;

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.eventInfo}>
            <Text style={styles.title}>{item.activity}</Text>
            <Text>📍 {item.location}</Text>
            <Text>
              🚀 {new Date(item.startDate).toLocaleDateString()}{" "}
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
              disabled={isDisabled}
              onPress={() => {
                if (isJoined || isCreator) {
                  router.push({
                    pathname: isCreator
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
                  joinEvent(item);
                }
              }}
              style={[
                styles.joinButton,
                // ✅ wyszarzenie w trakcie join (ładowanie reklamy + request)
                isJoining && { opacity: 0.45 },
              ]}
            >
              <Text style={styles.joinButtonText}>
                {isJoining
                  ? "ŁĄCZENIE…"
                  : isJoined || isCreator
                  ? "PODGLĄD"
                  : "DOŁĄCZ"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
          <SwitchButton to="/screens/MyEvents" label="MOJE WYDARZENIA" />

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
            const active = distanceFilter.min === min && distanceFilter.max === max;
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

              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/(auth)/CreateEvent")}
              >
                <Text style={styles.createButtonText}>STWÓRZ WYDARZENIE</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}
