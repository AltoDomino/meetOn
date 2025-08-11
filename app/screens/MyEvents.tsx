import { registerPushToken } from "@/utilis/registerForPushNotificatiionsAsync";
import SwitchButton from "@/utilis/SwitchButton";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "@/styles/MyEvents.styles";

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

export type Event = {
  spots: number;
  id: number;
  activity: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participantsCount: number;
  participants: {
    id: number;
    userName: string;
    avatar: string | null;
    description: string | null;
    age: number | null;
  }[];
  creator: {
    userName: string;
    avatar: string | null;
    description: string | null;
    age: number | null;
  };
};

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = useAuth();

  const fetchEvents = async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/events?userId=${userId}&ownOnly=true`
      );
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Błąd pobierania wydarzeń:", err);
    }
  };

  const handleJoin = (event: Event) => {
    router.push({
      pathname: "./MyEventRoom",
      params: {
        eventId: event.id.toString(),
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  useEffect(() => {
    if (!userId) return;
    registerPushToken(userId);
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
          <Text style={styles.locationText}>📍 {item.location}</Text>
          <Text style={styles.dateText}>🕒 {new Date(item.startDate).toLocaleString()}</Text>
          <Text style={styles.creatorText}>👤 Twórca: {item.creator.userName}</Text>
        </View>
        <View style={styles.participantsBox}>
          <Text style={styles.participantIcon}>👥</Text>
          <Text style={styles.participantCount}>
            {item.participantsCount}/{item.spots}
          </Text>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoin(item)}
          >
            <Text style={styles.joinButtonText}>PODGLĄD</Text>
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

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "MOJE WYDARZENIA",
          headerStyle: {
            backgroundColor: "#00A9F4",
          },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />

      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listHeader}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SwitchButton to="/(auth)/Event" label="INNE WYDARZENIA" />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Brak Twoich wydarzeń 😞
          </Text>
        }
      />
    </View>
  );
}
