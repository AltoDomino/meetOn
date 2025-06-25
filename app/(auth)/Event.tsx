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

export default function NearbyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
    const { userId } = useAuth();
  
    useEffect(() => {
       console.log(userId,"token user id")
      if (userId) {
        registerForPushNotificationsAsync(userId);
       
      }
    }, [userId]);


  useEffect(() => {
    fetch("http://192.168.1.26:3000/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        console.log(data,"MIEJSCA DO KAFELKOW")
      })
      .catch((err) => {
        console.error("Błąd pobierania wydarzeń:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/screens/EventScreen",
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
