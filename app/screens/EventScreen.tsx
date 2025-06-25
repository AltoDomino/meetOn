import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { registerForPushNotificationsAsync } from '@/utilis/registerForPushNotificatiionsAsync';
import { useAuth } from "../context/AuthContext";

export type EventParams = {
  location: string;
  startDate: string; 
  endDate: string; 
};

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const router = useRouter();

  const renderItem = ({
    item,
  }: {
    item: EventParams & {
      id: number;
      activity: string;
      creator: { userName: string };
    };
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(auth)/Event",
          params: {
            location: item.location,
            startDate: item.startDate,
            endDate: item.endDate,
            // inne parametry
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
});
